"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { AuthPortal } from "@/components/auth/AuthPortal";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n } from "@/components/providers/I18nProvider";

const PLANS = [
  { id: "trial", price: 0, members: "—", nameKey: "home.planFree" },
  { id: "starter", price: 599, members: "200", nameKey: "home.planStarter" },
  { id: "basic", price: 999, members: "1,000", nameKey: "home.planBasic" },
  { id: "standard", price: 1499, members: "2,000", nameKey: "home.planStandard", popular: true },
  { id: "professional", price: 2499, members: "5,000", nameKey: "home.planProfessional" },
  { id: "business", price: 3999, members: "8,000", nameKey: "home.planBusiness" },
  { id: "enterprise", price: 7999, members: "40,000", nameKey: "home.planEnterprise" },
] as const;

const TYPES = [
  "typeCoopLending",
  "typeSavingsLending",
  "typeMultipurpose",
  "typeMicroSavings",
  "typeNgoMicro",
  "typeMultiLtd",
  "typeOther",
] as const;
const SAVINGS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10"] as const;
const DPS = ["d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "d10"] as const;

const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20";

export default function RegisterPage() {
  const router = useRouter();
  const { registerSomiti, user, loading } = useAuth();
  const { t } = useI18n();
  const [form, setForm] = useState({
    plan: "standard",
    institutionName: "",
    somitiType: "",
    address: "",
    contactPhone: "",
    phone: "",
    password: "",
  });
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!accepted) {
      setError(t("register.terms"));
      return;
    }
    setSubmitting(true);
    try {
      await registerSomiti({
        institutionName: form.institutionName,
        somitiType: form.somitiType,
        address: form.address,
        contactPhone: form.contactPhone,
        phone: form.phone,
        password: form.password,
        plan: form.plan,
        acceptedTerms: true,
      });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("register.failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPortal active="register">
      <h1 className="mt-6 text-center text-xl font-extrabold text-navy sm:text-2xl">
        {t("register.title")}
      </h1>

      {error ? (
        <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      ) : null}

      <form onSubmit={onSubmit} className="mt-5 space-y-3.5">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            <span className="text-rose-500">*</span>
            {t("register.planLabel")}
          </span>
          <select
            className={fieldClass}
            value={form.plan}
            onChange={(e) => update("plan", e.target.value)}
            required
          >
            {PLANS.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.id === "trial"
                  ? t("register.planTrial")
                  : `${t("register.planOption", {
                      name: t(plan.nameKey),
                      price: plan.price,
                      members: plan.members,
                    })}${plan.popular ? ` ★ ${t("register.popular")}` : ""}`}
              </option>
            ))}
          </select>
          <p className="mt-1.5 flex items-start gap-1.5 text-xs text-emerald-600">
            <Check size={14} className="mt-0.5 shrink-0" />
            {t("register.planHint")}
          </p>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            <span className="text-rose-500">*</span>
            {t("register.name")}
          </span>
          <input
            className={fieldClass}
            value={form.institutionName}
            onChange={(e) => update("institutionName", e.target.value)}
            placeholder={t("register.namePh")}
            required
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            <span className="text-rose-500">*</span>
            {t("register.type")}
          </span>
          <select
            className={fieldClass}
            value={form.somitiType}
            onChange={(e) => update("somitiType", e.target.value)}
            required
          >
            <option value="">{t("register.typePh")}</option>
            {TYPES.map((type) => (
              <option key={type} value={t(`register.${type}`)}>
                {t(`register.${type}`)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            <span className="text-rose-500">*</span>
            {t("register.address")}
          </span>
          <input
            className={fieldClass}
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder={t("register.addressPh")}
            required
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">{t("register.contact")}</span>
          <input
            className={fieldClass}
            value={form.contactPhone}
            onChange={(e) => update("contactPhone", e.target.value)}
            placeholder={t("register.contactPh")}
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            <span className="text-rose-500">*</span>
            {t("register.mobile")}
          </span>
          <input
            className={fieldClass}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder={t("register.mobilePh")}
            required
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            <span className="text-rose-500">*</span>
            {t("common.password")}:
          </span>
          <input
            type="password"
            className={fieldClass}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder={t("register.passwordPh")}
            minLength={6}
            required
          />
        </label>

        <p className="pt-1 text-center text-sm text-slate-600">{t("register.clickHint")}</p>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? t("register.submitting") : t("register.submit")}
        </button>

        <p className="text-sm font-medium text-navy">{t("register.trialNote")}</p>
        <label className="flex items-start gap-2 text-sm text-navy">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-brand"
            required
          />
          {t("register.terms")}
        </label>
        <p className="text-xs leading-6 text-slate-500">{t("register.intro")}</p>
      </form>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
          <p className="text-sm font-semibold text-navy">{t("register.savingsTitle")}</p>
          <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
            {SAVINGS.map((key) => (
              <li key={key} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                {t(`register.${key}`)}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
          <p className="text-sm font-semibold text-emerald-800">{t("register.dpsTitle")}</p>
          <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
            {DPS.map((key) => (
              <li key={key} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                {t(`register.${key}`)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">{t("register.noDataLoss")}</p>
      <p className="mt-2 text-sm">
        <span className="font-semibold text-slate-800">{t("register.callUs")}</span>{" "}
        <a href="tel:01965841630" className="font-medium text-brand">
          01965841630
        </a>
        ,{" "}
        <a href="tel:01714005710" className="font-medium text-brand">
          01714005710
        </a>
        ,{" "}
        <a href="tel:01734327110" className="font-medium text-brand">
          01734327110
        </a>
      </p>

      <Link
        href="/login"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 text-sm font-semibold text-brand"
      >
        <ArrowLeft size={16} />
        {t("register.hasAccount")}
      </Link>
    </AuthPortal>
  );
}
