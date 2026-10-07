"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CheckCircle2,
  FolderOpen,
  List,
  Phone,
  Printer,
  RefreshCw,
  UserPlus,
  UserRound,
  Wallet,
} from "lucide-react";
import { RoleGate } from "@/components/RoleGate";
import { api } from "@/lib/api";
import { amountInWordsBn, feeTypeKey, formatFeeDate, moneyBdt } from "@/lib/fee";
import { useI18n } from "@/components/providers/I18nProvider";
import type { Area, FeeCollection, FeePaymentMethod, FeeSummary, FeeType, Member } from "@/types";
import { useRouter } from "next/navigation";

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

function todayInput() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function FeeCollectionPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [areas, setAreas] = useState<Area[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [recent, setRecent] = useState<FeeCollection[]>([]);
  const [summary, setSummary] = useState<FeeSummary | null>(null);
  const [areaId, setAreaId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [collectionDate, setCollectionDate] = useState(todayInput());
  const [feeType, setFeeType] = useState<FeeType>("ADMISSION");
  const [feeAmount, setFeeAmount] = useState("500");
  const [stampFee, setStampFee] = useState("0");
  const [otherFee, setOtherFee] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<FeePaymentMethod>("CASH");
  const [remarks, setRemarks] = useState("");
  const [printReceipt, setPrintReceipt] = useState(true);
  const [sendSms, setSendSms] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedMember = useMemo(
    () => members.find((m) => m._id === memberId) || null,
    [members, memberId]
  );

  const totals = useMemo(() => {
    const base = Number(feeAmount) || 0;
    const stamp = Number(stampFee) || 0;
    const other = Number(otherFee) || 0;
    return { base, stamp, other, grand: base + stamp + other };
  }, [feeAmount, stampFee, otherFee]);

  const loadMembers = useCallback(async (aid: string) => {
    try {
      const params = new URLSearchParams({ status: "ACTIVE" });
      if (aid) params.set("areaId", aid);
      const res = await api<Member[]>(`/members?${params}`);
      setMembers(res.data);
    } catch {
      setMembers([]);
    }
  }, []);

  const loadSide = useCallback(async () => {
    try {
      const [sumRes, listRes] = await Promise.all([
        api<FeeSummary>("/fees/summary"),
        api<FeeCollection[]>("/fees?status=COMPLETED"),
      ]);
      setSummary(sumRes.data);
      setRecent(listRes.data.slice(0, 5));
    } catch {
      setSummary(null);
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    api<Area[]>("/areas")
      .then((res) => setAreas(res.data))
      .catch(() => setAreas([]));
    void loadSide();
  }, [loadSide]);

  useEffect(() => {
    void loadMembers(areaId);
  }, [areaId, loadMembers]);

  useEffect(() => {
    if (selectedMember?.area && typeof selectedMember.area === "object" && !areaId) {
      setAreaId(selectedMember.area._id);
    }
  }, [selectedMember, areaId]);

  function resetForm() {
    setMemberId("");
    setFeeType("ADMISSION");
    setFeeAmount("500");
    setStampFee("0");
    setOtherFee("0");
    setPaymentMethod("CASH");
    setRemarks("");
    setPrintReceipt(true);
    setSendSms(true);
    setCollectionDate(todayInput());
    setError("");
  }

  async function onSubmit(e: FormEvent, asDraft = false) {
    e.preventDefault();
    if (!memberId) {
      setError(t("fee.memberRequired"));
      return;
    }
    if (totals.grand <= 0) {
      setError(t("fee.amountRequired"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await api<FeeCollection>("/fees", {
        method: "POST",
        body: JSON.stringify({
          memberId,
          areaId: areaId || undefined,
          collectionDate,
          feeType,
          feeAmount: totals.base,
          stampFee: totals.stamp,
          otherFee: totals.other,
          paymentMethod,
          remarks: remarks.trim() || undefined,
          status: asDraft ? "DRAFT" : "COMPLETED",
          printReceipt,
          sendSms,
        }),
      });
      await loadSide();
      if (!asDraft && printReceipt) {
        router.push(`/dashboard/fee-collections/${res.data._id}/receipt`);
        return;
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("fee.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  const progress =
    summary && summary.dailyTarget > 0
      ? Math.min(100, Math.round((summary.todayAmount / summary.dailyTarget) * 100))
      : 0;

  return (
    <RoleGate allow={[...ALLOW]}>
      <div className="-mx-1 space-y-5 rounded-[1.5rem] bg-[#f5f7fb] px-1 pb-4 pt-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
              <Link href="/dashboard" className="font-medium hover:text-blue-700">
                {t("fee.home")}
              </Link>
              <span>/</span>
              <span>{t("chair.navChild.feeCollection")}</span>
              <span>/</span>
              <span className="font-bold text-blue-600">{t("fee.newEntry")}</span>
            </nav>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FolderOpen size={22} />
              </span>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{t("fee.entryTitle")}</h1>
                <p className="text-sm text-slate-500">{t("fee.entrySubtitle")}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t("fee.liveSession")}
            </span>
            <Link
              href="/dashboard/fee-collections"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <List size={15} />
              {t("fee.allList")}
            </Link>
            <Link
              href="/dashboard/fee-collections"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Printer size={15} />
              {t("fee.receiptPrinting")}
            </Link>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
          <form onSubmit={(e) => void onSubmit(e, false)} className="space-y-4">
            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-extrabold text-slate-900">{t("fee.collectionDetails")}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  {t("fee.collectionDate")}
                  <input
                    type="date"
                    className={fieldClass}
                    value={collectionDate}
                    onChange={(e) => setCollectionDate(e.target.value)}
                    required
                  />
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
              </div>
              <div className="mt-3">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    {t("fee.selectMember")}
                  </label>
                  <Link
                    href="/dashboard/create-member"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                  >
                    <UserPlus size={12} />
                    {t("fee.newMember")}
                  </Link>
                </div>
                <select
                  className={fieldClass}
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  required
                >
                  <option value="">{t("fee.pickMember")}</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.code} — {m.name} — {m.mobile}
                    </option>
                  ))}
                </select>
              </div>

              {selectedMember ? (
                <div className="mt-4 rounded-xl border border-blue-100 bg-[#eef4ff] p-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <UserRound size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-extrabold text-slate-900">{selectedMember.name}</p>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          {t("fee.regularMember")}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        ID: {selectedMember.code} · <Phone size={11} className="inline" /> {selectedMember.mobile}
                      </p>
                      {selectedMember.fatherOrHusbandName ? (
                        <p className="text-xs text-slate-500">
                          {t("fee.father")}: {selectedMember.fatherOrHusbandName}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-semibold text-slate-500">{t("fee.savingsBalance")}</p>
                      <p className="text-sm font-extrabold text-emerald-700">{moneyBdt(0, locale)}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-extrabold text-slate-900">{t("fee.feeBreakdown")}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:col-span-2">
                  {t("fee.feeType")}
                  <select
                    className={fieldClass}
                    value={feeType}
                    onChange={(e) => setFeeType(e.target.value as FeeType)}
                  >
                    {FEE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {t(feeTypeKey(type))}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  {t("fee.feeAmount")}
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className={fieldClass}
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(e.target.value)}
                  />
                </label>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  {t("fee.stampFee")}
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className={fieldClass}
                    value={stampFee}
                    onChange={(e) => setStampFee(e.target.value)}
                  />
                </label>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:col-span-2">
                  {t("fee.otherFee")}
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className={fieldClass}
                    value={otherFee}
                    onChange={(e) => setOtherFee(e.target.value)}
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#2563eb] px-4 py-4 text-white">
                <div>
                  <p className="text-xs font-semibold text-blue-100">{t("fee.grandTotal")}</p>
                  <p className="text-2xl font-extrabold">{moneyBdt(totals.grand, locale)}</p>
                  <p className="mt-1 text-xs text-blue-100">
                    {t("fee.inWords")}: {amountInWordsBn(totals.grand)}
                  </p>
                </div>
                <div className="text-right text-xs font-semibold text-blue-50">
                  <span className="mb-2 inline-flex rounded-full bg-emerald-400/90 px-2.5 py-0.5 text-[11px] font-bold text-emerald-950">
                    {t("fee.payable")}
                  </span>
                  <p>
                    {t("fee.baseFee")}: {moneyBdt(totals.base, locale)}
                  </p>
                  <p>
                    {t("fee.stampFee")}: {moneyBdt(totals.stamp, locale)}
                  </p>
                  <p>
                    {t("fee.otherFee")}: {moneyBdt(totals.other, locale)}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-base font-extrabold text-slate-900">{t("fee.paymentMethod")}</h2>
              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  [
                    ["CASH", t("fee.cash")],
                    ["MFS", t("fee.mfs")],
                    ["BANK", t("fee.bank")],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPaymentMethod(key)}
                    className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${
                      paymentMethod === key
                        ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {paymentMethod === key ? (
                      <CheckCircle2 size={14} className="mr-1 inline" />
                    ) : null}
                    {label}
                  </button>
                ))}
              </div>
              <label className="mt-4 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                {t("fee.remarks")}
                <textarea
                  className={`${fieldClass} min-h-[88px] resize-y`}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={t("fee.remarksPh")}
                />
              </label>
              <label className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={printReceipt}
                  onChange={(e) => setPrintReceipt(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span>
                  {t("fee.autoPrintSms")}
                  <span className="mt-1 block text-xs text-slate-400">
                    <input
                      type="checkbox"
                      className="mr-1.5 align-middle"
                      checked={sendSms}
                      onChange={(e) => setSendSms(e.target.checked)}
                    />
                    {t("fee.sendSms")}
                  </span>
                </span>
              </label>

              {error ? <p className="mt-3 text-sm font-medium text-rose-600">{error}</p> : null}

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <RefreshCw size={14} />
                  {t("fee.reset")}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={(e) => void onSubmit(e as unknown as FormEvent, true)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {t("fee.saveDraft")}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/25 hover:bg-blue-700 disabled:opacity-50 sm:flex-none sm:min-w-[220px]"
                >
                  <Banknote size={16} />
                  {saving ? t("common.loading") : t("fee.save")}
                </button>
              </div>
            </section>
          </form>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900">{t("fee.todaySummary")}</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-blue-50 p-3">
                  <p className="text-[11px] font-semibold text-blue-700">{t("fee.todayCollected")}</p>
                  <p className="mt-1 text-lg font-extrabold text-blue-900">
                    {moneyBdt(summary?.todayAmount || 0, locale)}
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3">
                  <p className="text-[11px] font-semibold text-emerald-700">{t("fee.todayEntries")}</p>
                  <p className="mt-1 text-lg font-extrabold text-emerald-900">{summary?.todayEntries || 0}</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[11px] font-semibold text-slate-500">
                  <span>{t("fee.dailyTarget")}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </section>

            {selectedMember ? (
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-extrabold text-slate-900">{t("fee.memberPreview")}</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">{t("fee.admissionDate")}</dt>
                    <dd className="font-semibold">{formatFeeDate(selectedMember.joinDate, locale)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">{t("fee.lastCollection")}</dt>
                    <dd className="font-semibold">{moneyBdt(0, locale)}</dd>
                  </div>
                </dl>
                <Link
                  href={`/dashboard/members-info/${selectedMember._id}`}
                  className="mt-3 inline-flex text-xs font-bold text-blue-600 hover:underline"
                >
                  {t("fee.fullProfile")}
                </Link>
              </section>
            ) : null}

            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900">{t("fee.recentList")}</h3>
                <Wallet size={16} className="text-emerald-600" />
              </div>
              <ul className="space-y-2">
                {recent.length === 0 ? (
                  <li className="text-sm text-slate-400">{t("fee.noRecent")}</li>
                ) : (
                  recent.map((fee) => {
                    const m = typeof fee.member === "object" ? fee.member : null;
                    return (
                      <li key={fee._id}>
                        <Link
                          href={`/dashboard/fee-collections/${fee._id}/receipt`}
                          className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 text-sm hover:bg-slate-50"
                        >
                          <div>
                            <p className="font-bold text-slate-800">
                              {m ? `${m.code} — ${m.name}` : fee.receiptNo}
                            </p>
                            <p className="text-[11px] text-slate-400">{formatFeeDate(fee.collectionDate, locale)}</p>
                          </div>
                          <span className="font-extrabold text-blue-700">{moneyBdt(fee.totalAmount, locale)}</span>
                        </Link>
                      </li>
                    );
                  })
                )}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </RoleGate>
  );
}
