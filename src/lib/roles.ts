export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  SOMITI_ADMIN: "SOMITI_ADMIN",
  SECRETARY: "SECRETARY",
  CASHIER: "CASHIER",
  ACCOUNTANT: "ACCOUNTANT",
  FIELD_OFFICER: "FIELD_OFFICER",
  BRANCH_MANAGER: "BRANCH_MANAGER",
  MEMBER: "MEMBER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_META: Record<
  Role,
  { label: string; short: string; description: string }
> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    short: "System owner",
    description: "Full system control, somitis, subscriptions, and global settings.",
  },
  SOMITI_ADMIN: {
    label: "Somiti Admin / Chairman",
    short: "Chairman",
    description: "Overall management, member approval, policy, reports, and loan approval.",
  },
  SECRETARY: {
    label: "Secretary",
    short: "Secretary",
    description: "Member records, meeting minutes, notices, and daily operations.",
  },
  CASHIER: {
    label: "Cashier / Treasurer",
    short: "Cashier",
    description: "Collections, deposits, withdrawals, expenses, and cashbook.",
  },
  ACCOUNTANT: {
    label: "Accountant",
    short: "Accountant",
    description: "Ledger, vouchers, statements, balance sheet, and audit reports.",
  },
  FIELD_OFFICER: {
    label: "Field Officer / Collector",
    short: "Collector",
    description: "Daily, weekly, and monthly field collections with mobile entry.",
  },
  BRANCH_MANAGER: {
    label: "Branch Manager",
    short: "Branch",
    description: "Branch-level control and reports for multi-branch somitis.",
  },
  MEMBER: {
    label: "Member",
    short: "Member",
    description: "Own savings, loan status, installment schedule, and statements.",
  },
};

export const ROLE_LIST = Object.keys(ROLE_META) as Role[];

export const DASHBOARD_ACCESS: Record<string, Role[]> = {
  "/dashboard": ROLE_LIST,
  "/dashboard/somitis": ["SUPER_ADMIN"],
  "/dashboard/users": ["SUPER_ADMIN", "SOMITI_ADMIN", "SECRETARY", "BRANCH_MANAGER"],
  "/dashboard/members": ["SUPER_ADMIN", "SOMITI_ADMIN", "SECRETARY", "BRANCH_MANAGER", "FIELD_OFFICER", "CASHIER"],
  "/dashboard/create-member": ["SUPER_ADMIN", "SOMITI_ADMIN", "SECRETARY", "BRANCH_MANAGER"],
  "/dashboard/member-import": ["SUPER_ADMIN", "SOMITI_ADMIN", "SECRETARY", "BRANCH_MANAGER"],
  "/dashboard/members-info": ["SUPER_ADMIN", "SOMITI_ADMIN", "SECRETARY", "BRANCH_MANAGER", "FIELD_OFFICER", "CASHIER"],
  "/dashboard/members-info/[id]": ["SUPER_ADMIN", "SOMITI_ADMIN", "SECRETARY", "BRANCH_MANAGER", "FIELD_OFFICER", "CASHIER"],
  "/dashboard/member-list": ["SUPER_ADMIN", "SOMITI_ADMIN", "SECRETARY", "BRANCH_MANAGER", "FIELD_OFFICER", "CASHIER"],
  "/dashboard/fee-collection": ["SUPER_ADMIN", "SOMITI_ADMIN", "SECRETARY", "BRANCH_MANAGER", "FIELD_OFFICER", "CASHIER"],
  "/dashboard/fee-collections": ["SUPER_ADMIN", "SOMITI_ADMIN", "SECRETARY", "BRANCH_MANAGER", "FIELD_OFFICER", "CASHIER"],
  "/dashboard/fee-collections/[id]/receipt": ["SUPER_ADMIN", "SOMITI_ADMIN", "SECRETARY", "BRANCH_MANAGER", "FIELD_OFFICER", "CASHIER"],
  "/dashboard/late-fee-collection": ["SUPER_ADMIN", "SOMITI_ADMIN", "SECRETARY", "BRANCH_MANAGER", "FIELD_OFFICER", "CASHIER"],
  "/dashboard/service-charge": ["SUPER_ADMIN", "SOMITI_ADMIN", "SECRETARY", "BRANCH_MANAGER", "CASHIER"],
  "/dashboard/branches": ["SUPER_ADMIN", "SOMITI_ADMIN", "BRANCH_MANAGER", "SECRETARY", "FIELD_OFFICER"],
  "/dashboard/centers": ["SUPER_ADMIN", "SOMITI_ADMIN", "BRANCH_MANAGER", "SECRETARY", "FIELD_OFFICER", "CASHIER", "ACCOUNTANT"],
  "/dashboard/create-center": ["SUPER_ADMIN", "SOMITI_ADMIN", "SECRETARY", "BRANCH_MANAGER"],
  "/dashboard/areas": ["SUPER_ADMIN", "SOMITI_ADMIN", "BRANCH_MANAGER", "SECRETARY", "FIELD_OFFICER"],
  "/dashboard/collections": ["CASHIER", "FIELD_OFFICER", "BRANCH_MANAGER", "SOMITI_ADMIN"],
  "/dashboard/cashbook": ["CASHIER", "ACCOUNTANT", "SOMITI_ADMIN"],
  "/dashboard/ledger": ["ACCOUNTANT", "SOMITI_ADMIN"],
  "/dashboard/notices": ["SECRETARY", "SOMITI_ADMIN", "BRANCH_MANAGER"],
  "/dashboard/account": ["MEMBER"],
};

export function canAccessDashboardPath(role: Role, pathname: string): boolean {
  const allowed = DASHBOARD_ACCESS[pathname];
  if (allowed) return allowed.includes(role);
  if (pathname.startsWith("/dashboard/")) {
    return role !== "MEMBER";
  }
  return false;
}
