"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RoleGate } from "@/components/RoleGate";
import { btnClass, fieldClass, OrgHeader } from "@/components/org/OrgUi";
import { api } from "@/lib/api";
import { branchName, personName } from "@/lib/org";
import { useI18n } from "@/components/providers/I18nProvider";
import type { Area, Branch, Center } from "@/types";

const ALLOW = [
  "SUPER_ADMIN",
  "SOMITI_ADMIN",
  "BRANCH_MANAGER",
  "SECRETARY",
  "FIELD_OFFICER",
  "CASHIER",
  "ACCOUNTANT",
] as const;

export default function CentersPage() {
  const { t } = useI18n();
  const [centers, setCenters] = useState<Center[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [branchId, setBranchId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const params = new URLSearchParams();
    if (branchId) params.set("branchId", branchId);
    if (areaId) params.set("areaId", areaId);
    const qs = params.toString();
    const [centerRes, branchRes, areaRes] = await Promise.all([
      api<Center[]>(`/centers${qs ? `?${qs}` : ""}`),
      api<Branch[]>("/branches"),
      api<Area[]>("/areas"),
    ]);
    setCenters(centerRes.data);
    setBranches(branchRes.data);
    setAreas(areaRes.data);
  }

  useEffect(() => {
    load().catch((err: Error) => setError(err.message));
  }, [branchId, areaId]);

  const areaOptions = useMemo(
    () =>
      areas.filter((area) => {
        if (!branchId) return true;
        const id = typeof area.branch === "object" ? area.branch?._id : area.branch;
        return !id || id === branchId;
      }),
    [areas, branchId]
  );

  return (
    <RoleGate allow={[...ALLOW]}>
      <div className="space-y-6">
        <OrgHeader
          title={t("org.allCenters")}
          subtitle={t("org.allCentersSub")}
          action={
            <Link href="/dashboard/create-center" className={btnClass}>
              {t("org.createCenter")}
            </Link>
          }
        />
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          <select className={`${fieldClass} max-w-xs`} value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            <option value="">{t("org.allBranches")}</option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>
          <select className={`${fieldClass} max-w-xs`} value={areaId} onChange={(e) => setAreaId(e.target.value)}>
            <option value="">{t("org.allAreas")}</option>
            {areaOptions.map((area) => (
              <option key={area._id} value={area._id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">{t("org.centerName")}</th>
                <th className="px-4 py-3">{t("org.branchName")}</th>
                <th className="px-4 py-3">{t("org.leaderName")}</th>
                <th className="px-4 py-3">{t("org.leaderMobile")}</th>
                <th className="px-4 py-3">{t("org.meetingDay")}</th>
                <th className="px-4 py-3">{t("org.meetingTime")}</th>
                <th className="px-4 py-3">{t("org.fieldWorker")}</th>
                <th className="px-4 py-3">{t("org.location")}</th>
              </tr>
            </thead>
            <tbody>
              {centers.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-400" colSpan={8}>
                    {t("org.noCenters")}
                  </td>
                </tr>
              ) : null}
              {centers.map((center) => (
                <tr key={center._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-800">{center.name}</td>
                  <td className="px-4 py-3 text-slate-500">{branchName(center.branch) || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{center.leaderName || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{center.leaderMobile || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {center.meetingDay ? t(`weekdays.${center.meetingDay}`) : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{center.meetingTime || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{personName(center.fieldWorker) || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{center.address || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RoleGate>
  );
}
