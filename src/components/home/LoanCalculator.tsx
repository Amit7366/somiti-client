"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/components/providers/I18nProvider";

function taka(value: number) {
  return `৳ ${Math.round(value).toLocaleString("en-BD")}`;
}

export function LoanCalculator() {
  const { t } = useI18n();
  const [amount, setAmount] = useState(50000);
  const [months, setMonths] = useState(12);
  const [rate, setRate] = useState(12);
  const [kind, setKind] = useState<"daily" | "weekly" | "monthly">("monthly");

  const periods =
    kind === "daily" ? months * 30 : kind === "weekly" ? months * 4 : months;
  const periodRate = rate / 100 / (kind === "daily" ? 365 : kind === "weekly" ? 52 : 12);

  const result = useMemo(() => {
    const r = periodRate;
    const n = Math.max(periods, 1);
    const installment =
      r === 0 ? amount / n : (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = installment * n;
    return { installment, charge: total - amount, total };
  }, [amount, periodRate, periods]);

  return (
    <section id="calculator" className="bg-white px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-brand">
          {t("home.calcEyebrow")}
        </p>
        <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">{t("home.calcTitle")}</h2>
        <p className="mt-2 text-sm text-slate-500">{t("home.calcSub")}</p>
        <div className="mx-auto mt-6 grid max-w-md grid-cols-2 rounded-2xl bg-slate-100 p-1 text-sm font-semibold">
          <span className="rounded-xl bg-brand py-2.5 text-white">{t("home.calcLoan")}</span>
          <span className="rounded-xl py-2.5 text-slate-500">{t("home.calcDps")}</span>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-3xl space-y-6 rounded-3xl border border-slate-100 bg-slate-50 p-5 sm:p-8">
        <SliderRow
          label={t("home.calcAmount")}
          valueLabel={taka(amount)}
          min={10000}
          max={500000}
          step={1000}
          value={amount}
          onChange={setAmount}
          minLabel="৳ ১০,০০০"
          maxLabel="৳ ৫,০০,০০০"
        />
        <SliderRow
          label={t("home.calcTenure")}
          valueLabel={`${months} ${t("home.months")} (${Math.round(months / 12) || 1} ${t("home.year")})`}
          min={3}
          max={36}
          step={1}
          value={months}
          onChange={setMonths}
          minLabel={`৩ ${t("home.months")}`}
          maxLabel={`৩৬ ${t("home.months")}`}
        />
        <SliderRow
          label={t("home.calcRate")}
          valueLabel={`${rate}%`}
          min={5}
          max={25}
          step={1}
          value={rate}
          onChange={setRate}
          minLabel="৫%"
          maxLabel="২৫%"
        />

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">{t("home.calcKind")}</p>
          <div className="grid grid-cols-3 gap-2">
            {(["daily", "weekly", "monthly"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setKind(option)}
                className={`rounded-xl border py-2.5 text-sm font-semibold ${
                  kind === option
                    ? "border-brand bg-white text-brand"
                    : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                {t(`home.calc${option[0].toUpperCase()}${option.slice(1)}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-navy-deep p-5 text-left text-white">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-white/70">{t("home.calcEmi")}</p>
            <p className="text-3xl font-bold text-amber-300">{taka(result.installment)}</p>
          </div>
          <div className="mt-4 flex justify-between text-sm text-white/80">
            <span>
              {t("home.calcCharge")}
              <br />
              <strong className="text-white">{taka(result.charge)}</strong>
            </span>
            <span className="text-right">
              {t("home.calcTotal")}
              <br />
              <strong className="text-amber-300">{taka(result.total)}</strong>
            </span>
          </div>
          <Link
            href="/register"
            className="mt-5 block rounded-xl bg-mint py-3 text-center text-sm font-semibold text-white"
          >
            {t("home.calcCta")} →
          </Link>
        </div>
      </div>
    </section>
  );
}

function SliderRow({
  label,
  valueLabel,
  min,
  max,
  step,
  value,
  onChange,
  minLabel,
  maxLabel,
}: {
  label: string;
  valueLabel: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  minLabel: string;
  maxLabel: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-start justify-between gap-3 text-sm font-semibold text-slate-700">
        {label}
        <span className="rounded-lg bg-blue-50 px-2 py-1 text-brand">{valueLabel}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand"
      />
      <span className="mt-1 flex justify-between text-xs text-slate-400">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </span>
    </label>
  );
}
