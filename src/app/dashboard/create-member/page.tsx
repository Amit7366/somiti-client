"use client";

import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Check,
  IdCard,
  ImageIcon,
  Plus,
  Save,
  UserRound,
  Users,
} from "lucide-react";
import { RoleGate } from "@/components/RoleGate";
import { ImageUploadSlot } from "@/components/ImageUploadSlot";
import { api } from "@/lib/api";
import { useI18n } from "@/components/providers/I18nProvider";
import type { Area, Member, Nominee, User } from "@/types";

const ALLOW = ["SUPER_ADMIN", "SOMITI_ADMIN", "SECRETARY", "BRANCH_MANAGER"] as const;

type Step1 = {
  joinDate: string;
  name: string;
  category: "GENERAL" | "MONTHLY_SAVINGS" | "DAILY_SAVINGS" | "BORROWER" | "SPECIAL";
  mobile: string;
  areaId: string;
  assignedStaffId: string;
  address: string;
};

type Step2 = {
  nid: string;
  fatherOrHusbandName: string;
  motherOrWifeName: string;
  annualIncome: string;
  status: "ACTIVE" | "INACTIVE" | "CLOSED";
  photoUrl: string;
  signatureUrl: string;
  nidFrontUrl: string;
  nidBackUrl: string;
};

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

function emptyNominee(sharePercent = 100): Nominee {
  return {
    name: "",
    mobile: "",
    relation: "",
    nationalId: "",
    sharePercent,
    address: "",
    photoUrl: "",
    signatureUrl: "",
  };
}

