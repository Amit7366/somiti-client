"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  KeyRound,
  Landmark,
  Lock,
  LogIn,
  User,
  UserPlus,
} from "lucide-react";
import { AuthPortal } from "@/components/auth/AuthPortal";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import type { Role } from "@/lib/roles";

const REMEMBER_KEY = "somiti_remember_identifier";

const demos: { role: Role; email: string; password: string }[] = [
  { role: "SUPER_ADMIN", email: "admin@somitysolution.com", password: "Admin@123" },
  { role: "SOMITI_ADMIN", email: "chairman@demo-somiti.com", password: "Password@123" },
  { role: "SECRETARY", email: "secretary@demo-somiti.com", password: "Password@123" },
  { role: "CASHIER", email: "cashier@demo-somiti.com", password: "Password@123" },
  { role: "ACCOUNTANT", email: "accountant@demo-somiti.com", password: "Password@123" },
  { role: "FIELD_OFFICER", email: "collector@demo-somiti.com", password: "Password@123" },
  { role: "BRANCH_MANAGER", email: "manager@demo-somiti.com", password: "Password@123" },
  { role: "MEMBER", email: "member@demo-somiti.com", password: "Password@123" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const { t } = useI18n();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setIdentifier(saved);
      setRemember(true);
    }
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(identifier, password);
      if (remember) localStorage.setItem(REMEMBER_KEY, identifier);
      else localStorage.removeItem(REMEMBER_KEY);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("login.failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPortal active="login">
      <div className="mt-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/25">
          <Landmark size={26} />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">{t("login.title")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("login.subtitle")}</p>
      </div>

      <p className="mt-5 flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-3 text-sm text-rose-600">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        {t("login.warning")}
      </p>

      {error ? (
        <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      ) : null}

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-700">
            {t("login.identifier")} <span className="text-rose-500">*</span>
          </span>
          <span className="relative block">
            <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={t("login.identifierPh")}
              autoComplete="username"
              required
            />
          </span>
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 flex items-center justify-between font-medium text-slate-700">
            <span>
              {t("common.password")} <span className="text-rose-500">*</span>
            </span>
            <a
              href="https://wa.me/8801965841630"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-brand"
            >
              {t("login.forgot")}
            </a>
          </span>
          <span className="relative block">
            <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("login.passwordPh")}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              onClick={() => setShowPassword((open) => !open)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand accent-brand"
          />
          {t("login.remember")}
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-lg shadow-brand/20 hover:bg-brand-dark disabled:opacity-60"
        >
          <LogIn size={16} />
          {submitting ? t("login.submitting") : t("login.submit")}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3 text-center text-sm text-slate-500">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="inline-flex items-center gap-1.5">
          <KeyRound size={14} />
          {t("login.subdomainHint")}
        </span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <p className="mt-5 text-center text-sm text-slate-500">{t("login.notRegistered")}</p>
      <Link
        href="/register"
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-50 py-3 text-sm font-semibold text-brand hover:bg-sky-100"
      >
        <UserPlus size={16} />
        {t("login.freeRegister")}
      </Link>

      <details className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
        <summary className="cursor-pointer font-medium text-slate-700">{t("login.demoAccounts")}</summary>
        <ul className="mt-3 space-y-1">
          {demos.map((demo) => (
            <li key={demo.email}>
              <button
                type="button"
                className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-white"
                onClick={() => {
                  setIdentifier(demo.email);
                  setPassword(demo.password);
                }}
              >
                <span className="font-medium text-slate-800">{t(`roles.${demo.role}.short`)}</span>
                <span className="block text-[11px] text-slate-400">{demo.email}</span>
              </button>
            </li>
          ))}
        </ul>
      </details>
    </AuthPortal>
  );
}
