// lib/menu-store.ts

// ───────── Shared menu types (used by admin + APIs) ─────────

export type MenuItem = {
  id: string;
  label: string;
  price: string;
  active?: boolean;
  sortOrder?: number;
  code?: string;
};

export type MenuSections = Record<string, MenuItem[]>;

// ───────── Screen snapshot store (in-memory) ─────────

export type ScreenData = {
  screen: any;
  group: any;
  theme: any;
};

// simple in-memory store
const SCREENS = new Map<string, ScreenData>();

export function getScreenSnapshot(screenId: string): ScreenData | null {
  return SCREENS.get(screenId) ?? null;
}

export function setScreenSnapshot(screenId: string, data: ScreenData) {
  SCREENS.set(screenId, data);
}
