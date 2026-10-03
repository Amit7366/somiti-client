"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { canAccessDashboardPath } from "@/lib/roles";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    if (!canAccessDashboardPath(user.role, pathname)) {
      router.replace("/dashboard");
    }
  }, [user, pathname, router]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f3f6fb] text-sm text-slate-500">
        {t("dashboard.loading")}
      </div>
    );
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
