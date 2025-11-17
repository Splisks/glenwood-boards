// lib/themes.ts

export type ThemeId =
  | "classic-blue"
  | "coke-red"
  | "breast-cancer-pink"
  | "christmas-classic"
  | "valentines-pink"
  | "st-patricks-green";

export type ThemeConfig = {
  id: ThemeId;
  label: string;
  background: string;
  headerBg: string;
  headerText: string;
  headerBorder: string;
  rowText: string;
  priceText: string;
  accent: string;
  noticeBg: string;
  noticeText: string;
};

export const THEMES: Record<ThemeId, ThemeConfig> = {
  "classic-blue": {
    id: "classic-blue",
    label: "Classic Blue",
    background: "#007bff",
    headerBg: "#00cb31",
    headerText: "#ffffff",
    headerBorder: "#003b7a",
    rowText: "#ffffff",
    priceText: "#ffffff",
    accent: "#005fcc",
    noticeBg: "#003b7a",
    noticeText: "#ffffff",
  },
  "coke-red": {
    id: "coke-red",
    label: "Coca-Cola Red",
    background: "#b80000",
    headerBg: "#ff0000",
    headerText: "#ffffff",
    headerBorder: "#7a0000",
    rowText: "#ffffff",
    priceText: "#ffe08a",
    accent: "#330000",
    noticeBg: "#ffffff",
    noticeText: "#b80000",
  },
  "breast-cancer-pink": {
    id: "breast-cancer-pink",
    label: "Breast Cancer Awareness",
    background: "#ffb3d9",
    headerBg: "#ff4d94",
    headerText: "#ffffff",
    headerBorder: "#7a0033",
    rowText: "#3a0019",
    priceText: "#3a0019",
    accent: "#ffe6f2",
    noticeBg: "#7a0033",
    noticeText: "#ffe6f2",
  },
  "christmas-classic": {
    id: "christmas-classic",
    label: "Christmas Classic",
    background: "#0b3d0b",
    headerBg: "#c8102e",
    headerText: "#ffffff",
    headerBorder: "#f5d547",
    rowText: "#ffffff",
    priceText: "#f5d547",
    accent: "#145214",
    noticeBg: "#f5d547",
    noticeText: "#3a0a0a",
  },
  "valentines-pink": {
    id: "valentines-pink",
    label: "Valentine’s Day",
    background: "#ffccdd",
    headerBg: "#ff3366",
    headerText: "#ffffff",
    headerBorder: "#990033",
    rowText: "#661122",
    priceText: "#661122",
    accent: "#ffe6f0",
    noticeBg: "#990033",
    noticeText: "#ffe6f0",
  },
  "st-patricks-green": {
    id: "st-patricks-green",
    label: "St. Patrick’s Day",
    background: "#005f2f",
    headerBg: "#00a652",
    headerText: "#ffffff",
    headerBorder: "#f2c94c",
    rowText: "#ffffff",
    priceText: "#f2c94c",
    accent: "#0b8545",
    noticeBg: "#f2c94c",
    noticeText: "#004220",
  },
};

/* ───────────── Seasonal rules ───────────── */

type SeasonalRule = {
  themeId: ThemeId;
  start: `${string}-${string}`; // "MM-DD"
  end: `${string}-${string}`;   // "MM-DD"
};

export const SEASONAL_RULES: SeasonalRule[] = [
  {
    themeId: "valentines-pink",
    start: "02-07",
    end: "02-15",
  },
  {
    themeId: "st-patricks-green",
    start: "03-10",
    end: "03-18",
  },
  {
    themeId: "breast-cancer-pink",
    start: "10-01",
    end: "10-31",
  },
  {
    themeId: "christmas-classic",
    start: "12-01",
    end: "12-26",
  },
];

function isInRange(today: string, start: string, end: string): boolean {
  if (start <= end) {
    return today >= start && today <= end;
  }
  // if you ever use wrap ranges like 12-20..01-05
  return today >= start || today <= end;
}

export function resolveActiveThemeId(baseThemeId: ThemeId): ThemeId {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const today = `${mm}-${dd}` as const;

  const rule = SEASONAL_RULES.find((r) => isInRange(today, r.start, r.end));
  if (rule) return rule.themeId;

  return baseThemeId;
}
