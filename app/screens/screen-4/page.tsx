// app/screens/screen-4/page.tsx
"use client";

import { useEffect, useState } from "react";
import { SnowOverlay } from "@/components/SnowOverlay";

const SCREEN_ID = "screen-4";
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
  key: string; // e.g. "BEVERAGES"
  title: string; // e.g. "Beverages"
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

        const res = await fetch(`/api/screens/${SCREEN_ID}?t=${Date.now()}`, {
          cache: "no-store",
        });
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

export default function Screen4Page() {
  const { theme, sections, loading, error, hasLoadedOnce } = useScreenData();

  const getItems = (key: string) =>
    (sections.find((s) => s.key === key)?.items || []).filter(
      (i) => i.active !== false
    );

  const beverages = getItems("BEVERAGES");

  const toppings = [
    "PICKLES",
    "ONION",
    "TOMATO",
    "MAYO",
    "LETTUCE",
    "HOT PEPPERS",
  ];

  const bg = theme?.background ?? "#007bff";
  const headerBg = theme?.headerBg ?? "#00cb31";
  const headerText = theme?.headerText ?? "#ffffff";
  const headerBorder = theme?.headerBorder ?? "#003b7a";
  const accent = theme?.accent ?? "#00cb31";

  const isChristmas = theme?.id === "christmas-classic";

  return (
    <div className="screen-root" style={{ backgroundColor: bg }}>
      {/* Initial overlay only, before first successful load */}
      {!hasLoadedOnce && (loading || error) && (
        <div className="empty-state">
          {error ? "Connection issue, retrying…" : "LOADING MENU…"}
        </div>
      )}

      {/* Snow only when the resolved theme is Christmas */}
      {isChristmas && <SnowOverlay />}

      {/* Once we have any good data, always render menu using last known state */}
      {hasLoadedOnce && (
        <div className="screen-columns">
          {/* LEFT – EXTRAS / FREE TOPPINGS */}
          <section className="menu-board">
            <header
              className="menu-header"
              style={{
                backgroundColor: headerBg,
                color: headerText,
                borderColor: headerBorder,
              }}
            >
              <div className="menu-header-label">EXTRAS</div>
            </header>
            <div className="menu-items">
              <div className="menu-items-main">
                <p className="menu-paragraph">
                  MAKE ANY SEAFOOD ORDER A PLATE FOR 6.50 MORE
                </p>
                <p className="menu-paragraph">(FRENCH FRIES &amp; COLESLAW)</p>

                <div
                  className="menu-divider"
                  style={{ backgroundColor: accent }}
                />

                <p className="menu-paragraph">
                  SUBSTITUTE ONION RINGS FOR FRENCH FRIES FOR 8.50
                </p>

                {/* FREE TOPPINGS HEADER – MATCHES MENU HEADER STYLE */}
                <header
                  className="menu-header"
                  style={{
                    backgroundColor: headerBg,
                    color: headerText,
                    borderColor: headerBorder,
                  }}
                >
                  <div className="menu-header-label">FREE TOPPINGS</div>
                </header>

                <div className="menu-toppings-row">
                  {toppings.map((topping) => (
                    <span key={topping} className="menu-topping">
                      {topping}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT – BEVERAGES + FOLLOW US / COKE */}
          <section className="menu-board">
            <header
              className="menu-header"
              style={{
                backgroundColor: headerBg,
                color: headerText,
                borderColor: headerBorder,
              }}
            >
              <div className="menu-header-label">BEVERAGES</div>
            </header>

            <div className="menu-items">
              <div className="menu-items-main">
                <PriceList items={beverages} />
              </div>

              {/* SOCIAL + COKE STRIP AT BOTTOM */}
              <div className="menu-items-footer">
                <div className="social-card">
                  <div className="social-card-inner">
                    <img
                      className="social-card-image"
                      src="/img/social-follow-transparent.png"
                      alt="FOLLOW US ON SOCIAL MEDIA"
                    />
                    <img
                      className="social-card-logo"
                      src="/img/coke-logo.png"
                      alt="COCA-COLA"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
