"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  CheckCircle2,
  Download,
  FileText,
  FolderOpen,
  IdCard,
  Info,
  Landmark,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  PieChart,
  PiggyBank,
  Plus,
  Power,
  Printer,
  ShieldCheck,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { RoleGate } from "@/components/RoleGate";
import { api, mediaUrl } from "@/lib/api";
import { useI18n } from "@/components/providers/I18nProvider";
import type { Area, Branch, Member, MemberAccountControls, MemberCategory } from "@/types";

const ALLOW = [
  "SUPER_ADMIN",
  "SOMITI_ADMIN",
  "SECRETARY",
  "BRANCH_MANAGER",
  "FIELD_OFFICER",
  "CASHIER",
] as const;

const EMPTY_CONTROLS: MemberAccountControls = {
  profileFrozen: false,
  savingsFrozen: false,
  dpsFrozen: false,
  fdrFrozen: false,
  loanFrozen: false,
};

function money(value?: number) {
  const n = Number(value || 0);
  return `BDT ${n.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function longDate(value?: string, locale = "en") {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(locale.startsWith("bn") ? "bn-BD" : "en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function ageYears(value?: string) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

function categoryLabel(category: MemberCategory, t: (k: string) => string) {
  const map: Record<MemberCategory, string> = {
    GENERAL: t("memberForm.generalMember"),
    MONTHLY_SAVINGS: t("memberForm.monthlySavingsMember"),
    DAILY_SAVINGS: t("memberForm.dailySavingsMember"),
    BORROWER: t("memberForm.borrowerMember"),
    SPECIAL: t("memberForm.specialMember"),
  };
  return map[category] || category;
}

function statusLabel(status: Member["status"], t: (k: string) => string) {
  if (status === "ACTIVE") return t("memberForm.active");
  if (status === "INACTIVE") return t("memberForm.inactive");
  return t("memberForm.closed");
}

function InfoRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value?: string | null;
  valueClass?: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(120px,42%)_1fr] gap-2 border-b border-slate-100 py-2.5 text-sm last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`font-semibold text-slate-800 ${valueClass || ""}`}>
        {value?.trim() ? value : "—"}
      </dd>
    </div>
  );
}

function FreezeToggle({
  on,
  labelOn,
  labelOff,
  disabled,
  onToggle,
}: {
  on: boolean;
  labelOn: string;
  labelOff: string;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className="inline-flex flex-col items-end gap-1 text-xs font-bold disabled:opacity-50"
    >
      <span
        className={`relative h-6 w-11 rounded-full transition ${on ? "bg-rose-500" : "bg-emerald-500"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            on ? "left-5" : "left-0.5"
          }`}
        />
      </span>
      <span className={on ? "text-rose-600" : "text-emerald-700"}>{on ? labelOff : labelOn}</span>
    </button>
  );
}

function FreezeCard({
  icon,
  iconClass,
  title,
  subtitle,
  badge,
  badgeClass,
  frozen,
  labels,
  disabled,
  onToggle,
}: {
  icon: ReactNode;
  iconClass: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeClass: string;
  frozen: boolean;
  labels: { normal: string; frozen: string };
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
            {icon}
          </span>
          <div className="min-w-0">
            <p className="font-extrabold text-slate-900">{title}</p>
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
            <span className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badgeClass}`}>
              {badge}
            </span>
          </div>
        </div>
        <FreezeToggle
          on={frozen}
          labelOn={labels.normal}
          labelOff={labels.frozen}
          disabled={disabled}
          onToggle={onToggle}
        />
      </div>
    </div>
  );
}

