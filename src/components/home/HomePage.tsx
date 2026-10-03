"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Building2,
  Calendar,
  Check,
  FileSpreadsheet,
  Landmark,
  Menu,
  MessageCircle,
  Phone,
  Play,
  Shield,
  Smartphone,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LoanCalculator } from "@/components/home/LoanCalculator";
import { useI18n } from "@/components/providers/I18nProvider";

const NAV = [
  { href: "#home", key: "home.navHome" },
  { href: "#features", key: "home.navFeatures" },
  { href: "#app", key: "home.navField" },
  { href: "#pricing", key: "home.navPricing" },
  { href: "#reviews", key: "home.navReviews" },
  { href: "#contact", key: "home.navContact" },
];

const MODULES = [
  { key: "member", icon: Building2, color: "bg-blue-50 text-brand" },
  { key: "savings", icon: Wallet, color: "bg-emerald-50 text-mint" },
  { key: "dps", icon: Calendar, color: "bg-violet-50 text-violet-500" },
  { key: "loan", icon: Landmark, color: "bg-amber-50 text-amber-500" },
  { key: "accounts", icon: FileSpreadsheet, color: "bg-sky-50 text-sky-500" },
  { key: "sms", icon: MessageCircle, color: "bg-rose-50 text-rose-500" },
] as const;

const FEATURES = [
  { key: "somiti", icon: Landmark, tone: "bg-blue-50 text-brand" },
  { key: "savings", icon: Wallet, tone: "bg-emerald-50 text-mint" },
  { key: "dps", icon: Calendar, tone: "bg-violet-50 text-violet-500" },
  { key: "loan", icon: Building2, tone: "bg-amber-50 text-amber-500" },
  { key: "reports", icon: FileSpreadsheet, tone: "bg-rose-50 text-rose-500" },
  { key: "security", icon: Shield, tone: "bg-teal-50 text-teal-600" },
] as const;

const PLANS = [
  { key: "planFree", price: 0, members: "৭ দিন", accent: "border-amber-300", button: "bg-amber-400 text-slate-900" },
  { key: "planStarter", price: 599, members: "২০০", accent: "border-slate-200", button: "bg-mint text-white" },
  { key: "planBasic", price: 999, members: "১,০০০", accent: "border-slate-200", button: "bg-brand text-white" },
  { key: "planStandard", price: 1499, members: "২,০০০", accent: "border-violet-400", button: "bg-violet-600 text-white", popular: true },
  { key: "planProfessional", price: 2499, members: "৫,০০০", accent: "border-orange-300", button: "bg-orange-500 text-white" },
  { key: "planBusiness", price: 3999, members: "৮,০০০", accent: "border-slate-200", button: "bg-mint text-white" },
  { key: "planEnterprise", price: 7999, members: "৪০,০০০", accent: "border-transparent bg-navy-deep text-white", button: "bg-brand text-white" },
];

