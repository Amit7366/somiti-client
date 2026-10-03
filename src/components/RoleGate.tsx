"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import type { Role } from "@/lib/roles";

export function RoleGate({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { t } = useI18n();
  if (!user || !allow.includes(user.role)) {
    return (
      <div className="rounded-2xl border border-sand bg-white p-8 text-sm text-ink/60">
        {t("common.roleDenied")}
      </div>
    );
  }
  return <>{children}</>;
}
