"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  Filter,
  Printer,
  RefreshCw,
  Search,
  UserRound,
  Wallet,
} from "lucide-react";
import { RoleGate } from "@/components/RoleGate";
import { api } from "@/lib/api";
import { feeTypeKey, formatFeeDate, moneyBdt, toBnDigits } from "@/lib/fee";
import { useI18n } from "@/components/providers/I18nProvider";
import type { Area, FeeCollection, FeeSummary, FeeType, Member } from "@/types";

const ALLOW = [
  "SUPER_ADMIN",
  "SOMITI_ADMIN",
  "SECRETARY",
  "BRANCH_MANAGER",
  "FIELD_OFFICER",
  "CASHIER",
] as const;

const FEE_TYPES: FeeType[] = ["ADMISSION", "FORM", "SERVICE_CHARGE", "LATE", "OTHER"];

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-[#f4f7fb] px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15";

function typeBadge(type: FeeType) {
  if (type === "ADMISSION" || type === "FORM") return "bg-emerald-100 text-emerald-800";
  if (type === "SERVICE_CHARGE") return "bg-blue-100 text-blue-800";
  if (type === "LATE") return "bg-amber-100 text-amber-800";
  return "bg-violet-100 text-violet-800";
}

function memberOf(fee: FeeCollection): Member | null {
  return fee.member && typeof fee.member === "object" ? fee.member : null;
}

export default function FeeCollectionsPage() {
  const { t, locale } = useI18n();
  const [fees, setFees] = useState<FeeCollection[]>([]);
  const [summary, setSummary] = useState<FeeSummary | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [areaId, setAreaId] = useState("");
  const [feeType, setFeeType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [draftSearch, setDraftSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ status: "COMPLETED" });
      if (areaId) params.set("areaId", areaId);
      if (feeType) params.set("feeType", feeType);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (search.trim()) params.set("search", search.trim());
      const [listRes, sumRes] = await Promise.all([
        api<FeeCollection[]>(`/fees?${params}`),
        api<FeeSummary>("/fees/summary"),
      ]);
      setFees(listRes.data);
      setSummary(sumRes.data);
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("fee.loadFailed"));
      setFees([]);
    } finally {
      setLoading(false);
    }
  }, [areaId, feeType, from, to, search, t]);

  useEffect(() => {
    api<Area[]>("/areas")
      .then((res) => setAreas(res.data))
      .catch(() => setAreas([]));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pageCount = Math.max(1, Math.ceil(fees.length / pageSize));
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return fees.slice(start, start + pageSize);
  }, [fees, page, pageSize]);

  const pageTotals = useMemo(() => {
    return pageItems.reduce(
      (acc, f) => ({
        fee: acc.fee + (f.feeAmount || 0),
        stamp: acc.stamp + (f.stampFee || 0),
        other: acc.other + (f.otherFee || 0),
        total: acc.total + (f.totalAmount || 0),
      }),
      { fee: 0, stamp: 0, other: 0, total: 0 }
    );
  }, [pageItems]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    setSearch(draftSearch);
  }

  function onReset() {
    setAreaId("");
    setFeeType("");
    setFrom("");
    setTo("");
    setDraftSearch("");
    setSearch("");
  }

  function exportCsv() {
    const rows = [
      ["receiptNo", "date", "member", "code", "feeType", "feeAmount", "stampFee", "otherFee", "total"].join(","),
      ...fees.map((f) => {
        const m = memberOf(f);
        return [
          f.receiptNo,
          f.collectionDate,
          m?.name || "",
          m?.code || "",
          f.feeType,
          f.feeAmount,
          f.stampFee,
          f.otherFee,
          f.totalAmount,
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",");
      }),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fee-collections.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const serviceShare =
    summary && summary.totalAmount > 0
      ? Math.round((summary.serviceChargeAmount / summary.totalAmount) * 1000) / 10
      : 0;
  const admissionShare =
    summary && summary.totalAmount > 0
      ? Math.round((summary.admissionOtherAmount / summary.totalAmount) * 1000) / 10
      : 0;

  return (
    <RoleGate allow={[...ALLOW]}>
      <div className="-mx-1 space-y-5 rounded-[1.5rem] bg-[#f5f7fb] px-1 pb-4 pt-1 print:bg-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
              <Link href="/dashboard" className="font-medium hover:text-blue-700">
                {t("fee.home")}
              </Link>
              <span>/</span>
              <Link href="/dashboard/fee-collection" className="hover:text-blue-700">
                {t("chair.navChild.feeCollection")}
              </Link>
              <span>/</span>
              <span className="font-bold text-blue-600">{t("fee.allTitle")}</span>
            </nav>
            <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{t("fee.allHeading")}</h1>
            <p className="text-sm text-slate-500">{t("fee.allSubtitle")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 ring-1 ring-teal-100">
              {t("fee.liveLedger")}
            </span>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Download size={15} className="text-emerald-600" />
              {t("fee.exportExcel")}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Printer size={15} />
              {t("fee.printReport")}
            </button>
            <Link
              href="/dashboard/fee-collection"
              className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-bold text-white shadow-md shadow-blue-600/25 hover:bg-blue-700"
            >
              + {t("fee.newEntryShort")}
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-xs font-bold text-slate-500">{t("fee.kpiTotal")}</p>
              <Wallet size={18} className="text-blue-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">
              {moneyBdt(summary?.totalAmount || 0, locale)}
            </p>
            <p className="mt-1 text-xs font-semibold text-emerald-600">
              + {moneyBdt(summary?.todayAmount || 0, locale)} {t("fee.today")}
            </p>
          </article>
          <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500">{t("fee.kpiEntries")}</p>
            <p className="mt-2 text-2xl font-extrabold text-emerald-700">
              {toBnDigits(summary?.totalEntries || 0, locale)} {t("fee.vouchers")}
            </p>
            <p className="mt-1 text-xs text-slate-500">{t("fee.auditedTx")}</p>
          </article>
          <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500">{t("fee.kpiService")}</p>
            <p className="mt-2 text-2xl font-extrabold text-blue-700">
              {moneyBdt(summary?.serviceChargeAmount || 0, locale)}
            </p>
            <span className="mt-1 inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">
              {toBnDigits(serviceShare, locale)}% {t("fee.share")}
            </span>
          </article>
          <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500">{t("fee.kpiAdmission")}</p>
            <p className="mt-2 text-2xl font-extrabold text-teal-700">
              {moneyBdt(summary?.admissionOtherAmount || 0, locale)}
            </p>
            <span className="mt-1 inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-700">
              {toBnDigits(admissionShare, locale)}% {t("fee.share")}
            </span>
          </article>
        </div>

        <form
          onSubmit={onSearch}
          className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5 print:hidden"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
              <Filter size={16} className="text-blue-600" />
              {t("fee.filterTitle")}
            </h2>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              <RefreshCw size={12} />
              {t("fee.resetFilter")}
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1.3fr_auto]">
            <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">
              {t("fee.dateFrom")}
              <input type="date" className={fieldClass} value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">
              {t("fee.dateTo")}
              <input type="date" className={fieldClass} value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">
              {t("fee.feeType")}
              <select className={fieldClass} value={feeType} onChange={(e) => setFeeType(e.target.value)}>
                <option value="">{t("fee.allTypes")}</option>
                {FEE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(feeTypeKey(type))}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">
              {t("fee.areaCenter")}
              <select className={fieldClass} value={areaId} onChange={(e) => setAreaId(e.target.value)}>
                <option value="">{t("fee.allAreas")}</option>
                {areas.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end gap-2 xl:col-span-1 sm:col-span-2">
              <label className="block flex-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                {t("fee.search")}
                <span className="relative mt-1.5 block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    className={`${fieldClass} !mt-0 pl-9`}
                    value={draftSearch}
                    onChange={(e) => setDraftSearch(e.target.value)}
                    placeholder={t("fee.searchPh")}
                  />
                </span>
              </label>
              <button
                type="submit"
                className="inline-flex h-[42px] items-center gap-2 rounded-xl bg-[#2563eb] px-4 text-sm font-bold text-white"
              >
                <Search size={14} />
                {t("fee.find")}
              </button>
            </div>
          </div>
        </form>

        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 text-xs font-semibold text-slate-500">
            <p>
              {t("fee.showing")
                .replace("{from}", toBnDigits(fees.length ? (page - 1) * pageSize + 1 : 0, locale))
                .replace("{to}", toBnDigits(Math.min(page * pageSize, fees.length), locale))
                .replace("{total}", toBnDigits(fees.length, locale))}
            </p>
            <label className="inline-flex items-center gap-2 print:hidden">
              {t("fee.perPage")}
              <select
                className="rounded-lg border border-slate-200 px-2 py-1"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[1000px] w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#eef4ff] text-[11px] font-bold uppercase tracking-wide text-slate-600">
                  <th className="px-3 py-3">#</th>
                  <th className="px-3 py-3">{t("fee.colDate")}</th>
                  <th className="px-3 py-3">{t("fee.colMember")}</th>
                  <th className="px-3 py-3">{t("fee.colType")}</th>
                  <th className="px-3 py-3">{t("fee.feeAmount")}</th>
                  <th className="px-3 py-3">{t("fee.stampFee")}</th>
                  <th className="px-3 py-3">{t("fee.otherFee")}</th>
                  <th className="px-3 py-3">{t("fee.colTotal")}</th>
                  <th className="px-3 py-3 print:hidden">{t("fee.action")}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                      {t("common.loading")}
                    </td>
                  </tr>
                ) : null}
                {!loading && fees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                      {t("fee.empty")}
                    </td>
                  </tr>
                ) : null}
                {pageItems.map((fee, index) => {
                  const m = memberOf(fee);
                  return (
                    <tr key={fee._id} className="border-t border-slate-100 hover:bg-blue-50/30">
                      <td className="px-3 py-3.5 text-slate-500">
                        {toBnDigits((page - 1) * pageSize + index + 1, locale)}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap font-semibold text-slate-700">
                        {formatFeeDate(fee.collectionDate, locale)}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            {(m?.name || "?").slice(0, 1)}
                          </span>
                          <div>
                            <p className="font-extrabold text-slate-900">{m?.name || "—"}</p>
                            <p className="text-xs text-slate-500">{m?.mobile}</p>
                            <span className="mt-0.5 inline-flex rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                              {m?.code || fee.receiptNo}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${typeBadge(fee.feeType)}`}>
                          {t(feeTypeKey(fee.feeType))}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">{moneyBdt(fee.feeAmount, locale)}</td>
                      <td className="px-3 py-3.5">{moneyBdt(fee.stampFee, locale)}</td>
                      <td className="px-3 py-3.5">{moneyBdt(fee.otherFee, locale)}</td>
                      <td className="px-3 py-3.5">
                        <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1 font-extrabold text-blue-700">
                          {moneyBdt(fee.totalAmount, locale)}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 print:hidden">
                        <Link
                          href={`/dashboard/fee-collections/${fee._id}/receipt`}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50"
                        >
                          <Printer size={13} />
                          {t("fee.receipt")}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {pageItems.length > 0 ? (
                <tfoot>
                  <tr className="border-t border-slate-200 bg-slate-50 text-sm font-bold text-slate-700">
                    <td colSpan={4} className="px-3 py-3">
                      {t("fee.pageSubtotal")}
                    </td>
                    <td className="px-3 py-3">{moneyBdt(pageTotals.fee, locale)}</td>
                    <td className="px-3 py-3">{moneyBdt(pageTotals.stamp, locale)}</td>
                    <td className="px-3 py-3">{moneyBdt(pageTotals.other, locale)}</td>
                    <td className="px-3 py-3 text-blue-700">{moneyBdt(pageTotals.total, locale)}</td>
                    <td className="print:hidden" />
                  </tr>
                </tfoot>
              ) : null}
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 print:hidden">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold disabled:opacity-40"
            >
              {t("fee.prev")}
            </button>
            <span className="text-xs font-semibold text-slate-500">
              {toBnDigits(page, locale)} / {toBnDigits(pageCount, locale)}
            </span>
            <button
              type="button"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold disabled:opacity-40"
            >
              {t("fee.next")}
            </button>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-xs text-blue-900 print:hidden">
          <p className="flex items-center gap-2 font-medium">
            <UserRound size={14} />
            {t("fee.auditHint")}
          </p>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 font-bold text-white"
          >
            <Download size={13} />
            {t("fee.downloadAudit")}
          </button>
        </div>
      </div>
    </RoleGate>
  );
}
