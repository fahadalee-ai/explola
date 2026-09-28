import type { Currency, Filters } from "./types";

export const CURRENCIES: Currency[] = ["USD", "GBP", "EUR", "AUD", "ZAR"];

const RATES: Record<Currency, number> = {
  USD: 1,
  GBP: 0.78,
  EUR: 0.92,
  AUD: 1.53,
  ZAR: 18.1,
};

const SYMBOLS: Record<Currency, string> = {
  USD: "$",
  GBP: "£",
  EUR: "€",
  AUD: "A$",
  ZAR: "R",
};

export function money(usd: number, currency: Currency) {
  const value = Math.round(usd * RATES[currency]);
  return `${SYMBOLS[currency]}${value.toLocaleString("en-US")}`;
}

export function priceRange(from: number, to: number, currency: Currency) {
  return `${money(from, currency)} – ${money(to, currency)}`;
}

export function haptic(ms = 12) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* unsupported */
  }
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
}

export function passwordChecks(pw: string) {
  return {
    length: pw.length >= 8,
    letter: /[A-Za-z]/.test(pw),
    number: /\d/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
  };
}

export function passwordStrong(pw: string) {
  const c = passwordChecks(pw);
  return c.length && c.letter && c.number && c.symbol;
}

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const CATEGORIES = [
  "Safari",
  "Gorilla Trekking",
  "Honeymoon",
  "Family",
  "Beach and Safari",
  "Photography",
  "Luxury",
  "Budget",
  "Cultural",
  "Adventure",
];

export const ACTIVITIES = [
  "Game drives",
  "Walking safari",
  "Boat safari",
  "Gorilla trekking",
  "Hot air balloon",
  "Cultural visit",
  "Birding",
  "Night drive",
];

export const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Sweden",
  "Switzerland",
  "Australia",
  "Canada",
  "India",
  "Singapore",
  "Japan",
  "United Arab Emirates",
  "South Africa",
  "Kenya",
  "Tanzania",
  "Uganda",
  "Rwanda",
  "Botswana",
  "Namibia",
  "Zambia",
  "Zimbabwe",
  "Morocco",
  "Egypt",
];

export const emptyFilters = (): Filters => ({
  country: "",
  park: "",
  types: [],
  duration: [3, 14],
  budget: [800, 12000],
  month: "",
  groupSize: 2,
  stay: "",
  activities: [],
  rating: 0,
  verifiedOnly: false,
  language: "",
  groupType: "",
});

export function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 14) return `${day}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function todayISO() {
  return new Date().toISOString();
}
