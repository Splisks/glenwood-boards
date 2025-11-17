// scripts/seed-themes.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* ───────────── Theme map (copied from lib/themes.ts) ───────────── */

type ThemeId =
  | "classic-blue"
  | "coke-red"
  | "breast-cancer-pink"
  | "christmas-classic"
  | "valentines-pink"
  | "st-patricks-green"
  | "easter-spring"
  | "independence-day"
  | "halloween-spooky"
  | "thanksgiving-harvest"
  | "new-years-gold"
  | "memorial-day"
  | "labor-day"
  | "mothers-day"
  | "fathers-day";

type ThemeConfig = {
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

const THEMES: Record<ThemeId, ThemeConfig> = {
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
  "easter-spring": {
      id: "easter-spring",
      label: "Easter Spring",
      background: "#e6b3ff",
      headerBg: "#9966ff",
      headerText: "#ffffff",
      headerBorder: "#ffeb99",
      rowText: "#4d2673",
      priceText: "#4d2673",
      accent: "#f2e6ff",
      noticeBg: "#ffeb99",
      noticeText: "#4d2673",
    },
    "independence-day": {
      id: "independence-day",
      label: "Independence Day",
      background: "#002868",
      headerBg: "#bf0a30",
      headerText: "#ffffff",
      headerBorder: "#ffffff",
      rowText: "#ffffff",
      priceText: "#ffffff",
      accent: "#003d99",
      noticeBg: "#ffffff",
      noticeText: "#bf0a30",
    },
    "halloween-spooky": {
      id: "halloween-spooky",
      label: "Halloween",
      background: "#1a0a00",
      headerBg: "#ff6600",
      headerText: "#1a0a00",
      headerBorder: "#9933ff",
      rowText: "#ff6600",
      priceText: "#ffcc00",
      accent: "#331400",
      noticeBg: "#9933ff",
      noticeText: "#ffcc00",
    },
    "thanksgiving-harvest": {
      id: "thanksgiving-harvest",
      label: "Thanksgiving",
      background: "#8b4513",
      headerBg: "#ff8c00",
      headerText: "#3d1f00",
      headerBorder: "#d4a017",
      rowText: "#fff8dc",
      priceText: "#ffd700",
      accent: "#a0522d",
      noticeBg: "#3d1f00",
      noticeText: "#ffd700",
    },
    "new-years-gold": {
      id: "new-years-gold",
      label: "New Year's Eve",
      background: "#0a0a1f",
      headerBg: "#1a1a3d",
      headerText: "#ffd700",
      headerBorder: "#ffd700",
      rowText: "#ffffff",
      priceText: "#ffd700",
      accent: "#14142e",
      noticeBg: "#ffd700",
      noticeText: "#0a0a1f",
    },
    "memorial-day": {
      id: "memorial-day",
      label: "Memorial Day",
      background: "#1c2a3d",
      headerBg: "#b22234",
      headerText: "#ffffff",
      headerBorder: "#3c3b6e",
      rowText: "#ffffff",
      priceText: "#f0f0f0",
      accent: "#2d4259",
      noticeBg: "#3c3b6e",
      noticeText: "#ffffff",
    },
    "labor-day": {
      id: "labor-day",
      label: "Labor Day",
      background: "#1f3a5f",
      headerBg: "#4472c4",
      headerText: "#ffffff",
      headerBorder: "#c55a11",
      rowText: "#ffffff",
      priceText: "#ffd966",
      accent: "#2c5282",
      noticeBg: "#c55a11",
      noticeText: "#ffffff",
    },
    "mothers-day": {
      id: "mothers-day",
      label: "Mother's Day",
      background: "#ffd6e8",
      headerBg: "#ff69b4",
      headerText: "#ffffff",
      headerBorder: "#8b4789",
      rowText: "#5c2a5c",
      priceText: "#5c2a5c",
      accent: "#ffe6f2",
      noticeBg: "#8b4789",
      noticeText: "#ffffff",
    },
    "fathers-day": {
      id: "fathers-day",
      label: "Father's Day",
      background: "#1c3d5a",
      headerBg: "#4a7ba7",
      headerText: "#ffffff",
      headerBorder: "#6b4423",
      rowText: "#ffffff",
      priceText: "#d4a574",
      accent: "#2b5273",
      noticeBg: "#6b4423",
      noticeText: "#ffffff",
    },
};

/* ───────────── Seed logic ───────────── */

async function main() {
  console.log("Seeding themes…");

  for (const theme of Object.values(THEMES)) {
    await prisma.theme.upsert({
      where: { id: theme.id },
      update: {
        label: theme.label,
      },
      create: {
        id: theme.id,
        label: theme.label,
      },
    });
  }

  console.log("Ensuring default group exists…");

  await prisma.group.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      themeId: "classic-blue",
    },
  });

  console.log("✅ Seeded themes and default group.");
}

main()
  .catch((err) => {
    console.error("Error seeding themes:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
