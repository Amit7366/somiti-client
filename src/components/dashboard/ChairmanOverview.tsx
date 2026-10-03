"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownRight,
  CalendarDays,
  CircleDollarSign,
  FileSpreadsheet,
  HandCoins,
  PiggyBank,
  Users,
} from "lucide-react";
import { MODULE_TILES, QUICK_ACTIONS } from "@/components/dashboard/nav";
import { useI18n } from "@/components/providers/I18nProvider";
import { formatCount, formatDashboardDate, formatMoney, toBnDigits } from "@/lib/format";
import type { DashboardSummary } from "@/types";

const CHART = [
  { month: "May 2026", savings: 10, collect: 48, savingsAmt: 2500, collectAmt: 14000 },
  { month: "Jun 2026", savings: 43, collect: 66, savingsAmt: 13000, collectAmt: 20000 },
  { month: "Jul 2026", savings: 40, collect: 73, savingsAmt: 12000, collectAmt: 22000 },
  { month: "Aug 2026", savings: 0, collect: 18, savingsAmt: 0, collectAmt: 5200 },
  { month: "Sep 2026", savings: 83, collect: 0, savingsAmt: 25000, collectAmt: 0 },
  { month: "Oct 2026", savings: 0, collect: 0, savingsAmt: 0, collectAmt: 0 },
];

const Y_LABELS = ["৳৩০,০০০", "৳২৫,০০০", "৳২০,০০০", "৳১৫,০০০", "৳১০,০০০", "৳৫,০০০", "৳০"];
const Y_LABELS_EN = ["৳30,000", "৳25,000", "৳20,000", "৳15,000", "৳10,000", "৳5,000", "৳0"];

function moneyTip(amount: number, locale: "bn" | "en") {
  return formatMoney(amount, locale);
}

