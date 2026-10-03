"use client";

import Link from "next/link";
import { Fragment, FormEvent, useEffect, useState } from "react";
import { RoleGate } from "@/components/RoleGate";
import { btnClass, cardClass, fieldClass, OrgHeader } from "@/components/org/OrgUi";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import type { Branch, Center } from "@/types";

const ALLOW = ["SUPER_ADMIN", "SOMITI_ADMIN", "BRANCH_MANAGER", "SECRETARY", "FIELD_OFFICER"] as const;

export default function BranchListPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const canManage = user?.permissions?.includes("branch:manage");

  async function load() {
    const [branchRes, centerRes] = await Promise.all([
      api<Branch[]>("/branches"),
      api<Center[]>("/centers"),
    ]);
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
      await api("/branches", { method: "POST", body: JSON.stringify(form) });
      setForm({ name: "", phone: "", address: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("branches.createFailed"));
    }
  }

  function centersOf(branchId: string) {
    return centers.filter((center) => {
      const branch = center.branch;
      const id = typeof branch === "object" ? branch?._id : branch;
      return id === branchId;
    });
  }

  return (
    <RoleGate allow={[...ALLOW]}>
      <div className="space-y-6">
        <OrgHeader title={t("org.branchList")} subtitle={t("org.branchSubtitle")} />
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        {canManage ? (
          <form onSubmit={onCreate} className={`${cardClass} grid gap-3 sm:grid-cols-4`}>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-600">{t("org.branchName")}</span>
              <input
                className={fieldClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-600">{t("org.phone")}</span>
              <input
                className={fieldClass}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-slate-600">{t("org.address")}</span>
              <input
                className={fieldClass}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </label>
            <div className="sm:col-span-4">
              <button className={btnClass}>{t("org.addBranch")}</button>
            </div>
          </form>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">{t("org.branchName")}</th>
                <th className="px-4 py-3">{t("org.phone")}</th>
                <th className="px-4 py-3">{t("org.address")}</th>
                <th className="px-4 py-3">{t("org.centers")}</th>
              </tr>
            </thead>
            <tbody>
              {branches.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-400" colSpan={4}>
                    {t("org.noBranches")}
                  </td>
                </tr>
              ) : null}
              {branches.map((branch) => {
                const nested = centersOf(branch._id);
                const open = openId === branch._id;
                return (
                  <Fragment key={branch._id}>
                    <tr className="border-t border-slate-100">
                      <td className="px-4 py-3 font-semibold text-slate-800">{branch.name}</td>
                      <td className="px-4 py-3 text-slate-500">{branch.phone || "—"}</td>
                      <td className="px-4 py-3 text-slate-500">{branch.address || "—"}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="text-xs font-semibold text-emerald-700"
                          onClick={() => setOpenId(open ? null : branch._id)}
                        >
                          {branch.centerCount ?? nested.length} {t("org.centers")}
                        </button>
                      </td>
                    </tr>
                    {open ? (
                      <tr className="border-t border-slate-50 bg-slate-50/70">
                        <td className="px-4 py-3" colSpan={4}>
                          {nested.length === 0 ? (
                            <p className="text-sm text-slate-400">{t("org.noCentersInBranch")}</p>
                          ) : (
                            <ul className="space-y-1 text-sm">
                              {nested.map((center) => (
                                <li key={center._id} className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="font-medium text-slate-700">{center.name}</span>
                                  <span className="text-xs text-slate-400">
                                    {center.leaderName || t("org.noLeader")} · {center.meetingTime || "—"}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                          <Link
                            href={`/dashboard/create-center?branchId=${branch._id}`}
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
