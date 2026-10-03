"use client";

import { useParams } from "next/navigation";
import { ComingSoon } from "@/components/ComingSoon";
import { titleForModule } from "@/components/dashboard/nav";
import { useI18n } from "@/components/providers/I18nProvider";

export default function DashboardModulePage() {
  const params = useParams<{ module: string }>();
  const { t } = useI18n();
  const slug = String(params.module ?? "");
  return <ComingSoon title={titleForModule(slug, t)} description={t("chair.moduleSoon")} />;
}
