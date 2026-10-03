"use client";

import { FormEvent, useEffect, useState } from "react";
import { RoleGate } from "@/components/RoleGate";
import { api } from "@/lib/api";
import { useI18n } from "@/components/providers/I18nProvider";
import { type Role } from "@/lib/roles";
import type { User } from "@/types";
import { useAuth } from "@/components/providers/AuthProvider";

const STAFF_ROLES: Role[] = [
  "SOMITI_ADMIN",
  "SECRETARY",
  "CASHIER",
  "ACCOUNTANT",
  "FIELD_OFFICER",
  "BRANCH_MANAGER",
  "MEMBER",
];

export default function UsersPage() {
  const { t } = useI18n();
  const { user: actor } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "Password@123",
    role: "SECRETARY" as Role,
  });

  async function load() {
    const res = await api<User[]>(`/users${status ? `?status=${status}` : ""}`);
    setUsers(res.data);
  }

  useEffect(() => {
    load().catch((err: Error) => setError(err.message));
  }, [status]);

  async function approve(id: string) {
    await api(`/users/${id}/approve`, { method: "PATCH" });
    await load();
  }

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api("/users", { method: "POST", body: JSON.stringify(form) });
      setForm({ ...form, name: "", phone: "", email: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("people.createFailed"));
    }
  }

  const canWrite = actor?.permissions?.includes("user:write");

  return (
    <RoleGate allow={["SUPER_ADMIN", "SOMITI_ADMIN", "SECRETARY", "BRANCH_MANAGER"]}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-forest-deep">{t("people.title")}</h1>
            <p className="text-sm text-ink/60">{t("people.subtitle")}</p>
          </div>
          <select
            className="rounded-xl border border-sand bg-white px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">{t("common.all")}</option>
            <option value="pending">{t("common.pending")}</option>
            <option value="approved">{t("common.approved")}</option>
            <option value="inactive">{t("common.inactive")}</option>
          </select>
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        {canWrite ? (
          <form onSubmit={onCreate} className="grid gap-3 rounded-2xl border border-sand bg-white p-4 sm:grid-cols-5">
            <input
              placeholder={t("people.placeholderName")}
              className="rounded-xl border border-sand px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              placeholder={t("people.placeholderPhone")}
              className="rounded-xl border border-sand px-3 py-2 text-sm"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <input
              placeholder={t("people.placeholderEmail")}
              className="rounded-xl border border-sand px-3 py-2 text-sm"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <select
              className="rounded-xl border border-sand px-3 py-2 text-sm"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
            >
              {STAFF_ROLES.map((role) => (
                <option key={role} value={role}>
                  {t(`roles.${role}.short`)}
                </option>
              ))}
            </select>
            <button className="rounded-xl bg-forest px-3 py-2 text-sm font-semibold text-cream">
              {t("people.add")}
            </button>
          </form>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-sand bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-mist text-xs uppercase tracking-wider text-ink/50">
              <tr>
                <th className="px-4 py-3">{t("common.name")}</th>
                <th className="px-4 py-3">{t("common.role")}</th>
                <th className="px-4 py-3">{t("common.phone")}</th>
                <th className="px-4 py-3">{t("common.status")}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-sand">
                  <td className="px-4 py-3">
                    <p className="font-medium text-forest">{user.name}</p>
                    <p className="text-xs text-ink/50">{user.email}</p>
                  </td>
                  <td className="px-4 py-3">{t(`roles.${user.role}.short`)}</td>
                  <td className="px-4 py-3">{user.phone}</td>
                  <td className="px-4 py-3">
                    {user.isApproved ? t("common.approved") : t("common.pending")}
                    {!user.isActive ? ` · ${t("common.inactive")}` : ""}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!user.isApproved && actor?.permissions?.includes("member:approve") ? (
                      <button
                        type="button"
                        onClick={() => approve(user.id)}
                        className="text-xs font-semibold text-pine"
                      >
                        {t("people.approve")}
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RoleGate>
  );
}
