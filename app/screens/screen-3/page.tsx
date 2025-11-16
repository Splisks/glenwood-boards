// app/screens/screen-3/page.tsx
"use client";

import { useEffect, useState } from "react";

type MenuItem = {
  id: string;
  label: string;
  price: string;
  active?: boolean;
};

type MenuSections = Record<string, MenuItem[]>;

const SCREEN_ID = "screen-3";

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
        console.error("[screen-3] failed to load menu", err);
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
        console.error("[screen-3] bad SSE data", err);
      }
    };

    es.onerror = (err) => {
      console.error("[screen-3] SSE error", err);
      // optional - could es.close() and retry after a delay
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

export default function Screen3Page() {
  const { menuSections, loading } = useMenuSections();

  const sidesLeft = menuSections["SIDES_LEFT"] || [];
  const sidesRight = menuSections["SIDES_RIGHT"] || [];

  return (
    <div className="screen-root">
      {loading && <div className="empty-state">Loading menu…</div>}

      {!loading && (
        <div className="screen-columns">
          {/* LEFT - SIDES */}
          <section className="menu-board">
            <header className="menu-header">
              <div className="menu-header-label">SIDES</div>
            </header>
            <div className="menu-items">
              <div className="menu-items-main">
                <PriceList items={sidesLeft} />
              </div>
            </div>
          </section>

          {/* RIGHT - SIDES */}
          <section className="menu-board">
            <header className="menu-header">
              <div className="menu-header-label">SIDES</div>
            </header>
            <div className="menu-items">
              <div className="menu-items-main">
                <PriceList items={sidesRight} />
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
