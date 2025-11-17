// app/screens/screen-7/page.tsx
"use client";

import { useEffect, useState } from "react";

const SCREEN_ID = "screen-7";
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
  key: string;   // e.g. "SANDWICHES"
  title: string; // e.g. "Sandwiches"
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
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: ScreenResponse = await res.json();
        if (cancelled) return;

        setTheme(data.theme);
        setSections(data.sections || []);
        setHasLoadedOnce(true);
        setError(null);
      } catch (err: any) {
        if (cancelled) return;
        console.error(`[${SCREEN_ID}] failed to load screen`, err);

        // Only surface error before the first successful load
        if (!hasLoadedOnce) {
          setError("Connection issue, retrying…");
        }
        // Keep last good theme/sections
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

export default function Screen7Page() {
  const { theme, sections, loading, error, hasLoadedOnce } = useScreenData();

  const getItems = (key: string) =>
    (sections.find((s) => s.key === key)?.items || []).filter(
      (i) => i.active !== false
    );

  const sandwiches = getItems("SANDWICHES");
  const seafood = getItems("SEAFOOD_ORDERS");

  const bg = theme?.background ?? "#007bff";
  const headerBg = theme?.headerBg ?? "#00cb31";
  const headerText = theme?.headerText ?? "#ffffff";
  const headerBorder = theme?.headerBorder ?? "#003b7a";

  return (
    <div className="screen-root" style={{ backgroundColor: bg }}>
      {/* Initial overlay only, before first successful load */}
      {!hasLoadedOnce && (loading || error) && (
        <div className="empty-state">
          {error ? "Connection issue, retrying…" : "Loading menu…"}
        </div>
      )}

      {/* Once we have any good data, always render menu using last known state */}
      {hasLoadedOnce && (
        <div className="screen-columns">
          {/* LEFT Side - Sandwiches */}
          <section className="menu-board">
            <header
              className="menu-header"
              style={{
                backgroundColor: headerBg,
                color: headerText,
                borderColor: headerBorder,
              }}
            >
              <div className="menu-header-label">SANDWICHES</div>
            </header>
            <div className="menu-items">
              <div className="menu-items-main">
                <PriceList items={sandwiches} />
              </div>
            </div>
          </section>

          {/* RIGHT Side - Seafood Orders */}
          <section className="menu-board">
            <header
              className="menu-header"
              style={{
                backgroundColor: headerBg,
                color: headerText,
                borderColor: headerBorder,
              }}
            >
              <div className="menu-header-label">SEAFOOD ORDERS</div>
            </header>
            <div className="menu-items">
              <div className="menu-items-main">
                <PriceList items={seafood} />
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
