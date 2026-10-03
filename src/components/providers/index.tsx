"use client";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import type { Locale } from "@/lib/i18n";

export function Providers({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  return (
    <I18nProvider initialLocale={locale}>
      <AuthProvider>{children}</AuthProvider>
    </I18nProvider>
  );
}