export function HomePage() {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900 md:pb-0">
      <div className="bg-navy text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-xs sm:px-6">
          <p className="flex items-center gap-2 truncate">
            <span className="rounded bg-sky-400 px-1.5 py-0.5 text-[10px] font-bold text-navy">
              {t("home.version")}
            </span>
            <span className="hidden sm:inline">{t("home.promo")}</span>
            <span className="sm:hidden">{t("home.promo")}</span>
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <a href="https://wa.me/8801965841630" className="hidden items-center gap-1 md:flex">
              {t("home.whatsapp")}: +880 1965-841630
            </a>
            <LanguageSwitcher variant="dark" />
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white">
              <Landmark size={20} />
            </span>
            <span>
              <span className="block text-sm font-bold leading-tight text-slate-900">
                {t("brand.name")}
              </span>
              <span className="text-[11px] text-slate-400">{t("brand.tagline")}</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-3 text-[13px] text-slate-600 lg:flex">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-brand">
                {t(item.key)}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden shrink-0 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 lg:inline-flex"
            >
              {t("home.navLogin")}
            </Link>
            <Link
              href="/register"
              className="hidden shrink-0 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white lg:inline-flex"
            >
              {t("home.navTrial")}
            </Link>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-700 lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {menuOpen ? (
          <div className="space-y-1 border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm text-slate-700"
                onClick={() => setMenuOpen(false)}
              >
                {t(item.key)}
              </a>
            ))}
            <Link href="/login" className="block rounded-lg px-3 py-2 text-sm font-semibold">
              {t("home.navLogin")}
            </Link>
            <Link
              href="/register"
              className="block rounded-xl bg-brand px-3 py-2 text-center text-sm font-semibold text-white"
            >
              {t("home.navTrial")}
            </Link>
          </div>
        ) : null}
      </header>

      <section id="home" className="relative overflow-hidden px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_55%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="mx-auto w-fit max-w-full rounded-full bg-white px-4 py-1.5 text-xs font-medium text-brand shadow-sm">
            {t("home.heroBadge")}
          </p>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {t("home.heroTitleLead")}{" "}
            <span className="text-mint">{t("home.heroTitleAccent")}</span> {t("home.heroTitleTail")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            {t("home.heroBody")}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs sm:text-sm">
            {["heroChip1", "heroChip2", "heroChip3", "heroChip4"].map((key) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-slate-600 shadow-sm"
              >
                <Check size={14} className="text-mint" />
                {t(`home.${key}`)}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white sm:w-auto"
            >
              {t("home.heroLive")}
            </Link>
            <a
              href="#video"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 sm:w-auto"
            >
              <Play size={16} className="text-brand" />
              {t("home.heroVideo")}
            </a>
          </div>
        </div>
        <DashboardMock />
      </section>

      <section className="px-4 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {MODULES.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.key}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
              >
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${item.color}`}>
                  <Icon size={18} />
                </span>
                <span>
                  <p className="text-sm font-semibold">{t(`home.modules.${item.key}.title`)}</p>
                  <p className="text-xs text-slate-500">{t(`home.modules.${item.key}.body`)}</p>
                </span>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-10 bg-navy px-4 py-8 text-white sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-5">
          {[
            ["২,৫০০+", "somitis"],
            ["১,২৫,০০০+", "members"],
            ["৳ ৮৫০+ কোটি", "volume"],
            ["৯৯.৯%", "uptime"],
            ["২৪/৭", "support"],
          ].map(([value, key]) => (
            <div key={key} className="text-center">
              <p className="text-2xl font-extrabold sm:text-3xl">{value}</p>
              <p className="mt-1 text-xs text-white/70">{t(`home.stats.${key}`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            {t("home.featuresEyebrow")}
          </p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{t("home.featuresTitle")}</h2>
          <p className="mt-3 text-sm text-slate-500">{t("home.featuresSub")}</p>
        </div>
        <div className="mx-auto mt-10 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.key} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${feature.tone}`}>
                  <Icon size={22} />
                </span>
                <h3 className="mt-4 text-lg font-bold">
                  {t(`home.featureCards.${feature.key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {t(`home.featureCards.${feature.key}.body`)}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li className="flex gap-2">
                    <Check size={16} className="mt-0.5 text-mint" />
                    {t(`home.featureCards.${feature.key}.a`)}
                  </li>
                  <li className="flex gap-2">
                    <Check size={16} className="mt-0.5 text-mint" />
                    {t(`home.featureCards.${feature.key}.b`)}
                  </li>
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section id="app" className="bg-white px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div className="mx-auto w-full max-w-xs rounded-[2.2rem] border-8 border-slate-900 bg-slate-900 p-3 text-white shadow-2xl">
            <div className="rounded-3xl bg-white p-4 text-slate-900">
              <p className="text-xs font-semibold text-slate-500">মার্চকর্মী: আজিজ রোসেন</p>
              <p className="mt-4 text-xs text-slate-400">আজকের সংগৃহীত কিস্তি</p>
              <p className="text-3xl font-bold">৳ ২৮,৪০০</p>
              <div className="mt-4 rounded-2xl bg-blue-50 p-3 text-sm">সদস্য: ফাতেমা আক্তার</div>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-mint">{t("home.appEyebrow")}</p>
            <h2 className="mt-2 text-3xl font-bold">{t("home.appTitle")}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">{t("home.appBody")}</p>
            <ul className="mt-5 space-y-3 text-sm">
              {["appA", "appB", "appC"].map((key) => (
                <li key={key} className="flex gap-2">
                  <Check size={16} className="mt-0.5 text-mint" />
                  {t(`home.${key}`)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="video" className="bg-navy-deep px-4 py-16 text-white sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex aspect-video items-center justify-center rounded-3xl bg-[radial-gradient(circle_at_center,_#1d4ed8,_#0b1220)]">
            <button
              type="button"
              className="grid h-16 w-16 place-items-center rounded-full bg-brand"
              aria-label={t("home.heroVideo")}
            >
              <Play size={28} fill="white" />
            </button>
          </div>
          <p className="mt-4 text-center text-lg font-semibold">{t("home.videoTitle")}</p>
          <p className="text-center text-xs text-white/60">{t("home.videoMeta")}</p>
        </div>
      </section>

      <section id="reviews" className="px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <blockquote className="rounded-3xl bg-white p-8 shadow-sm">
            <p className="text-xs font-semibold text-brand">{t("home.quoteEyebrow")}</p>
            <p className="mt-4 text-lg leading-8 text-slate-700">“{t("home.quote")}”</p>
            <p className="mt-6 font-bold">{t("home.quoteName")}</p>
            <p className="text-sm text-slate-500">{t("home.quoteRole")}</p>
          </blockquote>
          <div>
            <p className="text-xs font-semibold text-mint">{t("home.partnersEyebrow")}</p>
            <h2 className="mt-2 text-2xl font-bold">{t("home.partnersTitle")}</h2>
            <p className="mt-2 text-sm text-slate-500">{t("home.partnersSub")}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {["bKash", "Nagad", "Rocket", "SSLCommerz", "Bank"].map((name) => (
                <div key={name} className="rounded-2xl bg-white p-4 text-center text-sm font-semibold shadow-sm">
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <LoanCalculator />

      <section id="pricing" className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold text-brand">{t("home.pricingEyebrow")}</p>
          <h2 className="mt-2 text-3xl font-bold">{t("home.pricingTitle")}</h2>
          <p className="mt-2 text-sm text-slate-500">{t("home.pricingSub")}</p>
          <div className="mx-auto mt-6 inline-flex rounded-full bg-slate-100 p-1 text-sm">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`rounded-full px-4 py-2 ${!yearly ? "bg-white font-semibold shadow-sm" : "text-slate-500"}`}
            >
              {t("home.monthly")}
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`rounded-full px-4 py-2 ${yearly ? "bg-white font-semibold shadow-sm" : "text-slate-500"}`}
            >
              {t("home.yearly")} <span className="text-mint">{t("home.save")}</span>
            </button>
          </div>
        </div>
        <div className="mx-auto mt-10 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const price = yearly ? Math.round(plan.price * 0.8) : plan.price;
            return (
              <article
                key={plan.key}
                className={`relative rounded-3xl border bg-white p-5 ${plan.accent} ${
                  plan.key === "planEnterprise" ? "bg-navy-deep text-white" : ""
                }`}
              >
                {plan.popular ? (
                  <span className="absolute -top-3 right-4 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    {t("home.popular")}
                  </span>
                ) : null}
                <h3 className="font-bold">{t(`home.${plan.key}`)}</h3>
                <p className="mt-1 text-xs opacity-70">{t("home.membersUpto", { n: plan.members })}</p>
                <p className="mt-4 text-3xl font-extrabold">
                  ৳ {price.toLocaleString("en-BD")}
                  <span className="text-sm font-medium opacity-60">{t("home.perMonth")}</span>
                </p>
                <Link
                  href="/register"
                  className={`mt-5 block rounded-xl py-2.5 text-center text-sm font-semibold ${plan.button}`}
                >
                  {t("home.choose")}
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="px-4 pb-8 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold">{t("home.faqTitle")}</h2>
          <p className="mt-2 text-center text-sm text-slate-500">{t("home.faqSub")}</p>
          <div className="mt-8 space-y-3">
            {[1, 2, 3, 4].map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => setOpenFaq(openFaq === index ? 0 : index)}
                className="w-full rounded-2xl bg-white px-5 py-4 text-left shadow-sm"
              >
                <span className="flex items-center justify-between gap-3 font-semibold">
                  {t(`home.faq${index}q`)}
                  <span className="text-slate-400">{openFaq === index ? "−" : "+"}</span>
                </span>
                {openFaq === index ? (
                  <span className="mt-2 block text-sm leading-6 text-slate-500">
                    {t(`home.faq${index}a`)}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-brand to-navy px-6 py-12 text-center text-white">
          <h2 className="text-3xl font-bold">{t("home.ctaTitle")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/80">{t("home.ctaBody")}</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand">
              {t("home.navTrial")}
            </Link>
            <a
              href="https://wa.me/8801965841630"
              className="rounded-full bg-mint px-6 py-3 text-sm font-semibold text-white"
            >
              {t("home.ctaWhatsapp")}
            </a>
          </div>
          <p className="mt-4 text-xs text-white/70">{t("home.ctaNote")}</p>
        </div>
      </section>

      <footer id="contact" className="bg-navy-deep px-4 py-12 text-sm text-white/70 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-bold text-white">{t("brand.name")}</p>
            <p className="mt-3 leading-6">{t("home.footerAbout")}</p>
          </div>
          <div>
            <p className="font-semibold text-white">{t("home.footerCompany")}</p>
            <div className="mt-3 space-y-2">
              <a href="#features" className="block">{t("home.navSolutions")}</a>
              <a href="#pricing" className="block">{t("home.navPricing")}</a>
            </div>
          </div>
          <div>
            <p className="font-semibold text-white">{t("home.footerSolutions")}</p>
            <div className="mt-3 space-y-2">
              <a href="#features" className="block">{t("home.featureCards.savings.title")}</a>
              <a href="#features" className="block">{t("home.featureCards.loan.title")}</a>
            </div>
          </div>
          <div>
            <p className="font-semibold text-white">{t("home.footerContact")}</p>
            <p className="mt-3">+880 1965-841630</p>
            <p>support@somitysolution.com</p>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-xs">{t("home.footerCopy")}</p>
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white py-2 text-[11px] md:hidden">
        {[
          ["#home", "home.navHome", Landmark],
          ["#calculator", "home.navCalc", Wallet],
          ["#pricing", "home.navPricing", Zap],
          ["#contact", "home.navContact", Phone],
          ["#app", "home.navApp", Smartphone],
        ].map(([href, key, Icon]) => {
          const ItemIcon = Icon as typeof Landmark;
          return (
            <a key={href as string} href={href as string} className="grid justify-items-center gap-1 text-slate-500">
              <ItemIcon size={18} />
              {t(key as string)}
            </a>
          );
        })}
      </nav>
    </div>
  );
}

function DashboardMock() {
  const { t } = useI18n();
  return (
    <div className="relative mx-auto mt-10 max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 text-[11px] text-slate-500">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-mint" />
          {t("home.mockUrl")}
        </span>
        <span className="hidden text-mint sm:inline">{t("home.mockLive")}</span>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [t("home.statMembers"), "১,২৪৫"],
          [t("home.statSavings"), "৳ ১২,৪৫,০০০"],
          [t("home.statLoan"), "৳ ৮,৭৫,০০০"],
          [t("home.statToday"), "৳ ৪৫,৫০০"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-3 px-4 pb-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-semibold">{t("home.chartTitle")}</p>
          <p className="text-xs text-slate-400">{t("home.chartSub")}</p>
          <svg viewBox="0 0 320 90" className="mt-4 h-24 w-full">
            <polyline
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              points="0,70 60,62 120,50 180,38 240,28 320,12"
            />
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              points="0,78 60,72 120,64 180,58 240,46 320,34"
            />
          </svg>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-semibold">{t("home.recentTitle")}</p>
          <ul className="mt-3 space-y-2 text-xs">
            {["মোঃ রফিকুল ইসলাম", "সালমা বেগম", "কামাল উদ্দিন"].map((name) => (
              <li key={name} className="flex justify-between rounded-lg bg-white px-3 py-2">
                <span>{name}</span>
                <span className="font-semibold text-mint">৳ ৫০০</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
