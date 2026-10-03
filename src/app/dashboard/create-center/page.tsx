"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RoleGate } from "@/components/RoleGate";
import { btnClass, cardClass, fieldClass, OrgHeader } from "@/components/org/OrgUi";
import { api } from "@/lib/api";
import { MEETING_DAYS } from "@/lib/org";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import type { Area, Branch, User } from "@/types";

const ALLOW = ["SUPER_ADMIN", "SOMITI_ADMIN", "SECRETARY", "BRANCH_MANAGER"] as const;

export default function CreateCenterPage() {
  return (
    <Suspense>
      <CreateCenterForm />
    </Suspense>
  );
}

function CreateCenterForm() {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetBranch = searchParams.get("branchId") || "";
  const canManage = Boolean(
    user?.permissions?.includes("center:manage") || user?.permissions?.includes("branch:manage")
  );

  const [branches, setBranches] = useState<Branch[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    branchId: presetBranch,
    areaId: "",
    leaderName: "",
    leaderMobile: "",
    meetingDay: "",
    meetingTime: "",
    fieldWorkerId: "",
    address: "",
  });

  useEffect(() => {
    Promise.all([
      api<Branch[]>("/branches"),
      api<Area[]>("/areas"),
      api<User[]>("/users?role=FIELD_OFFICER"),
    ])
      .then(([branchRes, areaRes, workerRes]) => {
        setBranches(branchRes.data);
        setAreas(areaRes.data);
        setWorkers(workerRes.data);
        if (!presetBranch && branchRes.data.length === 1) {
          setForm((current) => ({ ...current, branchId: branchRes.data[0]._id }));
        }
      })
      .catch((err: Error) => setError(err.message));
  }, [presetBranch]);

  const areaOptions = useMemo(
    () =>
      areas.filter((area) => {
        if (!form.branchId) return true;
        const id = typeof area.branch === "object" ? area.branch?._id : area.branch;
        return !id || id === form.branchId;
      }),
    [areas, form.branchId]
  );

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api("/centers", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          branchId: form.branchId,
          areaId: form.areaId || undefined,
          leaderName: form.leaderName || undefined,
          leaderMobile: form.leaderMobile || undefined,
          meetingDay: form.meetingDay || undefined,
          meetingTime: form.meetingTime || undefined,
          fieldWorkerId: form.fieldWorkerId || undefined,
          address: form.address || undefined,
        }),
      });
      router.push("/dashboard/centers");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("org.centerFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <RoleGate allow={[...ALLOW]}>
      <div className="space-y-6">
        <OrgHeader title={t("org.createCenter")} subtitle={t("org.createCenterSub")} />
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {!canManage ? (
          <p className="text-sm text-slate-500">{t("common.roleDenied")}</p>
        ) : (
          <form onSubmit={onCreate} className={`${cardClass} grid gap-4 sm:grid-cols-2`}>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-600">{t("org.centerName")}</span>
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
                onChange={(e) => setForm({ ...form, branchId: e.target.value, areaId: "" })}
                required
              >
                <option value="">{t("org.selectBranch")}</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-600">{t("org.leaderName")}</span>
              <input
                className={fieldClass}
                value={form.leaderName}
                onChange={(e) => setForm({ ...form, leaderName: e.target.value })}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-600">{t("org.leaderMobile")}</span>
              <input
                className={fieldClass}
                value={form.leaderMobile}
                onChange={(e) => setForm({ ...form, leaderMobile: e.target.value })}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-600">{t("org.meetingDay")}</span>
              <select
                className={fieldClass}
                value={form.meetingDay}
                onChange={(e) => setForm({ ...form, meetingDay: e.target.value })}
              >
                <option value="">{t("org.selectDay")}</option>
                {MEETING_DAYS.map((day) => (
                  <option key={day} value={day}>
                    {t(`weekdays.${day}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-600">{t("org.meetingTime")}</span>
              <input
                type="time"
                className={fieldClass}
                value={form.meetingTime}
                onChange={(e) => setForm({ ...form, meetingTime: e.target.value })}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-600">{t("org.fieldWorker")}</span>
              <select
                className={fieldClass}
                value={form.fieldWorkerId}
                onChange={(e) => setForm({ ...form, fieldWorkerId: e.target.value })}
              >
                <option value="">{t("org.selectWorker")}</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-600">{t("org.centerArea")}</span>
              <select
                className={fieldClass}
                value={form.areaId}
                onChange={(e) => setForm({ ...form, areaId: e.target.value })}
              >
                <option value="">{t("org.selectArea")}</option>
                {areaOptions.map((area) => (
                  <option key={area._id} value={area._id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-slate-600">{t("org.location")}</span>
              <input
                className={fieldClass}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </label>
            <div className="sm:col-span-2">
              <button className={btnClass} disabled={saving}>
                {saving ? t("common.loading") : t("org.saveCenter")}
              </button>
            </div>
          </form>
        )}
      </div>
    </RoleGate>
  );
}
