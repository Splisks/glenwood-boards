// lib/menu-store.ts
type ScreenData = {
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
