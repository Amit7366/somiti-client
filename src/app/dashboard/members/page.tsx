"use client";

import Link from "next/link";
import {
  Banknote,
  Contact,
  FileSpreadsheet,
  HandCoins,
  History,
  Receipt,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { RoleGate } from "@/components/RoleGate";
import { useI18n } from "@/components/providers/I18nProvider";

const ALLOW = [
  "SUPER_ADMIN",
  "SOMITI_ADMIN",
  "SECRETARY",
  "BRANCH_MANAGER",
  "FIELD_OFFICER",
  "CASHIER",
] as const;

const ITEMS: {
  href: string;
  key: string;
  icon: LucideIcon;
  wrap: string;
}[] = [
  { href: "/dashboard/create-member", key: "createMember", icon: UserPlus, wrap: "bg-sky-100 text-sky-600" },
  {
    href: "/dashboard/member-import",
    key: "bulkMemberImport",
    icon: FileSpreadsheet,
    wrap: "bg-emerald-100 text-emerald-700",
  },
  { href: "/dashboard/members-info", key: "allMembersInfo", icon: Contact, wrap: "bg-violet-100 text-violet-600" },
  { href: "/dashboard/member-list", key: "memberList", icon: Users, wrap: "bg-sky-100 text-sky-500" },
  { href: "/dashboard/fee-collection", key: "feeCollection", icon: Banknote, wrap: "bg-emerald-100 text-emerald-600" },
  {
    href: "/dashboard/fee-collections",
    key: "allFeeCollections",
    icon: Receipt,
    wrap: "bg-teal-100 text-teal-600",
  },
  {
    href: "/dashboard/late-fee-collection",
    key: "lateFeeCollection",
    icon: History,
    wrap: "bg-orange-100 text-orange-600",
  },
  { href: "/dashboard/service-charge", key: "serviceCharge", icon: HandCoins, wrap: "bg-violet-100 text-violet-700" },
];

export default function MemberManagementMenuPage() {
  const { t } = useI18n();

  return (
    <RoleGate allow={[...ALLOW]}>
      <div className="mx-auto max-w-xl">
        <div className="overflow-hidden rounded-2xl bg-[#0b1f3a] p-4 shadow-lg sm:p-5">
          <div className="mb-4 flex items-center gap-3 px-1">
            <span className="h-8 w-1 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
            <h1 className="text-lg font-bold text-white sm:text-xl">{t("chair.nav.members")}</h1>
          </div>

          <div className="space-y-3">
            {ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl bg-white px-4 py-3.5 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.wrap}`}
                  >
                    <Icon size={22} strokeWidth={2.1} />
                  </span>
                  <span className="text-base font-bold text-[#0b1f3a]">{t(`chair.navChild.${item.key}`)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </RoleGate>
  );
}
