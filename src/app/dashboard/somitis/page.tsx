"use client";

import { FormEvent, useEffect, useState } from "react";
import { RoleGate } from "@/components/RoleGate";
import { api } from "@/lib/api";
import { useI18n } from "@/components/providers/I18nProvider";
import type { Somiti } from "@/types";

export default function SomitisPage() {
  const { t } = useI18n();
  const [somitis, setSomitis] = useState<Somiti[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    code: "",
    phone: "",
    adminName: "",
    adminPhone: "",
    adminEmail: "",
    adminPassword: "Password@123",
  });

  async function load() {
    const res = await api<Somiti[]>("/somitis");
    setSomitis(res.data);
  }

  useEffect(() => {
    load().catch((err: Error) => setError(err.message));
  }, []);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api("/somitis", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          code: form.code,
          phone: form.phone,
          admin: {
            name: form.adminName,
            phone: form.adminPhone,
            email: form.adminEmail,
            password: form.adminPassword,
          },
        }),
      });
      setForm({
        name: "",
        code: "",
        phone: "",
        adminName: "",
        adminPhone: "",
        adminEmail: "",
        adminPassword: "Password@123",
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("somitis.createFailed"));
    }
  }

  return (
    <RoleGate allow={["SUPER_ADMIN"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-forest-deep">{t("somitis.title")}</h1>
          <p className="text-sm text-ink/60">{t("somitis.subtitle")}</p>
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <form onSubmit={onCreate} className="grid gap-3 rounded-2xl border border-sand bg-white p-4 sm:grid-cols-2">
          <input className="rounded-xl border border-sand px-3 py-2 text-sm" placeholder={t("somitis.name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="rounded-xl border border-sand px-3 py-2 text-sm" placeholder={t("common.code")} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          <input className="rounded-xl border border-sand px-3 py-2 text-sm" placeholder={t("common.phone")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="rounded-xl border border-sand px-3 py-2 text-sm" placeholder={t("somitis.chairmanName")} value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} required />
          <input className="rounded-xl border border-sand px-3 py-2 text-sm" placeholder={t("somitis.chairmanPhone")} value={form.adminPhone} onChange={(e) => setForm({ ...form, adminPhone: e.target.value })} required />
          <input className="rounded-xl border border-sand px-3 py-2 text-sm" placeholder={t("somitis.chairmanEmail")} value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} required />
          <button className="rounded-xl bg-forest py-2 text-sm font-semibold text-cream sm:col-span-2">{t("somitis.create")}</button>
        </form>
        <div className="grid gap-4 sm:grid-cols-2">
          {somitis.map((somiti) => (
            <article key={somiti._id} className="rounded-2xl border border-sand bg-white p-5">
              <p className="text-xs uppercase tracking-wider text-gold">{somiti.code}</p>
              <h2 className="mt-1 text-lg font-semibold text-forest">{somiti.name}</h2>
              <p className="mt-2 text-sm text-ink/60">{somiti.phone || t("common.noPhone")}</p>
              <p className="mt-1 text-xs text-ink/50">
                {t(`subscription.${somiti.subscription?.status || "trial"}`)} · {t(`frequency.${somiti.settings?.collectionFrequency || "weekly"}`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </RoleGate>
  );
}
