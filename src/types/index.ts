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
  registrationNo?: string;
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

export type MemberCategory =
  | "GENERAL"
  | "MONTHLY_SAVINGS"
  | "DAILY_SAVINGS"
  | "BORROWER"
  | "SPECIAL";
export type MemberStatus = "ACTIVE" | "INACTIVE" | "CLOSED";

export interface Nominee {
  name: string;
  mobile: string;
  relation?: string;
  nationalId?: string;
  sharePercent: number;
  address?: string;
  photoUrl?: string;
  signatureUrl?: string;
  isPrimary?: boolean;
}

export interface MemberAccountControls {
  profileFrozen: boolean;
  savingsFrozen: boolean;
  dpsFrozen: boolean;
  fdrFrozen: boolean;
  loanFrozen: boolean;
}

export interface Member {
  _id: string;
  code: string;
  name: string;
  mobile: string;
  category: MemberCategory;
  status: MemberStatus;
  joinDate: string;
  address?: string;
  permanentAddress?: string;
  nid?: string;
  fatherOrHusbandName?: string;
  motherOrWifeName?: string;
  annualIncome?: number;
  admissionFee?: number;
  passbookNo?: string;
  gender?: string;
  dateOfBirth?: string;
  occupation?: string;
  photoUrl?: string;
  signatureUrl?: string;
  nidFrontUrl?: string;
  nidBackUrl?: string;
  area?: Area | string;
  branch?: Branch | string;
  assignedStaff?: User | string;
  createdBy?: User | string;
  nominees: Nominee[];
  accountControls?: MemberAccountControls;
  isActive: boolean;
  createdAt: string;
}

export type FeeType = "ADMISSION" | "FORM" | "SERVICE_CHARGE" | "LATE" | "OTHER";
export type FeePaymentMethod = "CASH" | "MFS" | "BANK";
export type FeeStatus = "DRAFT" | "COMPLETED";

export interface FeeCollection {
  _id: string;
  receiptNo: string;
  collectionDate: string;
  feeType: FeeType;
  feeAmount: number;
  stampFee: number;
  otherFee: number;
  totalAmount: number;
  paymentMethod: FeePaymentMethod;
  remarks?: string;
  status: FeeStatus;
  printReceipt: boolean;
  sendSms: boolean;
  member: Member | string;
  area?: Area | string;
  branch?: Branch | string;
  somiti?: Somiti | string;
  collectedBy?: User | string;
  createdAt: string;
  updatedAt?: string;
}

export interface FeeSummary {
  totalAmount: number;
  totalEntries: number;
  todayAmount: number;
  todayEntries: number;
  serviceChargeAmount: number;
  admissionOtherAmount: number;
  dailyTarget: number;
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
