import type { Currency } from "@/lib/types";

/**
 * Format a number into standard financial number format with 2 decimal places and commas (e.g., "14,500.00").
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a monetary amount.
 * When includeSymbol is false (default), returns the clean English formatted number (e.g. "14,500.00")
 * so that the column header can contain the currency symbol (L.E) without cluttering each row.
 */
export function formatCurrency(
  amount: number,
  currency: Currency = "EGP",
  _locale?: string,
  includeSymbol: boolean = false
): string {
  const formattedNumber = formatAmount(amount);

  if (!includeSymbol) {
    return formattedNumber;
  }

  const currencyMap: Record<Currency, string> = {
    EGP: "L.E",
    SAR: "SAR",
    AED: "AED",
    USD: "$",
    EUR: "€",
  };

  const symbol = currencyMap[currency] || (currency === "EGP" ? "L.E" : currency || "L.E");
  return `${formattedNumber} ${symbol}`;
}

/**
 * Format a date string with Arabic month names and English numbers (e.g., "15 يناير 2026").
 */
export function formatDate(date: string, locale: string = "ar"): string {
  const resolvedLocale = locale === "ar" ? "ar-EG-u-nu-latn" : "en-US";
  const dateObj = new Date(date);

  return new Intl.DateTimeFormat(resolvedLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
}

/**
 * Format a date string as a short date with Arabic month and English numbers (e.g., "15 يناير").
 */
export function formatDateShort(date: string, locale: string = "ar"): string {
  const resolvedLocale = locale === "ar" ? "ar-EG-u-nu-latn" : "en-US";
  const dateObj = new Date(date);

  return new Intl.DateTimeFormat(resolvedLocale, {
    month: "short",
    day: "numeric",
  }).format(dateObj);
}

/**
 * Format a number with standard English digits and grouping (e.g., "1,234").
 */
export function formatNumber(num: number, _locale?: string): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format a percentage value with English digits (e.g., "15.5%").
 */
export function formatPercentage(value: number, _locale?: string): string {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
  return `${formatted}%`;
}

/**
 * Format a month string (YYYY-MM) with Arabic month name and English year digits (e.g., "يناير 2026").
 */
export function formatMonth(monthStr: string, locale: string = "ar"): string {
  const resolvedLocale = locale === "ar" ? "ar-EG-u-nu-latn" : "en-US";
  const [year, month] = monthStr.split("-").map(Number);
  const dateObj = new Date(year, month - 1, 1);

  return new Intl.DateTimeFormat(resolvedLocale, {
    year: "numeric",
    month: "long",
  }).format(dateObj);
}

/**
 * Parse an arbitrary time string like "08:00 ص", "8:00 AM", "17:00", "05:00 م" into fractional hours from midnight (0 to 24).
 */
export function parseTimeToHours(timeStr?: string): number | null {
  if (!timeStr || !timeStr.trim()) return null;
  const clean = timeStr.trim().toLowerCase();

  const isPM = clean.includes("م") || clean.includes("pm");
  const isAM = clean.includes("ص") || clean.includes("am");

  const match = clean.match(/(\d{1,2})(?::(\d{1,2}))?/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;

  if (isPM && hours < 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  }

  return hours + minutes / 60;
}

/**
 * Calculate total hours worked between check-in and departure time.
 * Default fallback is 9 hours (standard 270h / 30 days) if departure is not provided.
 */
export function calculateWorkedHours(checkIn?: string, departure?: string): number {
  const start = parseTimeToHours(checkIn);
  const end = parseTimeToHours(departure);

  if (start === null || end === null) {
    return 9;
  }

  let diff = end - start;
  if (diff < 0) {
    diff += 24;
  }

  return Math.round(diff * 100) / 100;
}
