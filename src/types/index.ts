export type Role =
  | "SUPER_ADMIN"
  | "SOMITI_ADMIN"
  | "SECRETARY"
  | "CASHIER"
  | "ACCOUNTANT"
  | "FIELD_OFFICER"
  | "BRANCH_MANAGER"
  | "MEMBER";

export interface Somiti {
  _id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  settings?: {
    currency: string;
    collectionFrequency: string;
  };
  subscription?: {
    plan: string;
    status: string;
    expiresAt?: string;
  };
}

export interface Branch {
  _id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  somiti?: Somiti | string;
  manager?: { _id: string; name: string; phone: string; role: Role };
  centerCount?: number;
}

export type MeetingDay =
  | "SATURDAY"
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY";

export interface Area {
  _id: string;
  name: string;
  isActive: boolean;
  branch?: Branch | string;
  somiti?: Somiti | string;
  centerCount?: number;
}

export interface Center {
  _id: string;
  name: string;
  leaderName?: string;
  leaderMobile?: string;
  meetingDay?: MeetingDay;
  meetingTime?: string;
  address?: string;
  isActive: boolean;
  branch?: Branch | string;
  area?: Area | string;
  fieldWorker?: { _id: string; name: string; phone: string; role: Role } | string;
  somiti?: Somiti | string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: Role;
  somiti?: Somiti | string;
  branch?: Branch | string;
  nid?: string;
  address?: string;
  isActive: boolean;
  isApproved: boolean;
  permissions?: string[];
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: { path: string; message: string }[] | null;
}

export interface DashboardSummary {
  scope: "system" | "somiti" | "self";
  role: Role;
  roleMeta: { label: string; description: string };
  permissions: string[];
  cards: { key: string; label: string; value: number; hint?: string }[];
  metrics?: {
    activeMembers: number;
    centers: number;
    savingsBalance: number;
    overdueLoan: number;
    overdueInstallments: number;
    todayCollection: number;
    notifications: number;
  };
  recentTransactions?: {
    id: string;
    name: string;
    note: string;
    amount: number;
    date: string;
  }[];
}
