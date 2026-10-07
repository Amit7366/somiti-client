"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  PiggyBank,
  Plus,
  Printer,
  UserRound,
  X,
} from "lucide-react";
import { RoleGate } from "@/components/RoleGate";
import { api } from "@/lib/api";
import {
  amountInWordsBn,
  amountInWordsEn,
  feeTypeKey,
  formatFeeDate,
  moneyBdt,
  toBnDigits,
} from "@/lib/fee";
import { useI18n } from "@/components/providers/I18nProvider";
import type { Area, FeeCollection, Member, Somiti, User } from "@/types";

const ALLOW = [
  "SUPER_ADMIN",
  "SOMITI_ADMIN",
  "SECRETARY",
  "BRANCH_MANAGER",
  "FIELD_OFFICER",
  "CASHIER",
] as const;

function paymentLabel(method: FeeCollection["paymentMethod"], t: (k: string) => string) {
  if (method === "MFS") return t("fee.mfs");
  if (method === "BANK") return t("fee.bank");
  return t("fee.cash");
}

export default function FeeReceiptPage() {
  const { t, locale, setLocale } = useI18n();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [fee, setFee] = useState<FeeCollection | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [doubleSlip, setDoubleSlip] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<FeeCollection>(`/fees/${params.id}`);
      setFee(res.data);
    } catch (err) {
      setFee(null);
      setError(err instanceof Error ? err.message : t("fee.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [params.id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <RoleGate allow={[...ALLOW]}>
        <p className="py-16 text-center text-slate-400">{t("common.loading")}</p>
      </RoleGate>
    );
  }

  if (!fee) {
    return (
      <RoleGate allow={[...ALLOW]}>
        <div className="space-y-4 py-10 text-center">
          <p className="text-rose-600">{error || t("fee.notFound")}</p>
          <Link href="/dashboard/fee-collections" className="text-sm font-semibold text-blue-700 hover:underline">
            {t("fee.backToList")}
          </Link>
        </div>
      </RoleGate>
    );
  }

  const member = typeof fee.member === "object" ? (fee.member as Member) : null;
  const area = typeof fee.area === "object" ? (fee.area as Area) : null;
  const somiti = typeof fee.somiti === "object" ? (fee.somiti as Somiti) : null;
  const collector = typeof fee.collectedBy === "object" ? (fee.collectedBy as User) : null;
  const isBn = locale.startsWith("bn");
  const words = isBn ? amountInWordsBn(fee.totalAmount) : amountInWordsEn(fee.totalAmount);
  const timeLabel = new Date(fee.createdAt || fee.collectionDate).toLocaleTimeString(
    isBn ? "bn-BD" : "en-US",
    { hour: "numeric", minute: "2-digit" }
  );

  const receiptCard = (copyLabel: string) => (
    <article className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="-rotate-12 rounded-xl border-4 border-emerald-500/40 px-8 py-2 text-4xl font-black tracking-[0.2em] text-emerald-500/25">
          PAID
        </span>
      </div>

      <div className="relative flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <PiggyBank size={24} />
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {somiti?.name || t("fee.orgFallback")}
            </h2>
            <p className="text-xs text-slate-500">
              {somiti?.registrationNo ? `${t("fee.regNo")}: ${somiti.registrationNo}` : null}
              {somiti?.address ? ` · ${somiti.address}` : null}
            </p>
            {somiti?.phone ? (
              <p className="text-xs text-slate-500">
                {t("fee.helpline")}: {somiti.phone}
              </p>
            ) : null}
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            {t("fee.receiptTitle")}
            <CheckCircle2 size={13} className="text-emerald-600" />
          </span>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">{copyLabel}</p>
        </div>
      </div>

      <div className="relative mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-slate-500">{t("fee.receiptNo")}: </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono font-bold text-slate-800">
              {fee.receiptNo}
            </span>
          </p>
          <p>
            <span className="text-slate-500">{t("fee.colDate")}: </span>
            <span className="font-semibold">
              {formatFeeDate(fee.collectionDate, locale)} ({formatFeeDate(fee.collectionDate, "en")})
            </span>
          </p>
          <p>
            <span className="text-slate-500">{t("fee.feeType")}: </span>
            <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
              {t(feeTypeKey(fee.feeType))}
            </span>
          </p>
        </div>
        <div className="space-y-2 text-sm sm:text-right">
          <p>
            <span className="text-slate-500">{t("fee.memberName")}: </span>
            <span className="font-extrabold text-blue-700">{member?.name || "—"}</span>
          </p>
          <p>
            <span className="text-slate-500">{t("fee.memberCode")}: </span>
            <span className="font-semibold">{member?.code || "—"}</span>
          </p>
          <p>
            <span className="text-slate-500">{t("fee.phone")}: </span>
            <span className="font-semibold">{toBnDigits(member?.mobile || "—", locale)}</span>
          </p>
          <p>
            <span className="text-slate-500">{t("fee.center")}: </span>
            <span className="font-semibold">{area?.name || "—"}</span>
          </p>
        </div>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">{t("fee.description")}</th>
              <th className="px-4 py-3 text-right">{t("fee.amountCol")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3">
                <p className="font-bold text-slate-800">
                  {t("fee.collectedFee")}: {t(feeTypeKey(fee.feeType))}
                </p>
                {fee.remarks ? <p className="text-xs text-slate-500">{fee.remarks}</p> : null}
              </td>
              <td className="px-4 py-3 text-right font-semibold">{moneyBdt(fee.feeAmount, locale)}</td>
            </tr>
            {fee.stampFee > 0 ? (
              <tr className="border-t border-slate-100">
                <td className="px-4 py-3 font-semibold text-slate-700">{t("fee.stampFee")}</td>
                <td className="px-4 py-3 text-right font-semibold">{moneyBdt(fee.stampFee, locale)}</td>
              </tr>
            ) : null}
            {fee.otherFee > 0 ? (
              <tr className="border-t border-slate-100">
                <td className="px-4 py-3 font-semibold text-slate-700">{t("fee.otherFee")}</td>
                <td className="px-4 py-3 text-right font-semibold">{moneyBdt(fee.otherFee, locale)}</td>
              </tr>
            ) : null}
            <tr className="border-t border-slate-200 bg-blue-50">
              <td className="px-4 py-3 font-extrabold text-slate-900">{t("fee.grandTotal")}</td>
              <td className="px-4 py-3 text-right text-lg font-extrabold text-blue-700">
                {moneyBdt(fee.totalAmount, locale)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p>
          <span className="text-slate-500">{t("fee.inWords")}: </span>
          <span className="font-bold text-slate-800">{words}</span>
        </p>
        <p className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
          <CheckCircle2 size={14} />
          {paymentLabel(fee.paymentMethod, t)}
        </p>
      </div>

      <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 px-3 py-3 text-center text-xs">
          <p className="font-semibold text-slate-500">{t("fee.collectedBy")}</p>
          <p className="mt-1 font-extrabold text-slate-800">{collector?.name || "—"}</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-3 text-center text-xs">
          <p className="font-semibold text-slate-500">{t("fee.timeMethod")}</p>
          <p className="mt-1 font-extrabold text-slate-800">
            {timeLabel} | {paymentLabel(fee.paymentMethod, t)}
          </p>
        </div>
        <div className="rounded-xl bg-emerald-50 px-3 py-3 text-center text-xs">
          <p className="font-semibold text-emerald-700">{t("fee.verified")}</p>
          <p className="mt-1 font-mono font-extrabold text-emerald-800">
            #{fee.receiptNo.split("-").pop()}
          </p>
        </div>
      </div>

      <div className="relative mt-8 grid gap-8 sm:grid-cols-2">
        <div className="border-t border-dashed border-slate-300 pt-2 text-center text-xs text-slate-500">
          {member?.name || t("fee.memberSign")}
          <p className="mt-1 font-semibold text-slate-600">{t("fee.memberSign")}</p>
        </div>
        <div className="border-t border-dashed border-slate-300 pt-2 text-center text-xs text-slate-500">
          {collector?.name || t("fee.authSign")}
          <p className="mt-1 font-semibold text-slate-600">{t("fee.authSign")}</p>
        </div>
      </div>

      <p className="relative mt-6 text-center text-[10px] text-slate-400">
        {t("fee.computerGenerated")} · {new Date().toLocaleString(isBn ? "bn-BD" : "en-GB")}
      </p>
    </article>
  );

  return (
    <RoleGate allow={[...ALLOW]}>
      <div className="-mx-1 space-y-5 rounded-[1.5rem] bg-[#f5f7fb] px-1 pb-6 pt-1 print:bg-white print:px-0">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
            <Link href="/dashboard" className="hover:text-blue-700">
              {t("fee.home")}
            </Link>
            <span>/</span>
            <Link href="/dashboard/fee-collection" className="hover:text-blue-700">
              {t("chair.navChild.feeCollection")}
            </Link>
            <span>/</span>
            <span className="font-bold text-blue-600">
              {t("fee.receiptTitle")} #{fee.receiptNo}
            </span>
          </nav>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {t("fee.printReady")}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 print:hidden">
          <Link
            href="/dashboard/fee-collections"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700"
          >
            <ArrowLeft size={14} />
            {t("fee.backToList")}
          </Link>
          <button
            type="button"
            onClick={() => {
              setLocale("bn");
              setTimeout(() => window.print(), 50);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white"
          >
            <Printer size={14} />
            {t("fee.printBn")}
          </button>
          <button
            type="button"
            onClick={() => {
              setLocale("en");
              setTimeout(() => window.print(), 50);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white"
          >
            <Printer size={14} />
            {t("fee.printEn")}
          </button>
          <button
            type="button"
            onClick={() => setLocale(isBn ? "en" : "bn")}
            className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700"
          >
            {isBn ? t("fee.englishVersion") : t("fee.banglaVersion")}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700"
          >
            <Download size={14} className="text-rose-600" />
            {t("fee.pdfDownload")}
          </button>
          <button
            type="button"
            onClick={() => setDoubleSlip((v) => !v)}
            className={`rounded-xl px-3 py-2 text-sm font-bold ${
              doubleSlip ? "bg-sky-600 text-white" : "border border-sky-200 bg-sky-50 text-sky-700"
            }`}
          >
            {t("fee.doubleSlip")}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/fee-collections")}
            className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-2 text-sm font-bold text-white"
          >
            <X size={14} />
            {t("fee.close")}
          </button>
        </div>

        <div className="space-y-6">
          {receiptCard(t("fee.customerCopy"))}
          {doubleSlip ? receiptCard(t("fee.officeCopy")) : null}
        </div>

        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-sm text-blue-900 print:hidden">
          <p className="font-medium">
            {t("fee.creditedNote").replace("{amount}", moneyBdt(fee.totalAmount, locale))}
          </p>
          <div className="flex flex-wrap gap-2">
            {member ? (
              <Link
                href={`/dashboard/members-info/${member._id}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700"
              >
                <UserRound size={13} />
                {t("fee.viewProfile")}
              </Link>
            ) : null}
            <Link
              href="/dashboard/fee-collection"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white"
            >
              <Plus size={13} />
              {t("fee.nextCollection")}
            </Link>
          </div>
        </div>
      </div>
    </RoleGate>
  );
}
