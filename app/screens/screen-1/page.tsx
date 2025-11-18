// app/screens/screen-1/page.tsx
"use client";

import { useEffect, useState } from "react";

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
  code: string;
  label: string;
  price: string;
  active?: boolean;
  sortOrder: number;
};

type Section = {
  id: string;
  key: string;   // e.g. "HOT_DOGS"
  title: string; // e.g. "Hot Dogs"
  items: MenuItem[];
};

type ScreenResponse = {
  screenId: string;
  groupId: string;
  themeId: string;
  theme: Theme;
  sections: Section[];
};

const POLL_MS = 5000; // 5s

export default function Screen1Page() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // global auto-scale for TVs
  useEffect(() => {
    const baseWidth = 1920;
    const baseHeight = 1080;

    function updateScale() {
      const scaleX = window.innerWidth / baseWidth;
      const scaleY = window.innerHeight / baseHeight;
      const scale = Math.min(scaleX, scaleY);

      document.documentElement.style.setProperty(
        "--global-scale",
        scale.toString()
      );
    }

    updateScale();
    window.addEventListener("resize", updateScale);

    return () => {
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchScreen(isFirst = false) {
      try {
        if (isFirst && !hasLoadedOnce) {
          setLoading(true);
          setError(null);
        }

        const res = await fetch(`/api/screens/screen-1?t=${Date.now()}`, {
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
        console.error("[screen-1] failed to load screen", err);

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

  const getItems = (key: string) =>
    (sections.find((s) => s.key === key)?.items || []).filter(
      (i) => i.active !== false
    );

  const hotDogs = getItems("HOT_DOGS");
  const burgers = getItems("BURGERS");

  const bg = theme?.background ?? "#007bff";
  const headerBg = theme?.headerBg ?? "#00cb31";
  const headerText = theme?.headerText ?? "#ffffff";
  const headerBorder = theme?.headerBorder ?? "#003b7a";
  const noticeBg = theme?.noticeBg ?? "#003b7a";
  const noticeText = theme?.noticeText ?? "#ffffff";

  return (
    <div className="screen-root" style={{ backgroundColor: bg }}>
      {/* Initial overlay only, before first successful load */}
      {!hasLoadedOnce && (loading || error) && (
        <div className="empty-state">
          <span>{error ? error : "Loading menu…"} </span>
        </div>
      )}

      {/* Once we have any good data, always render menu using last known state */}
      {hasLoadedOnce && (
        <div className="screen-columns">
          {/* Left column - HOT DOGS */}
          <section className="menu-board">
            <header
              className="menu-header"
              style={{
                backgroundColor: headerBg,
                color: headerText,
                borderColor: headerBorder,
              }}
            >
              Hot Dogs
            </header>

            <div className="menu-items">
              {hotDogs.length === 0 ? (
                <div className="empty-state">No hot dogs configured</div>
              ) : (
                <div className="menu-items-main">
                  {hotDogs.map((item) => (
                    <div key={item.id} className="menu-row">
                      <div className="menu-row-label">{item.label}</div>
                      <div className="menu-row-price">{item.price}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Right column - HAMBURGERS + food safety notice */}
          <section className="menu-board">
            <header
              className="menu-header"
              style={{
                backgroundColor: headerBg,
                color: headerText,
                borderColor: headerBorder,
              }}
            >
              Hamburgers*
            </header>

            <div className="menu-items">
              {burgers.length === 0 ? (
                <div className="empty-state">No hamburgers configured</div>
              ) : (
                <div className="menu-items-main">
                  {burgers.map((item) => (
                    <div key={item.id} className="menu-row">
                      <div className="menu-row-label">{item.label}</div>
                      <div className="menu-row-price">{item.price}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="menu-items-footer">
                <div
                  className="notice-card"
                  style={{
                    backgroundColor: noticeBg,
                    color: noticeText,
                  }}
                >
                  <div className="notice-card-main">
                    * THOROUGHLY COOKING MEATS, POULTRY,
                    <br />
                    SEAFOOD, SHELLFISH, OR EGGS REDUCES
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
        </div>
      )}
    </div>
  );
}
