"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RoleGate } from "@/components/RoleGate";
import { btnClass, fieldClass, OrgHeader } from "@/components/org/OrgUi";
import { api } from "@/lib/api";
import { useI18n } from "@/components/providers/I18nProvider";
import type { Member, MemberCategory } from "@/types";

const CATEGORY_LABEL: Record<MemberCategory, string> = {
  GENERAL: "memberForm.generalMember",
  MONTHLY_SAVINGS: "memberForm.monthlySavingsMember",
  DAILY_SAVINGS: "memberForm.dailySavingsMember",
  BORROWER: "memberForm.borrowerMember",
  SPECIAL: "memberForm.specialMember",
};

const ALLOW = [
  "SUPER_ADMIN",
  "SOMITI_ADMIN",
  "SECRETARY",
  "BRANCH_MANAGER",
  "FIELD_OFFICER",
  "CASHIER",
] as const;

export default function MemberListPage() {
  const { t } = useI18n();
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    api<Member[]>(`/members${qs}`)
      .then((res) => setMembers(res.data))
      .catch((err: Error) => setError(err.message));
  }, [search]);

  return (
    <RoleGate allow={[...ALLOW]}>
      <div className="space-y-6">
        <OrgHeader
          title={t("chair.navChild.memberList")}
          action={
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/members-info" className={`${btnClass} !bg-[#1e3a5f] hover:!bg-[#163049]`}>
                {t("chair.navChild.allMembersInfo")}
              </Link>
              <Link href="/dashboard/create-member" className={btnClass}>
                {t("chair.navChild.createMember")}
              </Link>
            </div>
          }
        />
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <input
          className={`${fieldClass} max-w-sm`}
          placeholder={t("chair.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">{t("memberForm.memberName")}</th>
                <th className="px-4 py-3">{t("memberForm.memberMobile")}</th>
                <th className="px-4 py-3">{t("memberForm.memberCategory")}</th>
                <th className="px-4 py-3">{t("memberForm.memberStatus")}</th>
                <th className="px-4 py-3">{t("memberForm.memberArea")}</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-400" colSpan={6}>
                    —
                  </td>
                </tr>
              ) : null}
              {members.map((member) => (
                <tr key={member._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-700">{member.code}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{member.name}</td>
                  <td className="px-4 py-3 text-slate-500">{member.mobile}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {t(CATEGORY_LABEL[member.category] ?? "memberForm.generalMember")}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{member.status}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {typeof member.area === "object" ? member.area?.name : "—"}
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
