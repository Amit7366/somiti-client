export const MEETING_DAYS = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
] as const;

export type MeetingDay = (typeof MEETING_DAYS)[number];

export function branchName(value?: { name: string } | string | null) {
  if (!value) return "";
  return typeof value === "object" ? value.name : "";
}

export function personName(value?: { name: string } | string | null) {
  if (!value) return "";
  return typeof value === "object" ? value.name : "";
}
