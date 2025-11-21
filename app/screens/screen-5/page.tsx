// app/screens/screen-5/page.tsx
"use client";

import { useEffect, useState } from "react";
import { ThemeOverlay } from "@/components/ThemeOverlay";
import { resolveActiveThemeId, type ThemeId } from "@/lib/themes";

const SCREEN_ID = "screen-5";
const POLL_MS = 5000;

/* ───────────── Types ───────────── */

type Theme = {
  id: string;
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

type MenuItem = {
  id: string;
  code?: string;
  label: string;
  price: string;
  active?: boolean;
  sortOrder?: number;
};

type Section = {
  id: string;
  key: string;   // e.g. "BURGERS"
  title: string; // e.g. "Hamburgers"
  items: MenuItem[];
};

type ScreenResponse = {
  screenId: string;
  groupId: string;
  themeId: ThemeId;
  theme: Theme;
  sections: Section[];
};

/* ───────────── Hook ───────────── */

function useScreenData() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [themeId, setThemeId] = useState<ThemeId | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchScreen(isFirst = false) {
      try {
        if (isFirst && !hasLoadedOnce) {
          setLoading(true);
          setError(null);
        }

        const res = await fetch(
          `/api/screens/${SCREEN_ID}?t=${Date.now()}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data: ScreenResponse = await res.json();
        if (cancelled) return;

        setTheme(data.theme);
        setThemeId(data.themeId);
        setSections(data.sections || []);
        setHasLoadedOnce(true);
        setError(null);
      } catch (err: any) {
        if (cancelled) return;
        console.error(`[${SCREEN_ID}] failed to load screen`, err);

        if (!hasLoadedOnce) {
          setError("Connection issue, retrying…");
        }
      } finally {
        if (!cancelled && !hasLoadedOnce) {
          setLoading(false);
        }
      }
    }

    // initial load
    fetchScreen(true);

    // polling
    const id = setInterval(() => {
      fetchScreen(false);
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [hasLoadedOnce]);

  return { theme, themeId, sections, loading, error, hasLoadedOnce };
}

/* ───────────── Presentational ───────────── */

function PriceList({ items }: { items: MenuItem[] }) {
  const visible = items.filter((i) => i.active !== false);
  return (
    <>
      {visible.map((item) => (
        <div key={item.id} className="menu-row">
          <span className="menu-row-label">{item.label}</span>
          <span className="menu-row-price">{item.price}</span>
        </div>
      ))}
    </>
  );
}

/* ───────────── Screen Component ───────────── */

export default function Screen5Page() {
  const { theme, themeId, sections, loading, error, hasLoadedOnce } =
    useScreenData();

  const getItems = (key: string) =>
    (sections.find((s) => s.key === key)?.items || []).filter(
      (i) => i.active !== false
    );

  const burgers = getItems("BURGERS");
  const hotDogs = getItems("HOT_DOGS");

  const bg = theme?.background ?? "#007bff";
  const headerBg = theme?.headerBg ?? "#00cb31";
  const headerText = theme?.headerText ?? "#ffffff";
  const headerBorder = theme?.headerBorder ?? "#003b7a";
  const noticeBg = theme?.noticeBg ?? "#003b7a";
  const noticeText = theme?.noticeText ?? "#ffffff";

  const activeThemeId = resolveActiveThemeId(
    themeId ?? "classic-blue"
  );

  return (
    <div className="screen-root" style={{ backgroundColor: bg }}>
      {/* Initial overlay only, for first load / connection issues */}
      {!hasLoadedOnce && (loading || error) && (
        <div className="empty-state">
          {error ? error : "LOADING MENU…"}
        </div>
      )}

      {/* Holiday Overlay Effects – only once we know the theme */}
      {hasLoadedOnce && (
        <ThemeOverlay themeId={activeThemeId} />
      )}

      {/* Once we have any good data, always render menu using last known state */}
      {hasLoadedOnce && (
        <>
          {/* HERO IMAGE STRIP */}
          <div className="hero-strip">
            <img
              className="hero-photo hero-photo-left"
              src="/img/hero-kid.png"
              alt=" "
            />
            <img
              className="hero-photo hero-photo-burger"
              src="/img/burgers-burger.png"
              alt=" "
            />
            <img
              className="hero-photo hero-photo-fries"
              src="/img/sides-fries.png"
              alt=" "
            />
            <img
              className="hero-photo hero-photo-hotdogs"
              src="/img/hotdogs-hotdogs.png"
              alt=" "
            />
          </div>

          {/* TWO-COLUMN MENU */}
          <div className="screen-columns">
            {/* LEFT – HAMBURGERS* */}
            <section className="menu-board">
              <header
                className="menu-header"
                style={{
                  backgroundColor: headerBg,
                  color: headerText,
                  borderColor: headerBorder,
                }}
              >
                <div className="menu-header-label">HAMBURGERS*</div>
              </header>
              <div className="menu-items">
                <div className="menu-items-main">
                  <PriceList items={burgers} />
                </div>

                {/* DISCLAIMER CARD AT BOTTOM */}
                <div className="menu-items-footer">
                  <div
                    className="notice-card"
                    style={{
                      backgroundColor: noticeBg,
                      color: noticeText,
                    }}
                  >
                    <div className="notice-card-main">
                      * THOROUGHLY COOKING MEATS, POULTRY, SEAFOOD, SHELLFISH,
                      OR EGGS REDUCES
                      <br />
                      THE RISK OF FOODBORNE ILLNESS.
                    </div>
                    <div className="notice-card-sub">
                      CONNECTICUT PUBLIC HEALTH CODE SECTION 19-13-B42(M)(1)(F)
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* RIGHT – HOT DOGS */}
            <section className="menu-board">
              <header
                className="menu-header"
                style={{
                  backgroundColor: headerBg,
                  color: headerText,
                  borderColor: headerBorder,
                }}
              >
                <div className="menu-header-label">HOT DOGS</div>
              </header>
              <div className="menu-items">
                <div className="menu-items-main">
                  <PriceList items={hotDogs} />
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
