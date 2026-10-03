import type { LucideIcon } from "lucide-react";
import {
  AreaChart,
  ArrowUpFromLine,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Coins,
  CreditCard,
  FileSpreadsheet,
  FolderOpen,
  HandCoins,
  Home,
  Landmark,
  Layers,
  LifeBuoy,
  MapPin,
  MessageSquare,
  PiggyBank,
  Printer,
  Receipt,
  Scale,
  Settings,
  Share2,
  Shield,
  Sparkles,
  Target,
  UserCog,
  UserPlus,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import type { Role } from "@/lib/roles";

export type NavChild = { href: string; key: string };
export type NavGroup = {
  key: string;
  icon: LucideIcon;
  roles: Role[];
  href?: string;
  badge?: "overdue" | "notify";
  children?: NavChild[];
  danger?: boolean;
};

const CHAIR: Role[] = ["SOMITI_ADMIN"];
const STAFF: Role[] = [
  "SOMITI_ADMIN",
  "SECRETARY",
  "CASHIER",
  "ACCOUNTANT",
  "FIELD_OFFICER",
  "BRANCH_MANAGER",
];
const OPS: Role[] = ["SOMITI_ADMIN", "SECRETARY", "BRANCH_MANAGER"];
const ALL_STAFF: Role[] = ["SUPER_ADMIN", ...STAFF];
const FINANCE: Role[] = ["SOMITI_ADMIN", "CASHIER", "ACCOUNTANT"];
const REPORT: Role[] = ["SOMITI_ADMIN", "ACCOUNTANT", "BRANCH_MANAGER"];

export const CHAIR_NAV: NavGroup[] = [
  { key: "home", icon: Home, href: "/dashboard", roles: [...ALL_STAFF, "MEMBER"] },
  { key: "somitis", icon: Landmark, href: "/dashboard/somitis", roles: ["SUPER_ADMIN"] },
  { key: "serviceRequests", icon: LifeBuoy, href: "/dashboard/service-requests", roles: CHAIR },
  {
    key: "areas",
    icon: MapPin,
    roles: OPS,
    children: [
      { href: "/dashboard/branches", key: "branchList" },
      { href: "/dashboard/centers", key: "allCenters" },
      { href: "/dashboard/create-center", key: "newCenter" },
      { href: "/dashboard/areas", key: "centerArea" },
    ],
  },
  {
    key: "members",
    icon: Users,
    roles: ["SUPER_ADMIN", "SOMITI_ADMIN", "SECRETARY", "BRANCH_MANAGER"],
    children: [
      { href: "/dashboard/users", key: "admitMember" },
      { href: "/dashboard/users", key: "memberList" },
      { href: "/dashboard/member-profile", key: "memberProfile" },
      { href: "/dashboard/member-transfer", key: "memberTransfer" },
    ],
  },
  {
    key: "savings",
    icon: Wallet,
    roles: STAFF,
    children: [
      { href: "/dashboard/savings-deposit", key: "savingsDeposit" },
      { href: "/dashboard/savings-withdraw", key: "savingsWithdraw" },
      { href: "/dashboard/schemes", key: "savingsScheme" },
      { href: "/dashboard/daily-savings-sheet", key: "dailySavingsSheet" },
    ],
  },
  {
    key: "loans",
    icon: CircleDollarSign,
    roles: STAFF,
    badge: "overdue",
    children: [
      { href: "/dashboard/loan-apply", key: "loanApply" },
      { href: "/dashboard/loan-disburse", key: "loanDisburse" },
      { href: "/dashboard/collections", key: "installmentCollection" },
      { href: "/dashboard/overdue-report", key: "overdueLoans" },
    ],
  },
  {
    key: "dps",
    icon: CalendarDays,
    roles: STAFF,
    children: [
      { href: "/dashboard/dps", key: "newDps" },
      { href: "/dashboard/dps-collection", key: "dpsCollect" },
      { href: "/dashboard/dps-close", key: "dpsClose" },
    ],
  },
  {
    key: "fdr",
    icon: Landmark,
    roles: STAFF,
    children: [
      { href: "/dashboard/fdr", key: "newFdr" },
      { href: "/dashboard/fdr-profit", key: "fdrProfit" },
      { href: "/dashboard/fdr-close", key: "fdrClose" },
    ],
  },
  {
    key: "shares",
    icon: Share2,
    roles: CHAIR,
    children: [
      { href: "/dashboard/shares", key: "shareTrade" },
      { href: "/dashboard/share-holders", key: "shareHolders" },
      { href: "/dashboard/dividend", key: "dividend" },
    ],
  },
  {
    key: "investments",
    icon: Briefcase,
    roles: CHAIR,
    children: [
      { href: "/dashboard/investments", key: "newInvestment" },
      { href: "/dashboard/investment-profit", key: "investmentProfit" },
      { href: "/dashboard/project-monitor", key: "projectMonitor" },
    ],
  },
  {
    key: "insurance",
    icon: Shield,
    roles: CHAIR,
    children: [
      { href: "/dashboard/insurance", key: "premium" },
      { href: "/dashboard/insurance-claim", key: "claim" },
    ],
  },
  {
    key: "incomeExpense",
    icon: Receipt,
    roles: FINANCE,
    children: [
      { href: "/dashboard/income", key: "income" },
      { href: "/dashboard/expense", key: "expense" },
      { href: "/dashboard/voucher", key: "voucher" },
      { href: "/dashboard/cashbook", key: "cashbook" },
    ],
  },
  {
    key: "bank",
    icon: Building2,
    roles: FINANCE,
    children: [
      { href: "/dashboard/bank", key: "bankList" },
      { href: "/dashboard/bank-txn", key: "bankTxn" },
      { href: "/dashboard/bank-reconcile", key: "bankReconcile" },
    ],
  },
  {
    key: "reports",
    icon: FileSpreadsheet,
    roles: REPORT,
    children: [
      { href: "/dashboard/collection-report", key: "collectionReport" },
      { href: "/dashboard/loan-report", key: "loanReport" },
      { href: "/dashboard/dps-report", key: "dpsReport" },
      { href: "/dashboard/audit", key: "auditReport" },
    ],
  },
  {
    key: "accountsReport",
    icon: BookOpen,
    roles: ["SOMITI_ADMIN", "ACCOUNTANT"],
    children: [
      { href: "/dashboard/profit-loss", key: "profitLoss" },
      { href: "/dashboard/trial-balance", key: "trialBalance" },
      { href: "/dashboard/ledger", key: "ledger" },
      { href: "/dashboard/balance-sheet", key: "balanceSheet" },
    ],
  },
  {
    key: "staff",
    icon: UserCog,
    roles: ["SOMITI_ADMIN", "SECRETARY"],
    children: [
      { href: "/dashboard/staff", key: "officerList" },
      { href: "/dashboard/permissions", key: "permissions" },
      { href: "/dashboard/field-monitor", key: "fieldMonitor" },
    ],
  },
  {
    key: "notifications",
    icon: Bell,
    roles: ["SOMITI_ADMIN", "SECRETARY", "BRANCH_MANAGER"],
    badge: "notify",
    children: [
      { href: "/dashboard/sms", key: "smsPanel" },
      { href: "/dashboard/sms-template", key: "smsTemplate" },
      { href: "/dashboard/notices", key: "noticeHistory" },
    ],
  },
  {
    key: "settings",
    icon: Settings,
    roles: CHAIR,
    children: [
      { href: "/dashboard/profile", key: "orgProfile" },
      { href: "/dashboard/branch-settings", key: "branchSetting" },
      { href: "/dashboard/print-setup", key: "printSetup" },
      { href: "/dashboard/backup", key: "backup" },
    ],
  },
  { key: "billing", icon: CreditCard, href: "/dashboard/billing", roles: CHAIR },
];

export const MODULE_TILES: {
  href: string;
  key: string;
  icon: LucideIcon;
  wrap: string;
}[] = [
  { href: "/dashboard/areas", key: "areaBlock", icon: MapPin, wrap: "bg-sky-100 text-sky-600" },
  { href: "/dashboard/centers", key: "centerList", icon: Layers, wrap: "bg-emerald-100 text-emerald-600" },
  { href: "/dashboard/schemes", key: "schemes", icon: ClipboardList, wrap: "bg-amber-100 text-amber-600" },
  { href: "/dashboard/collections", key: "fieldCollection", icon: FileSpreadsheet, wrap: "bg-violet-100 text-violet-600" },
  { href: "/dashboard/loan-collection", key: "loanCollection", icon: HandCoins, wrap: "bg-rose-100 text-rose-600" },
  { href: "/dashboard/installment-receive", key: "installmentReceive", icon: Wallet, wrap: "bg-teal-100 text-teal-600" },
  { href: "/dashboard/savings-deposit", key: "savingsDeposit", icon: CircleDollarSign, wrap: "bg-emerald-100 text-emerald-600" },
  { href: "/dashboard/savings-withdraw", key: "savingsWithdraw", icon: ArrowUpFromLine, wrap: "bg-orange-100 text-orange-600" },
  { href: "/dashboard/share-capital", key: "shareCapital", icon: AreaChart, wrap: "bg-indigo-100 text-indigo-600" },
  { href: "/dashboard/field-button", key: "fieldButton", icon: UserCog, wrap: "bg-violet-100 text-violet-600" },
  { href: "/dashboard/loan-disburse", key: "loanDisburse", icon: Target, wrap: "bg-rose-100 text-rose-600" },
  { href: "/dashboard/monthly-dps", key: "monthlyDps", icon: CalendarDays, wrap: "bg-sky-100 text-sky-600" },
  { href: "/dashboard/daily-collection", key: "dailyCollection", icon: Zap, wrap: "bg-teal-100 text-teal-600" },
  { href: "/dashboard/collection-report", key: "collectionReport", icon: FolderOpen, wrap: "bg-orange-100 text-orange-600" },
  { href: "/dashboard/bank", key: "bankAccount", icon: Landmark, wrap: "bg-slate-100 text-slate-600" },
  { href: "/dashboard/daily-closing", key: "dailyClosing", icon: Sparkles, wrap: "bg-violet-100 text-violet-600" },
  { href: "/dashboard/expense", key: "expense", icon: Receipt, wrap: "bg-rose-100 text-rose-500" },
  { href: "/dashboard/income", key: "income", icon: AreaChart, wrap: "bg-emerald-100 text-emerald-600" },
  { href: "/dashboard/create-center", key: "createCenter", icon: MapPin, wrap: "bg-teal-100 text-teal-600" },
  { href: "/dashboard/users", key: "newMember", icon: UserPlus, wrap: "bg-sky-100 text-sky-600" },
  { href: "/dashboard/bank-txn", key: "bankTxn", icon: MessageSquare, wrap: "bg-violet-100 text-violet-600" },
  { href: "/dashboard/permissions", key: "permissions", icon: UserCog, wrap: "bg-amber-100 text-amber-700" },
  { href: "/dashboard/sms", key: "sms", icon: MessageSquare, wrap: "bg-rose-100 text-rose-500" },
  { href: "/dashboard/holiday", key: "holiday", icon: CalendarDays, wrap: "bg-slate-100 text-slate-600" },
  { href: "/dashboard/block-collection", key: "blockCollection", icon: FileSpreadsheet, wrap: "bg-indigo-100 text-indigo-600" },
  { href: "/dashboard/passbook", key: "passbook", icon: BookOpen, wrap: "bg-emerald-100 text-emerald-700" },
  { href: "/dashboard/investments", key: "investmentLedger", icon: AreaChart, wrap: "bg-sky-100 text-sky-700" },
  { href: "/dashboard/welfare-fund", key: "welfareFund", icon: PiggyBank, wrap: "bg-lime-100 text-lime-700" },
  { href: "/dashboard/profit-loss", key: "profitLoss", icon: Scale, wrap: "bg-amber-100 text-amber-700" },
  { href: "/dashboard/ledger", key: "ledger", icon: FolderOpen, wrap: "bg-violet-100 text-violet-700" },
  { href: "/dashboard/officers", key: "officers", icon: Users, wrap: "bg-slate-100 text-slate-700" },
  { href: "/dashboard/voucher", key: "voucher", icon: FileSpreadsheet, wrap: "bg-orange-100 text-orange-700" },
  { href: "/dashboard/trial-balance", key: "trialBalance", icon: Scale, wrap: "bg-rose-100 text-rose-600" },
  { href: "/dashboard/cashbook", key: "cashbook", icon: BookOpen, wrap: "bg-orange-100 text-orange-700" },
  { href: "/dashboard/loan-close", key: "loanClose", icon: CheckCircle2, wrap: "bg-emerald-100 text-emerald-700" },
];

export const QUICK_ACTIONS: {
  href: string;
  key: string;
  tone: string;
  icon: LucideIcon;
}[] = [
  { href: "/dashboard/reports", key: "audit", tone: "bg-emerald-100 text-emerald-600", icon: FolderOpen },
  { href: "/dashboard/collection-sheet", key: "collectionSheet", tone: "bg-sky-100 text-sky-600", icon: ClipboardList },
  { href: "/dashboard/fdr-collection", key: "fdrCollection", tone: "bg-amber-100 text-amber-600", icon: Coins },
  { href: "/dashboard/fdr", key: "fdrManage", tone: "bg-blue-100 text-blue-600", icon: Landmark },
  { href: "/dashboard/fdr-profit", key: "fdrProfit", tone: "bg-teal-100 text-teal-600", icon: HandCoins },
  { href: "/dashboard/profile", key: "profile", tone: "bg-violet-100 text-violet-600", icon: Building2 },
  { href: "/dashboard/print-report", key: "printReport", tone: "bg-slate-100 text-slate-600", icon: Printer },
  { href: "/dashboard/rules", key: "rules", tone: "bg-amber-100 text-amber-700", icon: BookOpen },
  { href: "/dashboard/batch-notice", key: "batchNotice", tone: "bg-emerald-100 text-emerald-700", icon: Sparkles },
];

export function titleForModule(slug: string, t: (key: string) => string) {
  const camel = slug.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
  const keys = [
    `chair.nav.${camel}`,
    `chair.navChild.${camel}`,
    `chair.mod.${camel}`,
    `chair.quick.${camel}`,
  ];
  for (const key of keys) {
    const label = t(key);
    if (label !== key) return label;
  }
  return slug.replace(/-/g, " ");
}
