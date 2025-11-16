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
        console.error("[screen-5] failed to load menu", err);
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

export default function Screen5Page() {
  const { menuSections, loading } = useMenuSections();
  const burgers = menuSections["BURGERS"] || [];
  const hotDogs = menuSections["HOT_DOGS"] || [];

  return (
    <div className="screen-root">
      {loading && <div className="empty-state">LOADING MENU…</div>}

      {!loading && (
        <div className="screen-root">
          {/* HERO IMAGE STRIP */}
          <div className="hero-strip">
            <img className="hero-photo hero-photo-left" src="/img/hero-kid.png" alt=" " />
            <img className="hero-photo hero-photo-burger" src="/img/burgers-burger.png" alt=" " />
            <img className="hero-photo hero-photo-fries" src="/img/sides-fries.png" alt=" " />
            <img className="hero-photo hero-photo-hotdogs" src="/img/hotdogs-hotdogs.png" alt=" " />
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
        </div>
      )}
    </div>
  );
}
