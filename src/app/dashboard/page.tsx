"use client";

import { useEffect, useState } from "react";
import { ChairmanOverview } from "@/components/dashboard/ChairmanOverview";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import type { DashboardSummary } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<DashboardSummary>("/dashboard/summary")
      .then((res) => setSummary(res.data))
      .catch((err: Error) => setError(err.message));
  }, []);

  const isChairmanWorkspace = user?.role !== "SUPER_ADMIN" && user?.role !== "MEMBER";

  if (isChairmanWorkspace) {
    return <ChairmanOverview summary={summary} error={error} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {user ? t(`roles.${user.role}.label`) : t("dashboard.fallbackTitle")}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          {user ? t(`roles.${user.role}.description`) : ""}
        </p>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(summary?.cards || []).map((card) => (
          <article key={card.key} className="rounded-2xl border border-slate-100 bg-white p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400">{t(`cards.${card.key}`)}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{card.value}</p>
            {card.hint ? <p className="mt-2 text-xs text-slate-400">{t("cards.comingNext")}</p> : null}
          </article>
        ))}
      </div>
      {user && !user.isApproved ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {t("dashboard.waitingApproval")}
        </div>
      ) : null}
    </div>
  );
}
