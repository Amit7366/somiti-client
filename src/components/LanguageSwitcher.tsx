"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitcher({
  variant = "light",
}: {
  variant?: "light" | "dark" | "brand" | "compact";
}) {
  const { locale, setLocale, t } = useI18n();
  const options: Locale[] = ["bn", "en"];

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={() => setLocale(locale === "bn" ? "en" : "bn")}
        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
      >
        {locale === "bn" ? "বাং / EN" : "EN / বাং"}
      </button>
    );
  }

  const shell =
    variant === "dark"
      ? "bg-white/10 text-cream"
      : variant === "brand"
        ? "border border-slate-200 bg-white text-slate-600"
        : "bg-sand text-forest";

  return (
    <div
      className={`inline-flex rounded-full p-0.5 text-xs font-medium ${shell}`}
      role="group"
      aria-label={t("language.bn") + " / " + t("language.en")}
    >
      {options.map((option) => {
        const active = locale === option;
        const activeClass =
          variant === "dark"
            ? "bg-white text-navy"
            : variant === "brand"
              ? "bg-brand text-white"
              : "bg-forest text-cream";
        const idleClass =
          variant === "dark"
            ? "text-cream/70 hover:text-cream"
            : variant === "brand"
              ? "text-slate-500 hover:text-slate-800"
              : "text-forest/70 hover:text-forest";
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option)}
            className={`rounded-full px-3 py-1 transition ${active ? activeClass : idleClass}`}
          >
            {t(`language.${option}`)}
          </button>
        );
      })}
    </div>
  );
}
