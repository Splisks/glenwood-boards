"use client";

import { useEffect, useState } from "react";

type MenuItem = {
  id: string;
  label: string;
  price: string;
  active?: boolean;
};

type MenuSections = Record<string, MenuItem[]>;

function useMenuSections() {
  const [menuSections, setMenuSections] = useState<MenuSections>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/menu");
        const data = await res.json();
        setMenuSections(data.menuSections || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
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
          {/* LEFT – SANDWICHES */}
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

          {/* RIGHT – SEAFOOD ORDERS */}
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
