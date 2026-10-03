"use client";

import Link from "next/link";
import { Check, Landmark, Phone, UserPlus, Users } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/components/providers/I18nProvider";

export function AuthPortal({
  active,
  children,
}: {
  active: "login" | "register";
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const points = [t("auth.point1"), t("auth.point2"), t("auth.point3")];
  const phones = [t("auth.phone1"), t("auth.phone2"), t("auth.phone3")];

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[minmax(280px,0.92fr)_minmax(420px,1.08fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#04283a] via-[#071a2e] to-[#0a3d48] px-10 py-10 text-white lg:sticky lg:top-0 lg:flex lg:h-screen">
        <div className="pointer-events-none absolute -left-16 top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-10 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400 text-[#04283a] shadow-lg shadow-emerald-400/20">
              <Landmark size={22} />
            </span>
            <span>
              <span className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight">{t("brand.name")}</span>
                <span className="rounded-full border border-emerald-300/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                  {t("auth.version")}
                </span>
              </span>
              <span className="block text-[11px] text-white/60">{t("auth.tagline")}</span>
            </span>
          </Link>
          <LanguageSwitcher variant="dark" />
        </div>

        <div className="relative z-10 max-w-lg">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {t("auth.badge")}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight">
            {t("auth.headlineBefore")}{" "}
            <span className="text-emerald-300">{t("auth.headlineAccent")}</span>
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/70">{t("auth.body")}</p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="flex items-center gap-2 text-xl font-bold">
                <Users size={18} className="text-sky-300" />
                {t("auth.statSomitis")}
              </p>
              <p className="mt-1 text-xs text-white/55">{t("auth.statSomitisLabel")}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="flex items-center gap-2 text-xl font-bold">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-400/20 text-emerald-300">
                  <Check size={12} />
                </span>
                {t("auth.statMembers")}
              </p>
              <p className="mt-1 text-xs text-white/55">{t("auth.statMembersLabel")}</p>
            </div>
          </div>

          <ul className="mt-8 space-y-3 text-sm text-white/75">
            {points.map((point) => (
              <li key={point} className="flex gap-2">
                <Check size={16} className="mt-0.5 shrink-0 text-emerald-300" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 border-t border-white/10 pt-6">
          <p className="text-xs text-white/55">{t("auth.support")}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium">
            {phones.map((phone) => (
              <a key={phone} href={`tel:${phone}`} className="inline-flex items-center gap-1.5 text-emerald-200">
                <Phone size={14} />
                {phone}
              </a>
            ))}
            <span className="rounded-full border border-emerald-300/30 px-3 py-1 text-[11px] text-emerald-200">
              {t("auth.hours")}
            </span>
          </div>
        </div>
      </aside>

      <section className="flex min-h-screen flex-col px-4 py-6 sm:px-8 lg:px-10 lg:py-8">
        <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white">
              <Landmark size={18} />
            </span>
            <span>
              <span className="block text-sm font-bold text-slate-900">{t("brand.name")}</span>
              <span className="text-[11px] text-slate-400">{t("auth.tagline")}</span>
            </span>
          </Link>
          <LanguageSwitcher variant="brand" />
        </div>

        <div
          className={`mx-auto w-full rounded-[28px] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8 ${
            active === "register" ? "max-w-2xl" : "max-w-xl"
          } my-auto`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex w-full min-w-0 basis-full gap-1 rounded-2xl bg-slate-100 p-1 sm:flex-1 sm:basis-auto">
              <Link
                href="/login"
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-[13px] font-semibold transition sm:px-3 sm:text-sm ${
                  active === "login"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Landmark size={15} className={active === "login" ? "text-brand" : "text-slate-400"} />
                <span className="sm:hidden">{t("auth.tabLoginShort")}</span>
                <span className="hidden sm:inline">{t("auth.tabLogin")}</span>
              </Link>
              <Link
                href="/register"
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-[13px] font-semibold transition sm:px-3 sm:text-sm ${
                  active === "register"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <UserPlus size={15} className={active === "register" ? "text-emerald-500" : "text-slate-400"} />
                <span className="sm:hidden">{t("auth.tabRegisterShort")}</span>
                <span className="hidden sm:inline">{t("auth.tabRegister")}</span>
              </Link>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {t("auth.serverOn")}
            </span>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}
