// app/screens/screen-5/page.tsx
"use client";

import { useEffect, useState } from "react";

type MenuItem = {
  id: string;
  label: string;
  price: string;
  active?: boolean;
};

type MenuSections = Record<string, MenuItem[]>;

const SCREEN_ID = "screen-5";

function useMenuSections() {
  const [menuSections, setMenuSections] = useState<MenuSections>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let closed = false;

    async function load() {
      try {
        const res = await fetch("/api/menu", {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        if (closed) return;
        setMenuSections(data.menuSections || {});
      } catch (err) {
        console.error("[screen-5] failed to load menu", err);
      } finally {
        if (!closed) {
          setLoading(false);
        }
      }
    }

    // initial load
    load();

    // connect to SSE stream for this screen
    const es = new EventSource(`/api/stream/${SCREEN_ID}`);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (closed) return;

        // from broadcastMenuUpdated()
        if (data && data.type === "menuUpdated") {
          load(); // re-fetch menu data so this screen updates live
          return;
        }

        // ignore simple "connected" hello
        if (data && data.type === "connected") {
          return;
        }
      } catch (err) {
        console.error("[screen-5] bad SSE data", err);
      }
    };

    es.onerror = (err) => {
      console.error("[screen-5] SSE error", err);
      // optional: could es.close() and retry after a delay
    };

    return () => {
      closed = true;
      es.close();
    };
  }, []);

  return { menuSections, loading };
}

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

export default function Screen5Page() {
  const { menuSections, loading } = useMenuSections();
  const burgers = menuSections["BURGERS"] || [];
  const hotDogs = menuSections["HOT_DOGS"] || [];

  return (
    <div className="screen-root">
      {loading && <div className="empty-state">LOADING MENU…</div>}

      {!loading && (
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
              <header className="menu-header">
                <div className="menu-header-label">HAMBURGERS*</div>
              </header>
              <div className="menu-items">
                <div className="menu-items-main">
                  <PriceList items={burgers} />
                </div>

                {/* DISCLAIMER CARD AT BOTTOM */}
                <div className="menu-items-footer">
                  <div className="notice-card">
                    <div className="notice-card-main">
                      * THOROUGHLY COOKING MEATS, POULTRY, SEAFOOD, SHELLFISH, OR
                      EGGS REDUCES
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
              <header className="menu-header">
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
