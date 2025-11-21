// app/screens/screen-6/page.tsx
"use client";

import { useEffect, useState } from "react";
import { SnowOverlay } from "@/components/SnowOverlay";

const SCREEN_ID = "screen-6";
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
  key: string;   // e.g. "SIDES_LEFT"
  title: string; // e.g. "Sides"
  items: MenuItem[];
};

type ScreenResponse = {
  screenId: string;
  groupId: string;
  themeId: string;
  theme: Theme;
  sections: Section[];
};

/* ───────────── Hook ───────────── */

function useScreenData() {
  const [theme, setTheme] = useState<Theme | null>(null);
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
        setSections(data.sections || []);
        setHasLoadedOnce(true);
        setError(null);
      } catch (err: any) {
        if (cancelled) return;
        console.error(`[${SCREEN_ID}] failed to load screen`, err);

        if (!hasLoadedOnce) {
          setError("Connection issue, retrying…");
        }
        // keep last good theme/sections
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

  return { theme, sections, loading, error, hasLoadedOnce };
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

export default function Screen6Page() {
  const { theme, sections, loading, error, hasLoadedOnce } = useScreenData();

  const getItems = (key: string) =>
    (sections.find((s) => s.key === key)?.items || []).filter(
      (i) => i.active !== false
    );

  const sidesLeft = getItems("SIDES_LEFT");
  const sidesRight = getItems("SIDES_RIGHT");

  const bg = theme?.background ?? "#007bff";
  const headerBg = theme?.headerBg ?? "#00cb31";
  const headerText = theme?.headerText ?? "#ffffff";
  const headerBorder = theme?.headerBorder ?? "#003b7a";

  const isChristmas = theme?.id === "christmas-classic";
  
  return (
    <div className="screen-root" style={{ backgroundColor: bg }}>
      {/* Initial loading/error overlay only until we have first good data */}
      {!hasLoadedOnce && (loading || error) && (
        <div className="empty-state">
          {error ? error : "LOADING MENU…"}
        </div>
      )}

      {/* Snow only when the resolved theme is Christmas */}
      {isChristmas && <SnowOverlay />}

      {/* After first load, always render menu using last known good state */}
      {hasLoadedOnce && (
        <>
          {/* HERO IMAGES STRIP (LOBSTER ROLL, RINGS, CLAMS, KID PHOTO) */}
          <div className="hero-strip">
            <img
              className="hero-photo hero-photo-left"
              src="/img/sandwiches-lobster-roll.png"
              alt=" "
            />
            <img
              className="hero-photo hero-photo-burger"
              src="/img/sides-rings.png"
              alt=" "
            />
            <img
              className="hero-photo hero-photo-fries"
              src="/img/seafood-clams.png"
              alt=" "
            />
            <img
              className="hero-photo hero-photo-hotdogs"
              src="/img/hero-kid-sides.png"
              alt=" "
            />
          </div>

          {/* TWO SIDES COLUMNS */}
          <div className="screen-columns">
            {/* LEFT SIDES COLUMN */}
            <section className="menu-board">
              <header
                className="menu-header"
                style={{
                  backgroundColor: headerBg,
                  color: headerText,
                  borderColor: headerBorder,
                }}
              >
                <div className="menu-header-label">SIDES</div>
              </header>
              <div className="menu-items">
                <div className="menu-items-main">
                  <PriceList items={sidesLeft} />
                </div>
              </div>
            </section>

            {/* RIGHT SIDES COLUMN */}
            <section className="menu-board">
              <header
                className="menu-header"
                style={{
                  backgroundColor: headerBg,
                  color: headerText,
                  borderColor: headerBorder,
                }}
              >
                <div className="menu-header-label">SIDES</div>
              </header>
              <div className="menu-items">
                <div className="menu-items-main">
                  <PriceList items={sidesRight} />
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
