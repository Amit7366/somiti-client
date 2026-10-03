export const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

const BN_MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

const EN_MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function toBnDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => BN_DIGITS[Number(digit)]);
}

export function formatDashboardDate(date: Date, locale: "bn" | "en"): string {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const dd = String(day).padStart(2, "0");
  if (locale === "en") {
    return `${dd} ${EN_MONTHS_SHORT[month]} ${year}`;
  }
  return `${toBnDigits(dd)} ${BN_MONTHS[month]}, ${toBnDigits(year)}`;
}

export function formatMoney(amount: number, locale: "bn" | "en"): string {
  const formatted = amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return locale === "bn" ? `৳ ${toBnDigits(formatted)}` : `৳ ${formatted}`;
}

export function formatCount(value: number, locale: "bn" | "en"): string {
  return locale === "bn" ? toBnDigits(value) : String(value);
}