export function ChairmanOverview({
  summary,
  error,
}: {
  summary: DashboardSummary | null;
  error?: string;
}) {
  const { t, locale } = useI18n();
  const metrics = summary?.metrics;
  const overdue = metrics?.overdueInstallments ?? 0;
  const tx = summary?.recentTransactions ?? [];
  const yLabels = locale === "bn" ? Y_LABELS : Y_LABELS_EN;

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-rose-400/30 bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 p-4 text-white shadow-lg shadow-rose-900/10 md:flex-row md:items-center">
        <div className="flex items-start gap-3.5 md:items-center">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/30 bg-white/20">
            <AlertTriangle size={18} className="animate-pulse" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold tracking-wide">{t("chair.alertTitle")}</h3>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-rose-700 shadow-sm">
                {formatCount(overdue, locale)} {t("chair.alertBadge")}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-rose-100">{t("chair.alertBody")}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 self-end md:self-center">
          <Link
            href="/dashboard/overdue-report"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50"
          >
            <FileSpreadsheet size={14} />
            {t("chair.overdueReport")}
          </Link>
          <Link
            href="/dashboard/collections"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-600"
          >
            <HandCoins size={14} />
            {t("chair.collectInstallment")}
          </Link>
        </div>
      </section>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t("chair.overviewTitle")}</h1>
          <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
            <CalendarDays size={14} className="text-slate-400" />
            {t("chair.updatedAt")}: {formatDashboardDate(new Date(), locale)}
          </p>
        </div>
        <Link
          href="/dashboard/collection-sheet"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-teal-700/20 hover:bg-teal-700"
        >
          <FileSpreadsheet size={16} />
          {t("chair.makeSheet")}
        </Link>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-700 p-5 text-white shadow-md shadow-teal-900/10">
          <div className="relative z-10">
            <p className="text-xs font-medium text-teal-100">{t("chair.statMembers")}</p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight">
              {formatCount(metrics?.activeMembers ?? 0, locale)}
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-teal-100">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              {formatCount(metrics?.centers ?? 0, locale)} {t("chair.centers")}
            </p>
          </div>
          <Users className="pointer-events-none absolute -bottom-3 -right-3 h-28 w-28 text-white/10 transition-transform duration-300 group-hover:scale-105" />
        </article>
        <article className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-md shadow-emerald-900/10">
          <div className="relative z-10">
            <p className="text-xs font-medium text-emerald-100">{t("chair.statSavings")}</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight lg:text-3xl">
              {formatMoney(metrics?.savingsBalance ?? 0, locale)}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs font-medium text-emerald-100">
              <span>
                {t("chair.todayIn")}: {formatMoney(metrics?.todayCollection ?? 0, locale)}
              </span>
              <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px]">{t("chair.dpsFdr")}</span>
            </div>
          </div>
          <PiggyBank className="pointer-events-none absolute -bottom-2 -right-2 h-28 w-28 text-white/10 transition-transform duration-300 group-hover:scale-105" />
        </article>
        <article className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 p-5 text-white shadow-md shadow-purple-900/10">
          <div className="relative z-10">
            <p className="text-xs font-medium text-purple-100">{t("chair.statLoan")}</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight lg:text-3xl">
              {formatMoney(metrics?.overdueLoan ?? 0, locale)}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs font-medium text-purple-100">
              <span>{t("chair.activeLoans")}</span>
              <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px]">{t("chair.portfolio")}</span>
            </div>
          </div>
          <CircleDollarSign className="pointer-events-none absolute -bottom-3 -right-3 h-28 w-28 text-white/10 transition-transform duration-300 group-hover:scale-105" />
        </article>
        <article className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-orange-600 p-5 text-white shadow-md shadow-rose-900/10">
          <div className="relative z-10">
            <p className="text-xs font-medium text-orange-100">{t("chair.statOverdue")}</p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight">
              {formatCount(overdue, locale)}
              {t("chair.pieces")}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs font-medium text-orange-100">
              <span>
                {t("chair.todayCollect")}: {formatMoney(0, locale)}
              </span>
              <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-yellow-200">
                {t("chair.nudge")}
              </span>
            </div>
          </div>
          <AlertTriangle className="pointer-events-none absolute -bottom-2 -right-2 h-28 w-28 text-white/10 transition-transform duration-300 group-hover:scale-105" />
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-8">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <span className="rounded-xl bg-teal-50 p-2 text-teal-700">
                <AreaMini />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t("chair.chartTitle")}</h3>
                <p className="text-xs text-slate-400">{t("chair.chartSub")}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded bg-teal-500" />
                {t("chair.chartSavings")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded bg-purple-500" />
                {t("chair.chartCollect")}
              </span>
            </div>
          </div>
          <div className="flex h-64 pt-6">
            <div className="flex w-14 select-none flex-col justify-between pr-3 text-right font-mono text-[11px] text-slate-400">
              {yLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <div className="relative flex flex-1 flex-col justify-between border-b border-l border-slate-200 pl-2">
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="h-0 w-full border-b border-slate-100" />
                ))}
              </div>
              <div className="relative z-10 flex h-full items-end justify-around px-2">
                {CHART.map((bar) => (
                  <div key={bar.month} className="group flex cursor-pointer items-end gap-1.5">
                    <div
                      className="relative w-4 rounded-t bg-teal-500/80 transition-all hover:bg-teal-600 sm:w-6"
                      style={{ height: bar.savings ? `${bar.savings}%` : "2px" }}
                    >
                      {bar.savingsAmt ? (
                        <span className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 text-[10px] text-white opacity-0 shadow group-hover:opacity-100">
                          {moneyTip(bar.savingsAmt, locale)}
                        </span>
                      ) : null}
                    </div>
                    <div
                      className="relative w-4 rounded-t bg-purple-400 transition-all hover:bg-purple-500 sm:w-6"
                      style={{ height: bar.collect ? `${bar.collect}%` : "2px" }}
                    >
                      {bar.collectAmt ? (
                        <span className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 text-[10px] text-white opacity-0 shadow group-hover:opacity-100">
                          {moneyTip(bar.collectAmt, locale)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-2 flex justify-around pl-14 text-[10px] text-slate-400">
            {CHART.map((bar) => (
              <span key={bar.month}>{locale === "bn" ? toBnDigits(bar.month) : bar.month}</span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-800">{t("chair.recentTitle")}</p>
            <span className="text-[11px] font-semibold text-emerald-600">{t("chair.liveUpdate")}</span>
          </div>
          {tx.length === 0 ? (
            <p className="mt-10 text-center text-sm text-slate-400">{t("chair.noTxn")}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {tx.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                    <ArrowDownRight size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{item.name}</p>
                    <p className="truncate text-[11px] text-slate-400">{item.note}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">+{formatMoney(item.amount, locale)}</p>
                    <p className="text-[10px] text-slate-400">{item.date}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/dashboard/collections"
            className="mt-5 block text-center text-sm font-semibold text-emerald-600"
          >
            {t("chair.seeAllTxn")} →
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">{t("chair.modulesTitle")}</h3>
            <p className="text-xs text-slate-500">{t("chair.modulesSub")}</p>
          </div>
          <span className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {t("chair.management")}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
          {MODULE_TILES.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.key}
                href={tile.href}
                className="group flex flex-col items-center justify-center rounded-xl border border-slate-100 p-3.5 text-center hover:border-emerald-300 hover:bg-emerald-50/40"
              >
                <span
                  className={`grid h-10 w-10 place-items-center rounded-xl transition-transform group-hover:scale-110 ${tile.wrap}`}
                >
                  <Icon size={20} />
                </span>
                <span className="mt-2.5 text-xs font-semibold leading-tight text-slate-700">
                  {t(`chair.mod.${tile.key}`)}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-9">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.key}
                href={action.href}
                className="group flex flex-col items-center gap-2 rounded-xl border border-slate-100 px-2 py-4 text-center hover:bg-slate-50"
              >
                <span
                  className={`grid h-11 w-11 place-items-center rounded-2xl transition-transform group-hover:scale-110 ${action.tone}`}
                >
                  <Icon size={18} />
                </span>
                <span className="text-[12px] font-medium leading-4 text-slate-600">
                  {t(`chair.quick.${action.key}`)}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function AreaMini() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