function FieldRow({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[210px_1fr] sm:items-center">
      <label className="text-sm font-medium text-slate-700 sm:text-right">
        {required ? <span className="mr-1 text-rose-500">*</span> : null}
        {label}
      </label>
      <div>{children}</div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20";

export default function CreateMemberPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [areas, setAreas] = useState<Area[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [addingArea, setAddingArea] = useState(false);

  const [step1, setStep1] = useState<Step1>({
    joinDate: todayInput(),
    name: "",
    category: "GENERAL",
    mobile: "",
    areaId: "",
    assignedStaffId: "",
    address: "",
  });

  const [step2, setStep2] = useState<Step2>({
    nid: "",
    fatherOrHusbandName: "",
    motherOrWifeName: "",
    annualIncome: "",
    status: "ACTIVE",
    photoUrl: "",
    signatureUrl: "",
    nidFrontUrl: "",
    nidBackUrl: "",
  });

  const [nominees, setNominees] = useState<Nominee[]>([emptyNominee(100)]);

  useEffect(() => {
    Promise.all([
      api<Area[]>("/areas"),
      api<User[]>("/users?role=FIELD_OFFICER"),
      api<User[]>("/users?role=BRANCH_MANAGER"),
    ])
      .then(([areaRes, foRes, bmRes]) => {
        setAreas(areaRes.data);
        const map = new Map<string, User>();
        [...foRes.data, ...bmRes.data].forEach((user) => map.set(user.id, user));
        setStaff([...map.values()]);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  const shareTotal = useMemo(
    () => nominees.reduce((sum, item) => sum + (Number(item.sharePercent) || 0), 0),
    [nominees]
  );

  async function addAreaQuick() {
    const name = window.prompt(t("org.areaName"));
    if (!name?.trim()) return;
    setAddingArea(true);
    setError("");
    try {
      const res = await api<Area>("/areas", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });
      setAreas((current) => [res.data, ...current]);
      setStep1((current) => ({ ...current, areaId: res.data._id }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("org.areaFailed"));
    } finally {
      setAddingArea(false);
    }
  }

  function validateStep1() {
    if (!step1.joinDate || !step1.name.trim() || !step1.mobile.trim() || !step1.areaId) {
      setError(t("memberForm.step1Required"));
      return false;
    }
    return true;
  }

  function onNext(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!validateStep1()) return;
    setStep(2);
  }

  function updateNominee(index: number, patch: Partial<Nominee>) {
    setNominees((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addNominee() {
    setNominees((current) => {
      const next = [...current, emptyNominee(0)];
      const equal = Math.floor(100 / next.length);
      const remainder = 100 - equal * next.length;
      return next.map((item, index) => ({
        ...item,
        sharePercent: equal + (index === 0 ? remainder : 0),
      }));
    });
  }

  function removeNominee(index: number) {
    if (nominees.length <= 1) return;
    setNominees((current) => {
      const next = current.filter((_, i) => i !== index);
      if (next.length === 1) return [{ ...next[0], sharePercent: 100 }];
      return next;
    });
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    if (!step2.nid.trim()) {
      setError(t("memberForm.nidRequired"));
      return;
    }
    if (nominees.some((n) => !n.name.trim() || !n.mobile.trim())) {
      setError(t("memberForm.nomineeRequired"));
      return;
    }
    if (Math.abs(shareTotal - 100) > 0.01) {
      setError(t("memberForm.shareTotal"));
      return;
    }

    setSaving(true);
    try {
      await api<Member>("/members", {
        method: "POST",
        body: JSON.stringify({
          joinDate: step1.joinDate,
          name: step1.name.trim(),
          category: step1.category,
          mobile: step1.mobile.trim(),
          areaId: step1.areaId,
          assignedStaffId: step1.assignedStaffId || undefined,
          address: step1.address || undefined,
          nid: step2.nid.trim(),
          fatherOrHusbandName: step2.fatherOrHusbandName || undefined,
          motherOrWifeName: step2.motherOrWifeName || undefined,
          annualIncome: step2.annualIncome ? Number(step2.annualIncome) : undefined,
          status: step2.status,
          photoUrl: step2.photoUrl || undefined,
          signatureUrl: step2.signatureUrl || undefined,
          nidFrontUrl: step2.nidFrontUrl || undefined,
          nidBackUrl: step2.nidBackUrl || undefined,
          nominees: nominees.map((nominee, index) => ({
            ...nominee,
            name: nominee.name.trim(),
            mobile: nominee.mobile.trim(),
            sharePercent: Number(nominee.sharePercent) || 0,
            isPrimary: index === 0,
            photoUrl: nominee.photoUrl || undefined,
            signatureUrl: nominee.signatureUrl || undefined,
          })),
        }),
      });
      router.push("/dashboard/members-info");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("memberForm.createFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <RoleGate allow={[...ALLOW]}>
      <div className="mx-auto max-w-5xl space-y-5">
        <h1 className="text-2xl font-extrabold text-slate-900">{t("memberForm.title")}</h1>

        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                step > 1 ? "bg-emerald-500 text-white" : "bg-[#1e3a5f] text-white"
              }`}
            >
              {step > 1 ? <Check size={16} /> : "1"}
            </span>
            <span className={`text-sm font-semibold ${step === 1 ? "text-[#1e3a5f]" : "text-slate-500"}`}>
              {t("memberForm.step1")}
            </span>
          </div>
          <div className="h-px flex-1 bg-slate-200" />
          <div className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                step === 2 ? "bg-[#1e3a5f] text-white" : "bg-slate-200 text-slate-500"
              }`}
            >
              2
            </span>
            <span className={`text-sm font-semibold ${step === 2 ? "text-[#1e3a5f]" : "text-slate-400"}`}>
              {t("memberForm.step2")}
            </span>
          </div>
        </div>

        {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        {step === 1 ? (
          <form onSubmit={onNext} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <FieldRow label={t("memberForm.date")} required>
              <input
                type="date"
                className={inputClass}
                value={step1.joinDate}
                onChange={(e) => setStep1({ ...step1, joinDate: e.target.value })}
                required
              />
            </FieldRow>
            <FieldRow label={t("memberForm.memberName")} required>
              <input
                className={inputClass}
                value={step1.name}
                onChange={(e) => setStep1({ ...step1, name: e.target.value })}
                required
              />
            </FieldRow>
            <FieldRow label={t("memberForm.memberCategory")} required>
              <select
                className={inputClass}
                value={step1.category}
                onChange={(e) => setStep1({ ...step1, category: e.target.value as Step1["category"] })}
              >
                <option value="GENERAL">{t("memberForm.generalMember")}</option>
                <option value="MONTHLY_SAVINGS">{t("memberForm.monthlySavingsMember")}</option>
                <option value="DAILY_SAVINGS">{t("memberForm.dailySavingsMember")}</option>
                <option value="BORROWER">{t("memberForm.borrowerMember")}</option>
                <option value="SPECIAL">{t("memberForm.specialMember")}</option>
              </select>
            </FieldRow>
            <FieldRow label={t("memberForm.memberMobile")} required>
              <input
                className={inputClass}
                value={step1.mobile}
                onChange={(e) => setStep1({ ...step1, mobile: e.target.value })}
                required
              />
            </FieldRow>
            <FieldRow label={t("memberForm.memberArea")} required>
              <div className="flex gap-2">
                <select
                  className={inputClass}
                  value={step1.areaId}
                  onChange={(e) => setStep1({ ...step1, areaId: e.target.value })}
                  required
                >
                  <option value="">{t("memberForm.selectArea")}</option>
                  {areas.map((area) => (
                    <option key={area._id} value={area._id}>
                      {area.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addAreaQuick}
                  disabled={addingArea}
                  className="inline-flex h-[38px] w-10 shrink-0 items-center justify-center rounded-lg bg-[#1e3a5f] text-white hover:bg-[#162c49] disabled:opacity-60"
                  title={t("org.addArea")}
                >
                  <Plus size={18} />
                </button>
              </div>
            </FieldRow>
            <FieldRow label={t("memberForm.assignedStaff")}>
              <select
                className={inputClass}
                value={step1.assignedStaffId}
                onChange={(e) => setStep1({ ...step1, assignedStaffId: e.target.value })}
              >
                <option value="">{t("memberForm.selectStaff")}</option>
                {staff.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </FieldRow>
            <FieldRow label={t("memberForm.memberAddress")}>
              <textarea
                className={`${inputClass} min-h-[88px]`}
                value={step1.address}
                onChange={(e) => setStep1({ ...step1, address: e.target.value })}
              />
            </FieldRow>
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                className="rounded-lg bg-[#1e3a5f] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#162c49]"
              >
                {t("memberForm.saveNext")}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={onSave} className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <FieldRow label={t("memberForm.nid")} required>
                  <input
                    className={inputClass}
                    placeholder={t("memberForm.nidPh")}
                    value={step2.nid}
                    onChange={(e) => setStep2({ ...step2, nid: e.target.value })}
                    required
                  />
                </FieldRow>
                <FieldRow label={t("memberForm.fatherHusband")}>
                  <input
                    className={inputClass}
                    placeholder={t("memberForm.fatherHusbandPh")}
                    value={step2.fatherOrHusbandName}
                    onChange={(e) => setStep2({ ...step2, fatherOrHusbandName: e.target.value })}
                  />
                </FieldRow>
                <FieldRow label={t("memberForm.motherWife")}>
                  <input
                    className={inputClass}
                    placeholder={t("memberForm.motherWifePh")}
                    value={step2.motherOrWifeName}
                    onChange={(e) => setStep2({ ...step2, motherOrWifeName: e.target.value })}
                  />
                </FieldRow>
                <FieldRow label={t("memberForm.annualIncome")}>
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    placeholder={t("memberForm.annualIncomePh")}
                    value={step2.annualIncome}
                    onChange={(e) => setStep2({ ...step2, annualIncome: e.target.value })}
                  />
                </FieldRow>
                <FieldRow label={t("memberForm.memberStatus")}>
                  <select
                    className={inputClass}
                    value={step2.status}
                    onChange={(e) => setStep2({ ...step2, status: e.target.value as Step2["status"] })}
                  >
                    <option value="ACTIVE">{t("memberForm.active")}</option>
                    <option value="INACTIVE">{t("memberForm.inactive")}</option>
                    <option value="CLOSED">{t("memberForm.closed")}</option>
                  </select>
                </FieldRow>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-bold text-slate-800">{t("memberForm.photosDocs")}</h2>
                <div className="grid grid-cols-2 gap-3">
                  <ImageUploadSlot
                    label={t("memberForm.memberPhoto")}
                    value={step2.photoUrl}
                    onChange={(url) => setStep2({ ...step2, photoUrl: url })}
                    icon={<UserRound size={42} />}
                  />
                  <ImageUploadSlot
                    label={t("memberForm.memberSignature")}
                    value={step2.signatureUrl}
                    onChange={(url) => setStep2({ ...step2, signatureUrl: url })}
                    icon={<Briefcase size={42} />}
                  />
                  <ImageUploadSlot
                    label={t("memberForm.nidFront")}
                    value={step2.nidFrontUrl}
                    onChange={(url) => setStep2({ ...step2, nidFrontUrl: url })}
                    icon={<IdCard size={42} />}
                  />
                  <ImageUploadSlot
                    label={t("memberForm.nidBack")}
                    value={step2.nidBackUrl}
                    onChange={(url) => setStep2({ ...step2, nidBackUrl: url })}
                    icon={<ImageIcon size={42} />}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Users className="text-[#1e3a5f]" size={20} />
                  <h2 className="text-base font-bold text-slate-900">{t("memberForm.nomineeTitle")}</h2>
                </div>
                <p className="text-xs font-medium text-slate-500">{t("memberForm.nomineeHint")}</p>
              </div>

              <div className="space-y-4">
                {nominees.map((nominee, index) => (
                  <div key={index} className="rounded-xl border border-slate-200 p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-[#1e3a5f]">
                        {index === 0
                          ? t("memberForm.primaryNominee")
                          : `${t("memberForm.additionalNominee")} (${index + 1})`}
                      </h3>
                      {index > 0 ? (
                        <button
                          type="button"
                          onClick={() => removeNominee(index)}
                          className="text-xs font-semibold text-rose-600 hover:underline"
                        >
                          {t("memberForm.removeNominee")}
                        </button>
                      ) : null}
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="text-sm">
                        <span className="mb-1 block font-medium text-slate-600">
                          <span className="text-rose-500">*</span> {t("memberForm.nomineeName")}
                        </span>
                        <input
                          className={inputClass}
                          value={nominee.name}
                          onChange={(e) => updateNominee(index, { name: e.target.value })}
                          required
                        />
                      </label>
                      <label className="text-sm">
                        <span className="mb-1 block font-medium text-slate-600">
                          <span className="text-rose-500">*</span> {t("memberForm.nomineeMobile")}
                        </span>
                        <input
                          className={inputClass}
                          value={nominee.mobile}
                          onChange={(e) => updateNominee(index, { mobile: e.target.value })}
                          required
                        />
                      </label>
                      <label className="text-sm">
                        <span className="mb-1 block font-medium text-slate-600">{t("memberForm.relation")}</span>
                        <input
                          className={inputClass}
                          value={nominee.relation || ""}
                          onChange={(e) => updateNominee(index, { relation: e.target.value })}
                        />
                      </label>
                      <label className="text-sm">
                        <span className="mb-1 block font-medium text-slate-600">{t("memberForm.nomineeNid")}</span>
                        <input
                          className={inputClass}
                          value={nominee.nationalId || ""}
                          onChange={(e) => updateNominee(index, { nationalId: e.target.value })}
                        />
                      </label>
                      <label className="text-sm">
                        <span className="mb-1 block font-medium text-slate-600">{t("memberForm.sharePercent")}</span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          className={inputClass}
                          value={nominee.sharePercent}
                          onChange={(e) =>
                            updateNominee(index, { sharePercent: Number(e.target.value) || 0 })
                          }
                        />
                      </label>
                      <label className="text-sm md:col-span-2">
                        <span className="mb-1 block font-medium text-slate-600">
                          {t("memberForm.nomineeAddress")}
                        </span>
                        <textarea
                          className={`${inputClass} min-h-[72px]`}
                          value={nominee.address || ""}
                          onChange={(e) => updateNominee(index, { address: e.target.value })}
                        />
                      </label>
                    </div>

                    <div className="mt-3 grid max-w-md grid-cols-2 gap-3">
                      <ImageUploadSlot
                        label={t("memberForm.nomineePhoto")}
                        value={nominee.photoUrl}
                        onChange={(url) => updateNominee(index, { photoUrl: url })}
                        icon={<UserRound size={36} />}
                      />
                      <ImageUploadSlot
                        label={t("memberForm.nomineeSignature")}
                        value={nominee.signatureUrl}
                        onChange={(url) => updateNominee(index, { signatureUrl: url })}
                        icon={<Briefcase size={36} />}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Share total: <span className={shareTotal === 100 ? "text-emerald-600" : "text-rose-600"}>{shareTotal}%</span>
              </p>

              <button
                type="button"
                onClick={addNominee}
                className="mt-3 rounded-lg border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100"
              >
                {t("memberForm.addNominee")}
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pb-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-300"
              >
                <ArrowLeft size={16} />
                {t("memberForm.previous")}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-[#1e3a5f] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#162c49] disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? t("common.loading") : t("memberForm.save")}
              </button>
            </div>
          </form>
        )}
      </div>
    </RoleGate>
  );
}
