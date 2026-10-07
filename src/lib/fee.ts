import type { FeeType } from "@/types";

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBnDigits(value: string | number, locale = "bn") {
  const raw = String(value);
  if (!locale.startsWith("bn")) return raw;
  return raw.replace(/\d/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

export function moneyBdt(value?: number, locale = "en") {
  const n = Number(value || 0);
  const formatted = n.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `৳ ${toBnDigits(formatted, locale)}`;
}

export function formatFeeDate(value?: string, locale = "en") {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return toBnDigits(`${dd}-${mm}-${yyyy}`, locale);
}

export function feeTypeKey(type: FeeType) {
  return `fee.types.${type}` as const;
}

const ONES = [
  "",
  "এক",
  "দুই",
  "তিন",
  "চার",
  "পাঁচ",
  "ছয়",
  "সাত",
  "আট",
  "নয়",
  "দশ",
  "এগারো",
  "বারো",
  "তেরো",
  "চৌদ্দ",
  "পনেরো",
  "ষোল",
  "সতেরো",
  "আঠারো",
  "উনিশ",
];
const TENS = ["", "", "বিশ", "ত্রিশ", "চল্লিশ", "পঞ্চাশ", "ষাট", "সত্তর", "আশি", "নব্বই"];

function underHundred(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  if (!o) return TENS[t];
  // common Bangla compound forms for 21-99 are complex; keep readable hybrid
  return `${TENS[t]} ${ONES[o]}`.trim();
}

/** Simple Bangla amount-in-words for receipt (integer taka). */
export function amountInWordsBn(amount: number): string {
  const n = Math.round(Math.abs(Number(amount) || 0));
  if (n === 0) return "শূন্য টাকা মাত্র";
  if (n >= 10000000) return `${n.toLocaleString("en-BD")} টাকা মাত্র`;

  const parts: string[] = [];
  let rem = n;

  const lakh = Math.floor(rem / 100000);
  if (lakh) {
    parts.push(`${underHundred(lakh)} লক্ষ`);
    rem %= 100000;
  }
  const thousand = Math.floor(rem / 1000);
  if (thousand) {
    parts.push(`${underHundred(thousand)} হাজার`);
    rem %= 1000;
  }
  const hundred = Math.floor(rem / 100);
  if (hundred) {
    parts.push(`${ONES[hundred]} শত`);
    rem %= 100;
  }
  if (rem) parts.push(underHundred(rem));

  return `${parts.join(" ")} টাকা মাত্র`;
}

export function amountInWordsEn(amount: number): string {
  const n = Math.round(Math.abs(Number(amount) || 0));
  if (n === 0) return "Zero taka only";
  return `${n.toLocaleString("en-BD")} taka only`;
}
