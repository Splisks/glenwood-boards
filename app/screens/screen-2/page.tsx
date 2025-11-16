// app/screens/screen-2/page.tsx
"use client";

import { useEffect, useState } from "react";

type MenuItem = {
  id: string;
  label: string;
  price: string;
  active?: boolean;
};

type MenuSections = Record<string, MenuItem[]>;

const SCREEN_ID = "screen-2";

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
        console.error("[screen-2] failed to load menu", err);
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
        console.error("[screen-2] bad SSE data", err);
      }
    };

    es.onerror = (err) => {
      console.error("[screen-2] SSE error", err);
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

export default function Screen2Page() {
  const { menuSections, loading } = useMenuSections();

  const sandwiches = menuSections["SANDWICHES"] || [];
  const seafood = menuSections["SEAFOOD_ORDERS"] || [];

  return (
    <div className="screen-root">
      {loading && <div className="empty-state">Loading menu…</div>}

      {!loading && (
        <div className="screen-columns">
          {/* LEFT - SANDWICHES */}
          <section className="menu-board">
            <header className="menu-header">
              <div className="menu-header-label">SANDWICHES</div>
            </header>
            <div className="menu-items">
              <div className="menu-items-main">
                <PriceList items={sandwiches} />
              </div>
            </div>
          </section>

          {/* RIGHT - SEAFOOD ORDERS */}
          <section className="menu-board">
            <header className="menu-header">
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