export default function MemberDetailPage() {
  const { t, locale } = useI18n();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [member, setMember] = useState<Member | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingFreeze, setSavingFreeze] = useState(false);
  const [accountTab, setAccountTab] = useState<"all" | "savings" | "dps" | "fdr">("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<Member>(`/members/${id}`);
      setMember(res.data);
    } catch (err) {
      setMember(null);
      setError(err instanceof Error ? err.message : t("memberDetail.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const controls = member?.accountControls || EMPTY_CONTROLS;
  const nominees = member?.nominees || [];
  const primaryNominee = nominees[0];
  const areaName =
    member?.area && typeof member.area === "object" ? (member.area as Area).name : "";
  const branchName =
    member?.branch && typeof member.branch === "object" ? (member.branch as Branch).name : "";

  const passbook = useMemo(() => {
    if (!member) return "—";
    if (member.passbookNo) return member.passbookNo;
    const digits = member.code.replace(/\D/g, "") || "0";
    return `PB-${digits.padStart(4, "0")}`;
  }, [member]);

  const verified = Boolean(member?.nid && member?.photoUrl && member?.signatureUrl);
  const age = ageYears(member?.dateOfBirth);
  const shareTotal = nominees.reduce((sum, n) => sum + (n.sharePercent || 0), 0) || 100;

  async function patchControls(next: MemberAccountControls) {
    if (!member) return;
    setSavingFreeze(true);
    setError("");
    try {
      const res = await api<Member>(`/members/${member._id}`, {
        method: "PATCH",
        body: JSON.stringify({ accountControls: next }),
      });
      setMember(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("memberDetail.loadFailed"));
    } finally {
      setSavingFreeze(false);
    }
  }

  function toggleKey(key: keyof MemberAccountControls) {
    void patchControls({ ...controls, [key]: !controls[key] });
  }

  function freezeAll(frozen: boolean) {
    void patchControls({
      profileFrozen: frozen,
      savingsFrozen: frozen,
      dpsFrozen: frozen,
      fdrFrozen: frozen,
      loanFrozen: frozen,
    });
  }

  if (loading) {
    return (
      <RoleGate allow={[...ALLOW]}>
        <p className="py-16 text-center text-slate-400">{t("common.loading")}</p>
      </RoleGate>
    );
  }

  if (!member) {
    return (
      <RoleGate allow={[...ALLOW]}>
        <div className="space-y-4 py-10 text-center">
          <p className="text-rose-600">{error || t("memberDetail.notFound")}</p>
          <Link href="/dashboard/members-info" className="text-sm font-semibold text-blue-700 hover:underline">
            {t("memberDetail.backToList")}
          </Link>
        </div>
      </RoleGate>
    );
  }

  const locationLabel = [branchName, areaName].filter(Boolean).join(" · ") || "—";
  const dobLabel =
    longDate(member.dateOfBirth, locale) +
    (age != null ? ` (${age} ${t("memberDetail.years")})` : "");

  return (
    <RoleGate allow={[...ALLOW]}>
      <div className="-mx-1 space-y-5 rounded-[1.5rem] bg-[#f5f7fb] px-1 pb-4 pt-1 print:bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/members-info"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft size={15} />
              {t("memberDetail.backToList")}
            </Link>
            {verified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                <ShieldCheck size={14} />
                {t("memberDetail.verifiedProfile")}
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Printer size={15} className="text-blue-600" />
              {t("memberDetail.printPassbook")}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Download size={15} className="text-emerald-600" />
              {t("memberDetail.statement")}
            </button>
            <Link
              href={`/dashboard/create-member?edit=${member._id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-bold text-white shadow-md shadow-blue-600/25 hover:bg-blue-700"
            >
              <Pencil size={15} />
              {t("memberDetail.editInfo")}
            </Link>
          </div>
        </div>

        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start gap-5">
            <div className="relative shrink-0">
              <div className="h-28 w-28 overflow-hidden rounded-2xl border-2 border-emerald-400 bg-slate-50 shadow-sm">
                {member.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(member.photoUrl)} alt={member.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-300">
                    <UserRound size={42} />
                  </div>
                )}
              </div>
              <span
                className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                  member.status === "ACTIVE" ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{member.name}</h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white ${
                    member.status === "ACTIVE"
                      ? "bg-emerald-500"
                      : member.status === "INACTIVE"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                  }`}
                >
                  {statusLabel(member.status, t)}
                </span>
                <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-bold text-violet-700">
                  {categoryLabel(member.category, t)}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <p className="flex items-center gap-2 text-sm text-slate-600">
                  <IdCard size={14} className="text-blue-600" />
                  <span className="text-slate-400">{t("memberDetail.code")}:</span>
                  <span className="font-bold text-slate-800">{member.code}</span>
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-600">
                  <BookOpen size={14} className="text-blue-600" />
                  <span className="text-slate-400">{t("memberDetail.passbook")}:</span>
                  <span className="font-bold text-slate-800">{passbook}</span>
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin size={14} className="text-blue-600" />
                  <span className="text-slate-400">{t("memberDetail.center")}:</span>
                  <span className="font-bold text-slate-800">{locationLabel}</span>
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone size={14} className="text-blue-600" />
                  <span className="text-slate-400">{t("memberDetail.phone")}:</span>
                  <span className="font-bold text-slate-800">{member.mobile}</span>
                </p>
              </div>
            </div>

            <div className="w-full space-y-3 sm:w-auto sm:min-w-[220px]">
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                <p className="text-slate-500">
                  {t("memberDetail.admissionDate")}:{" "}
                  <span className="font-bold text-slate-800">{longDate(member.joinDate, locale)}</span>
                </p>
                <p className="mt-1 text-slate-500">
                  {t("memberDetail.admissionFee")}:{" "}
                  <span className="font-bold text-slate-800">{money(member.admissionFee)}</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2.5 text-xs font-bold text-blue-700 ring-1 ring-blue-100 hover:bg-blue-100"
                >
                  <FileText size={14} />
                  {t("memberDetail.issuePassbook")}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100 hover:bg-emerald-100"
                >
                  <MessageSquare size={14} />
                  {t("memberDetail.sendSms")}
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <UserRound size={16} />
                  </span>
                  {t("memberDetail.personalInfo")}
                </h2>
                {member.nid ? (
                  <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-bold text-violet-700">
                    {t("memberDetail.nidVerified")}
                  </span>
                ) : null}
              </div>
              <dl>
                <InfoRow label={t("memberDetail.fatherName")} value={member.fatherOrHusbandName} />
                <InfoRow label={t("memberDetail.motherName")} value={member.motherOrWifeName} />
                <InfoRow label={t("memberDetail.husbandWife")} value="" />
                <InfoRow label={t("memberDetail.gender")} value={member.gender} />
                <InfoRow label={t("memberDetail.dateOfBirth")} value={dobLabel} />
                <InfoRow label={t("memberDetail.nid")} value={member.nid} valueClass="text-blue-700" />
                <InfoRow label={t("memberDetail.occupation")} value={member.occupation} />
                <InfoRow
                  label={t("memberDetail.monthlyIncome")}
                  value={money(member.annualIncome)}
                  valueClass="text-emerald-700"
                />
              </dl>

              <div className="mt-4 rounded-xl border border-slate-100 bg-[#f4f7fb] p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-extrabold text-slate-800">{t("memberDetail.memberSignature")}</p>
                  {member.signatureUrl ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 size={13} />
                      {t("memberDetail.verifiedSignature")}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-rose-600">{t("memberDetail.pendingSignature")}</span>
                  )}
                </div>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  {member.signatureUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaUrl(member.signatureUrl)}
                      alt="signature"
                      className="h-16 w-44 rounded-lg border border-slate-200 bg-white object-contain p-1"
                    />
                  ) : (
                    <div className="flex h-16 w-44 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white text-xs text-slate-300">
                      —
                    </div>
                  )}
                  <p className="text-xs text-slate-500">
                    {t("memberDetail.signatureDate")}:{" "}
                    <span className="font-semibold text-slate-700">{longDate(member.createdAt, locale)}</span>
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Users size={16} />
                  </span>
                  {t("memberDetail.nomineeInfo")}
                </h2>
                <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                  {t("memberDetail.allocation")} {shareTotal}%
                </span>
              </div>
              {primaryNominee ? (
                <div className="space-y-3">
                  {nominees.map((nominee, idx) => (
                    <div
                      key={`${nominee.name}-${idx}`}
                      className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5"
                    >
                      <div className="h-14 w-14 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        {nominee.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={mediaUrl(nominee.photoUrl)}
                            alt={nominee.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-300">
                            <UserRound size={22} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="font-extrabold text-slate-900">
                          {nominee.name}
                          {nominee.relation ? (
                            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                              {nominee.relation}
                            </span>
                          ) : null}
                        </p>
                        <p className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Phone size={12} />
                            {nominee.mobile}
                          </span>
                          {nominee.nationalId ? <span>NID: {nominee.nationalId}</span> : null}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          {t("memberDetail.inheritance")}
                        </p>
                        <p className="text-xl font-extrabold text-emerald-600">{nominee.sharePercent ?? 0}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">—</p>
              )}
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold text-slate-900">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <MapPin size={16} />
                </span>
                {t("memberDetail.addressSavings")}
              </h2>
              <div className="space-y-3 rounded-xl bg-[#eef4ff] p-4 text-sm">
                <div>
                  <p className="text-xs font-bold text-slate-500">{t("memberDetail.presentAddress")}</p>
                  <p className="mt-0.5 font-semibold text-slate-800">{member.address || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">{t("memberDetail.permanentAddress")}</p>
                  <p className="mt-0.5 font-semibold text-slate-800">
                    {member.permanentAddress || member.address || "—"}
                  </p>
                </div>
                {areaName ? (
                  <div>
                    <p className="text-xs font-bold text-slate-500">{t("memberDetail.villageArea")}</p>
                    <p className="mt-0.5 font-semibold text-slate-800">{areaName}</p>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                <div className="rounded-xl bg-emerald-50 p-3.5">
                  <div className="flex items-start justify-between">
                    <p className="text-[11px] font-bold text-emerald-700">{t("memberDetail.savingsBalance")}</p>
                    <Wallet size={16} className="text-emerald-600" />
                  </div>
                  <p className="mt-2 text-lg font-extrabold text-emerald-900">{money(0)}</p>
                  <p className="mt-1 text-[11px] font-semibold text-emerald-600">{t("memberDetail.regularAccount")}</p>
                </div>
                <div className="rounded-xl bg-sky-50 p-3.5">
                  <div className="flex items-start justify-between">
                    <p className="text-[11px] font-bold text-sky-700">{t("memberDetail.dueLoans")}</p>
                    <FileText size={16} className="text-sky-600" />
                  </div>
                  <p className="mt-2 text-lg font-extrabold text-sky-900">{money(0)}</p>
                  <p className="mt-1 text-[11px] font-semibold text-sky-600">{t("memberDetail.noLoanDefault")}</p>
                </div>
                <div className="rounded-xl bg-violet-50 p-3.5">
                  <div className="flex items-start justify-between">
                    <p className="text-[11px] font-bold text-violet-700">{t("memberDetail.totalAccount")}</p>
                    <FolderOpen size={16} className="text-violet-600" />
                  </div>
                  <p className="mt-2 text-lg font-extrabold text-violet-900">0</p>
                  <p className="mt-1 text-[11px] font-semibold text-violet-600">{t("memberDetail.newAccountEligible")}</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-extrabold text-slate-800">{t("memberDetail.savingsProgress")}</p>
                  <p className="text-xs font-bold text-slate-500">0% (৳ 50,000 {t("memberDetail.target")})</p>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-0 rounded-full bg-blue-600" />
                </div>
                <div className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] font-semibold text-slate-500">
                  <span>
                    {t("memberDetail.start")}: {longDate(member.joinDate, locale)}
                  </span>
                  <span>{t("memberDetail.nextInstallment")}: —</span>
                </div>
              </div>
            </section>

            <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-3.5 text-sm text-blue-900">
              <Info size={18} className="mt-0.5 shrink-0 text-blue-600" />
              <p className="font-medium leading-relaxed">{t("memberDetail.auditNote")}</p>
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-rose-100 border-t-4 border-t-rose-500 bg-[#fff8f8] p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                  <ShieldCheck size={16} />
                </span>
                {t("memberDetail.accountFreeze")}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">{t("memberDetail.freezeHint")}</p>
            </div>
            <div className="flex flex-wrap gap-2 print:hidden">
              <button
                type="button"
                disabled={savingFreeze}
                onClick={() => freezeAll(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
              >
                {t("memberDetail.unfreezeAll")}
              </button>
              <button
                type="button"
                disabled={savingFreeze}
                onClick={() => freezeAll(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3.5 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                <Power size={14} />
                {t("memberDetail.freezeAll")}
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <FreezeCard
              icon={<IdCard size={18} />}
              iconClass="bg-blue-50 text-blue-600"
              title={t("memberDetail.principalAccount")}
              subtitle={`${t("memberDetail.ledger")}: ${member.code}`}
              badge={t("memberDetail.memberProfile")}
              badgeClass="bg-slate-100 text-slate-600"
              frozen={controls.profileFrozen}
              labels={{ normal: t("memberDetail.normal"), frozen: t("memberDetail.frozen") }}
              disabled={savingFreeze}
              onToggle={() => toggleKey("profileFrozen")}
            />
            <FreezeCard
              icon={<PiggyBank size={18} />}
              iconClass="bg-emerald-50 text-emerald-600"
              title={t("memberDetail.generalSavings")}
              subtitle={`${t("memberDetail.generalSavings")}: —`}
              badge={`0 ${t("memberDetail.accounts")}`}
              badgeClass="bg-emerald-50 text-emerald-700"
              frozen={controls.savingsFrozen}
              labels={{ normal: t("memberDetail.normal"), frozen: t("memberDetail.frozen") }}
              disabled={savingFreeze}
              onToggle={() => toggleKey("savingsFrozen")}
            />
            <FreezeCard
              icon={<BookOpen size={18} />}
              iconClass="bg-slate-100 text-slate-500"
              title={t("memberDetail.dps")}
              subtitle={t("memberDetail.noDps")}
              badge={t("memberDetail.undefined")}
              badgeClass="bg-slate-100 text-slate-500"
              frozen={controls.dpsFrozen}
              labels={{ normal: t("memberDetail.normal"), frozen: t("memberDetail.frozen") }}
              disabled={savingFreeze}
              onToggle={() => toggleKey("dpsFrozen")}
            />
            <FreezeCard
              icon={<Building2 size={18} />}
              iconClass="bg-slate-100 text-slate-500"
              title={t("memberDetail.fdr")}
              subtitle={t("memberDetail.noFdr")}
              badge={t("memberDetail.undefined")}
              badgeClass="bg-slate-100 text-slate-500"
              frozen={controls.fdrFrozen}
              labels={{ normal: t("memberDetail.normal"), frozen: t("memberDetail.frozen") }}
              disabled={savingFreeze}
              onToggle={() => toggleKey("fdrFrozen")}
            />
            <FreezeCard
              icon={<Landmark size={18} />}
              iconClass="bg-sky-50 text-sky-600"
              title={t("memberDetail.loan")}
              subtitle={t("memberDetail.noLoan")}
              badge={t("memberDetail.loanFree")}
              badgeClass="bg-slate-100 text-slate-500"
              frozen={controls.loanFrozen}
              labels={{ normal: t("memberDetail.normal"), frozen: t("memberDetail.frozen") }}
              disabled={savingFreeze}
              onToggle={() => toggleKey("loanFrozen")}
            />
            <FreezeCard
              icon={<PieChart size={18} />}
              iconClass="bg-emerald-50 text-emerald-600"
              title={t("memberDetail.share")}
              subtitle={`${t("memberDetail.shareCount")}: —`}
              badge={t("memberDetail.shareholder")}
              badgeClass="bg-emerald-50 text-emerald-700"
              frozen={false}
              labels={{ normal: t("memberDetail.normal"), frozen: t("memberDetail.frozen") }}
              disabled
              onToggle={() => undefined}
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Wallet size={16} />
              </span>
              {t("memberDetail.savingsAccounts")}
            </h2>
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              {(
                [
                  ["all", t("memberDetail.filterAll")],
                  ["savings", t("memberDetail.generalSavings")],
                  ["dps", t("memberDetail.dps")],
                  ["fdr", t("memberDetail.fdr")],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAccountTab(key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    accountTab === key
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563eb] px-3 py-1.5 text-xs font-bold text-white"
              >
                <Plus size={13} />
                {t("memberDetail.addAccount")}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#eef4ff] text-[11px] font-bold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">{t("memberDetail.accountNo")}</th>
                  <th className="px-4 py-3">{t("memberDetail.scheme")}</th>
                  <th className="px-4 py-3">{t("memberDetail.type")}</th>
                  <th className="px-4 py-3">{t("memberDetail.totalDeposit")}</th>
                  <th className="px-4 py-3">{t("memberDetail.totalWithdrawal")}</th>
                  <th className="px-4 py-3">{t("memberDetail.currentBalance")}</th>
                  <th className="px-4 py-3">{t("memberDetail.status")}</th>
                  <th className="px-4 py-3">{t("memberDetail.action")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    {t("memberDetail.noSavings")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-5 py-3 text-xs font-semibold text-slate-500">
            <span>0 {t("memberDetail.activeAccounts")}</span>
            <span>
              {t("memberDetail.grandTotal")}: <span className="text-emerald-700">{money(0)}</span>
            </span>
          </div>
        </section>
      </div>
    </RoleGate>
  );
}
