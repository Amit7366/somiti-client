"use client";

import { useI18n } from "@/components/providers/I18nProvider";

export function ComingSoon({
  titleKey,
  descriptionKey,
  title,
  description,
}: {
  titleKey?: string;
  descriptionKey?: string;
  title?: string;
  description?: string;
}) {
  const { t } = useI18n();
  const heading = title ?? (titleKey ? t(titleKey) : "");
  const body = description ?? (descriptionKey ? t(descriptionKey) : "");
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
        {t("common.comingNext")}
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">{heading}</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{body}</p>
    </div>
  );
}
