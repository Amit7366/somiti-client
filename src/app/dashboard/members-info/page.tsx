"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardClock,
  Columns3,
  Download,
  LayoutGrid,
  List,
  MapPin,
  Pencil,
  Phone,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserPlus,
  UserRound,
  UserRoundX,
  Users,
} from "lucide-react";
import { RoleGate } from "@/components/RoleGate";
import { api, mediaUrl } from "@/lib/api";
import { useI18n } from "@/components/providers/I18nProvider";
import type { Area, Member } from "@/types";

const ALLOW = [
  "SUPER_ADMIN",
  "SOMITI_ADMIN",
  "SECRETARY",
  "BRANCH_MANAGER",
  "FIELD_OFFICER",
  "CASHIER",
] as const;

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

function toLocaleDigits(value: string | number, locale: string) {
  const raw = String(value);
  if (!locale.startsWith("bn")) return raw;
  return raw.replace(/\d/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

function formatDateParts(value: string | undefined, locale: string) {
  if (!value) return { date: "—", meta: "" };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { date: "—", meta: "" };
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const date = toLocaleDigits(`${dd}-${mm}-${yyyy}`, locale);
  const weekday = d.toLocaleDateString(locale.startsWith("bn") ? "bn-BD" : "en-US", {
    weekday: "short",
  });
  const time = d.toLocaleTimeString(locale.startsWith("bn") ? "bn-BD" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return { date, meta: `${weekday} / ${time}` };
}

function areaName(member: Member) {
  if (member.area && typeof member.area === "object") return member.area.name;
  return "";
}

function statusBadge(status: Member["status"], t: (k: string) => string) {
  if (status === "ACTIVE") {
    return "bg-emerald-500 text-white";
  }
  if (status === "INACTIVE") {
    return "bg-amber-500 text-white";
  }
  return "bg-rose-500 text-white";
}

function statusLabel(status: Member["status"], t: (k: string) => string) {
  if (status === "ACTIVE") return t("memberForm.active");
  if (status === "INACTIVE") return t("memberForm.inactive");
  return t("memberForm.closed");
}

function Avatar({ src, alt }: { src?: string; alt: string }) {
  if (!src) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-slate-200 bg-slate-50 text-slate-300">
        <UserRound size={20} />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={mediaUrl(src)}
      alt={alt}
      className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-slate-200"
    />
  );
}

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-[#f4f7fb] px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15";

export default function MembersInfoPage() {
  const { t, locale } = useI18n();
  const [members, setMembers] = useState<Member[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [areaId, setAreaId] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [draftSearch, setDraftSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);

  const loadStats = useCallback(async () => {
    try {
      const res = await api<Member[]>("/members");
      setAllMembers(res.data);
    } catch {
      setAllMembers([]);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (areaId) params.set("areaId", areaId);
      if (status) params.set("status", status);
      if (search.trim()) params.set("search", search.trim());
      const qs = params.toString() ? `?${params}` : "";
      const res = await api<Member[]>(`/members${qs}`);
      setMembers(res.data);
      setPage(1);
      setSelected([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("membersInfo.empty"));
    } finally {
      setLoading(false);
    }
  }, [areaId, status, search, t]);

  useEffect(() => {
    api<Area[]>("/areas")
      .then((res) => setAreas(res.data))
      .catch(() => setAreas([]));
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const source = allMembers.length ? allMembers : members;
    const total = source.length;
    const active = source.filter((m) => m.status === "ACTIVE").length;
    const pending = source.filter((m) => !m.signatureUrl || !m.photoUrl).length;
    const inactive = source.filter((m) => m.status === "INACTIVE" || m.status === "CLOSED").length;
    return { total, active, pending, inactive };
  }, [allMembers, members]);

  const pageCount = Math.max(1, Math.ceil(members.length / pageSize));
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return members.slice(start, start + pageSize);
  }, [members, page, pageSize]);

  const allPageSelected =
    pageItems.length > 0 && pageItems.every((m) => selected.includes(m._id));

  function onSearch(e: FormEvent) {
    e.preventDefault();
    setSearch(draftSearch);
  }

  function onReset() {
    setAreaId("");
    setStatus("");
    setDraftSearch("");
    setSearch("");
  }

  function toggleAllPage() {
    if (allPageSelected) {
      const ids = new Set(pageItems.map((m) => m._id));
      setSelected((prev) => prev.filter((id) => !ids.has(id)));
      return;
    }
    setSelected((prev) => Array.from(new Set([...prev, ...pageItems.map((m) => m._id)])));
  }

  function exportCsv() {
    const rows = [
      ["code", "name", "mobile", "status", "nid", "address", "joinDate"].join(","),
      ...members.map((m) =>
        [m.code, m.name, m.mobile, m.status, m.nid || "", (m.address || "").replace(/,/g, " "), m.joinDate]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "members-info.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const n = (v: number) => toLocaleDigits(v, locale);

  return (
    <RoleGate allow={[...ALLOW]}>
      <div className="-mx-1 space-y-5 rounded-[1.5rem] bg-[#f5f7fb] px-1 pb-4 pt-1 print:bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
              <Link href="/dashboard" className="font-medium hover:text-blue-700">
                {t("membersInfo.breadcrumbHome")}
              </Link>
              <span className="text-slate-300">/</span>
              <span className="font-medium">{t("chair.nav.members")}</span>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-blue-600">{t("membersInfo.title")}</span>
            </nav>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[1.7rem]">
                {t("membersInfo.pageHeading")}
              </h1>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                {t("membersInfo.registerBadge")}
              </span>
            </div>
          </div>

          <div className="grid w-full max-w-md grid-cols-2 gap-2 print:hidden sm:w-auto">
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Download size={15} />
              {t("membersInfo.export")}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Printer size={15} />
              {t("membersInfo.printReport")}
            </button>
            <Link
              href="/dashboard/create-member"
              className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700"
            >
              <UserPlus size={16} />
              {t("membersInfo.newMember")}
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {t("membersInfo.kpiTotal")}
                </p>
                <p className="mt-2 text-2xl font-extrabold text-slate-900">
                  {n(stats.total)} {t("membersInfo.persons")}
                </p>
                <p className="mt-2 text-xs font-semibold text-emerald-600">
                  {t("membersInfo.kpiTotalHint")}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users size={22} />
              </div>
            </div>
          </article>
          <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {t("membersInfo.kpiActive")}
                </p>
                <p className="mt-2 text-2xl font-extrabold text-emerald-700">
                  {n(stats.active)} {t("membersInfo.persons")}
                </p>
                <div className="mt-2 h-1.5 w-16 rounded-full bg-emerald-500" />
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck size={22} />
              </div>
            </div>
          </article>
          <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {t("membersInfo.kpiPending")}
                </p>
                <p className="mt-2 text-2xl font-extrabold text-blue-700">
                  {n(stats.pending)} {t("membersInfo.persons")}
                </p>
                <span className="mt-2 inline-flex rounded-full bg-blue-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
                  {t("membersInfo.kpiPendingBadge")}
                </span>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <ClipboardClock size={22} />
              </div>
            </div>
          </article>
          <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {t("membersInfo.kpiInactive")}
                </p>
                <p className="mt-2 text-2xl font-extrabold text-rose-700">
                  {n(stats.inactive)} {t("membersInfo.persons")}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-500">{t("membersInfo.kpiInactiveHint")}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <UserRoundX size={22} />
              </div>
            </div>
          </article>
        </div>

        <form
          onSubmit={onSearch}
          className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <SlidersHorizontal size={18} />
              </span>
              <h2 className="text-base font-extrabold text-slate-900">{t("membersInfo.filterTitle")}</h2>
            </div>
            <p className="text-xs font-medium text-slate-400">{t("membersInfo.filterHint")}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1.6fr_auto]">
            <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              {t("membersInfo.areaCenter")}
              <select className={fieldClass} value={areaId} onChange={(e) => setAreaId(e.target.value)}>
                <option value="">{t("membersInfo.allAreas")}</option>
                {areas.map((area) => (
                  <option key={area._id} value={area._id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              {t("membersInfo.status")}
              <select className={fieldClass} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">{t("membersInfo.allStatus")}</option>
                <option value="ACTIVE">{t("memberForm.active")}</option>
                <option value="INACTIVE">{t("memberForm.inactive")}</option>
                <option value="CLOSED">{t("memberForm.closed")}</option>
              </select>
            </label>
            <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              {t("membersInfo.searchLabel")}
              <span className="relative mt-1.5 block">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  className={`${fieldClass} !mt-0 pl-9`}
                  placeholder={t("membersInfo.searchPh")}
                  value={draftSearch}
                  onChange={(e) => setDraftSearch(e.target.value)}
                />
              </span>
            </label>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="inline-flex h-[42px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-4 text-sm font-bold text-white shadow-sm shadow-blue-600/25 transition hover:bg-blue-700"
              >
                <Search size={15} />
                {t("membersInfo.search")}
              </button>
              <button
                type="button"
                onClick={onReset}
                title={t("membersInfo.reset")}
                className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </form>

        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-base font-extrabold text-slate-900">{t("membersInfo.listTitle")}</h2>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                {n(members.length)} {t("membersInfo.persons")}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                <span className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-blue-700 shadow-sm">
                  <List size={14} />
                  {t("membersInfo.viewList")}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-slate-400">
                  <LayoutGrid size={14} />
                  {t("membersInfo.viewGrid")}
                </span>
              </div>
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                {t("membersInfo.perPage")}
                <select
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={10}>{n(10)}</option>
                  <option value={25}>{n(25)}</option>
                  <option value={50}>{n(50)}</option>
                </select>
              </label>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600"
              >
                <Columns3 size={14} />
                {t("membersInfo.columnLayout")}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#eef4ff] text-[11px] font-bold uppercase tracking-[0.05em] text-slate-600">
                  <th className="px-3 py-3.5 print:hidden">
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      onChange={toggleAllPage}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      aria-label={t("membersInfo.selectAll")}
                    />
                  </th>
                  <th className="px-3 py-3.5 whitespace-nowrap">{t("membersInfo.admissionDate")}</th>
                  <th className="px-3 py-3.5 min-w-[220px]">{t("membersInfo.memberDetails")}</th>
                  <th className="px-3 py-3.5 whitespace-nowrap">{t("membersInfo.memberCode")}</th>
                  <th className="px-3 py-3.5">{t("membersInfo.photo")}</th>
                  <th className="px-3 py-3.5 min-w-[170px]">{t("membersInfo.nomineeInfo")}</th>
                  <th className="px-3 py-3.5">{t("membersInfo.nomineePhoto")}</th>
                  <th className="px-3 py-3.5">{t("membersInfo.signature")}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-14 text-center text-slate-400">
                      {t("common.loading")}
                    </td>
                  </tr>
                ) : null}
                {!loading && members.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-14 text-center text-slate-400">
                      {t("membersInfo.empty")}
                    </td>
                  </tr>
                ) : null}
                {pageItems.map((member) => {
                  const primary = member.nominees?.[0];
                  const { date, meta } = formatDateParts(member.joinDate || member.createdAt, locale);
                  const checked = selected.includes(member._id);
                  return (
                    <tr key={member._id} className="border-t border-slate-100 align-top hover:bg-blue-50/30">
                      <td className="px-3 py-4 print:hidden">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setSelected((prev) =>
                              checked ? prev.filter((id) => id !== member._id) : [...prev, member._id]
                            )
                          }
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <p className="font-bold text-slate-800">{date}</p>
                        {meta ? <p className="mt-0.5 text-xs text-slate-400">{meta}</p> : null}
                      </td>
                      <td className="px-3 py-4">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/dashboard/members-info/${member._id}`}
                              className="text-[15px] font-extrabold text-[#1e3a8a] hover:underline"
                            >
                              {member.name}
                            </Link>
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${statusBadge(
                                member.status,
                                t
                              )}`}
                            >
                              {statusLabel(member.status, t)}
                            </span>
                          </div>
                          <p className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Phone size={12} />
                            {member.mobile}
                          </p>
                          {member.nid ? (
                            <p className="text-xs text-slate-500">NID: {member.nid}</p>
                          ) : null}
                          {member.address || areaName(member) ? (
                            <p className="flex items-start gap-1.5 text-xs text-slate-500">
                              <MapPin size={12} className="mt-0.5 shrink-0" />
                              <span>{areaName(member) || member.address}</span>
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <Link
                          href={`/dashboard/members-info/${member._id}`}
                          className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1 font-mono text-sm font-extrabold text-blue-700 ring-1 ring-blue-100"
                        >
                          {member.code}
                        </Link>
                        <Link
                          href={`/dashboard/members-info/${member._id}`}
                          className="mt-2 flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                        >
                          <Pencil size={12} />
                          {t("membersInfo.changeCode")}
                        </Link>
                      </td>
                      <td className="px-3 py-4">
                        <Avatar src={member.photoUrl} alt={member.name} />
                      </td>
                      <td className="px-3 py-4 text-xs text-slate-600">
                        {primary ? (
                          <div className="space-y-1">
                            <p className="font-bold text-slate-800">
                              {primary.name}
                              {primary.relation ? (
                                <span className="font-medium text-slate-400"> ({primary.relation})</span>
                              ) : null}
                            </p>
                            <p className="flex items-center gap-1.5">
                              <Phone size={12} />
                              {primary.mobile}
                            </p>
                            <p className="flex flex-wrap items-center gap-1.5">
                              <span className="text-slate-400">{t("membersInfo.share")}:</span>
                              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                                {toLocaleDigits(primary.sharePercent ?? 100, locale)}%
                              </span>
                            </p>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <Avatar src={primary?.photoUrl} alt={primary?.name || "nominee"} />
                      </td>
                      <td className="px-3 py-4">
                        <div className="space-y-1.5">
                          {member.signatureUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={mediaUrl(member.signatureUrl)}
                              alt={t("membersInfo.signature")}
                              className="h-11 w-[4.5rem] rounded-lg border border-slate-200 bg-white object-contain p-0.5"
                            />
                          ) : (
                            <div className="flex h-11 w-[4.5rem] items-center justify-center rounded-lg border border-dashed border-slate-200 text-[10px] font-semibold text-slate-400">
                              —
                            </div>
                          )}
                          {member.signatureUrl ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              <CheckCircle2 size={11} />
                              {t("membersInfo.verified")}
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                              {t("membersInfo.pending")}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3.5 text-sm print:hidden">
            <div className="flex flex-wrap items-center gap-2">
              <select className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                <option>{t("membersInfo.bulkAction")}</option>
              </select>
              <button
                type="button"
                disabled={!selected.length}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
              >
                {t("membersInfo.apply")} ({n(selected.length)})
              </button>
            </div>
            <p className="text-xs font-medium text-slate-500">
              {t("membersInfo.showing")
                .replace("{from}", n(members.length ? (page - 1) * pageSize + 1 : 0))
                .replace("{to}", n(Math.min(page * pageSize, members.length)))
                .replace("{total}", n(members.length))}
            </p>
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 disabled:opacity-40"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`min-w-8 rounded-lg px-2.5 py-1 text-xs font-bold ${
                    page === p ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600"
                  }`}
                >
                  {n(p)}
                </button>
              ))}
              {pageCount > 5 ? <span className="px-1 text-xs text-slate-400">…</span> : null}
              <button
                type="button"
                disabled={page >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-xs text-blue-800 print:hidden">
          <p className="font-medium">{t("membersInfo.syncHint")}</p>
          <p className="font-semibold text-blue-600/80">{t("membersInfo.engineVersion")}</p>
        </div>
      </div>
    </RoleGate>
  );
}
