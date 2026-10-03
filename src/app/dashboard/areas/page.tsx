"use client";

import Link from "next/link";
import { Fragment, FormEvent, useEffect, useState } from "react";
import { RoleGate } from "@/components/RoleGate";
import { btnClass, cardClass, fieldClass, OrgHeader } from "@/components/org/OrgUi";
import { api } from "@/lib/api";
import { branchName } from "@/lib/org";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import type { Area, Branch, Center } from "@/types";

const ALLOW = ["SUPER_ADMIN", "SOMITI_ADMIN", "BRANCH_MANAGER", "SECRETARY", "FIELD_OFFICER"] as const;

export default function CenterAreaPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", branchId: "" });
  const canManage = Boolean(
    user?.permissions?.includes("center:manage") || user?.permissions?.includes("branch:manage")
  );

  async function load() {
    const [areaRes, branchRes, centerRes] = await Promise.all([
      api<Area[]>("/areas"),
      api<Branch[]>("/branches"),
      api<Center[]>("/centers"),
    ]);
    setAreas(areaRes.data);
    setBranches(branchRes.data);
    setCenters(centerRes.data);
  }

  useEffect(() => {
    load().catch((err: Error) => setError(err.message));
  }, []);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api("/areas", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          branchId: form.branchId || undefined,
        }),
      });
      setForm({ name: "", branchId: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("org.areaFailed"));
    }
  }

  function centersOf(areaId: string) {
    return centers.filter((center) => {
      const area = center.area;
      const id = typeof area === "object" ? area?._id : area;
      return id === areaId;
    });
  }

  return (
    <RoleGate allow={[...ALLOW]}>
      <div className="space-y-6">
        <OrgHeader title={t("org.centerArea")} subtitle={t("org.centerAreaSub")} />
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        {canManage ? (
          <form onSubmit={onCreate} className={`${cardClass} grid gap-3 sm:grid-cols-3`}>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-600">{t("org.areaName")}</span>
              <input
                className={fieldClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-600">{t("org.branchName")}</span>
              <select
                className={fieldClass}
                value={form.branchId}
                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
              >
                <option value="">{t("org.allBranches")}</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end">
              <button className={btnClass}>{t("org.addArea")}</button>
            </div>
          </form>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">{t("org.areaName")}</th>
                <th className="px-4 py-3">{t("org.branchName")}</th>
                <th className="px-4 py-3">{t("org.centers")}</th>
              </tr>
            </thead>
            <tbody>
              {areas.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-400" colSpan={3}>
                    {t("org.noAreas")}
                  </td>
                </tr>
              ) : null}
              {areas.map((area) => {
                const nested = centersOf(area._id);
                const open = openId === area._id;
                return (
                  <Fragment key={area._id}>
                    <tr className="border-t border-slate-100">
                      <td className="px-4 py-3 font-semibold text-slate-800">{area.name}</td>
                      <td className="px-4 py-3 text-slate-500">{branchName(area.branch) || t("org.allBranches")}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="text-xs font-semibold text-emerald-700"
                          onClick={() => setOpenId(open ? null : area._id)}
                        >
                          {area.centerCount ?? nested.length} {t("org.centers")}
                        </button>
                      </td>
                    </tr>
                    {open ? (
                      <tr className="border-t border-slate-50 bg-slate-50/70">
                        <td className="px-4 py-3" colSpan={3}>
                          {nested.length === 0 ? (
                            <p className="text-sm text-slate-400">{t("org.noCentersInArea")}</p>
                          ) : (
                            <ul className="space-y-1 text-sm">
                              {nested.map((center) => (
                                <li key={center._id} className="font-medium text-slate-700">
                                  {center.name}
                                  <span className="ml-2 text-xs font-normal text-slate-400">
                                    {branchName(center.branch)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                          <Link
                            href="/dashboard/create-center"
                            className="mt-2 inline-block text-xs font-semibold text-emerald-700"
                          >
                            {t("org.addCenter")} →
                          </Link>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </RoleGate>
  );
}
