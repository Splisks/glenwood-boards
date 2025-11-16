// app/screens/screen-6/page.tsx
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
        console.error("[screen-6] failed to load menu", err);
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

export default function Screen6Page() {
  const { menuSections, loading } = useMenuSections();

  const sidesLeft = menuSections["SIDES_LEFT"] || [];
  const sidesRight = menuSections["SIDES_RIGHT"] || [];

  return (
    <div className="screen-root">
      {loading && <div className="empty-state">LOADING MENU…</div>}

      {!loading && (
        <div className="screen-root">
          {/* HERO IMAGES STRIP (LOBSTER ROLL, RINGS, CLAMS, KID PHOTO) */}
          <div className="hero-strip">
            <img className="hero-photo hero-photo-left" src="/img/sandwiches-lobster-roll.png" alt=" " />
            <img className="hero-photo hero-photo-burger" src="/img/sides-rings.png" alt=" " />
            <img className="hero-photo hero-photo-fries" src="/img/seafood-clams.png" alt=" " />
            <img className="hero-photo hero-photo-hotdogs" src="/img/hero-kid-sides.png" alt=" " />
          </div>

          {/* TWO SIDES COLUMNS */}
          <div className="screen-columns">
            {/* LEFT SIDES COLUMN */}
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

            {/* RIGHT SIDES COLUMN */}
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
        </div>
      )}
    </div>
  );
}
