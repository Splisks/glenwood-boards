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
        console.error("[screen-4] failed to load menu", err);
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

export default function Screen4Page() {
  const { menuSections, loading } = useMenuSections();
  const beverages = menuSections["BEVERAGES"] || [];

  const toppings = ["PICKLES", "ONION", "TOMATO", "MAYO", "LETTUCE", "HOT PEPPERS"];

  return (
    <div className="screen-root">
      {loading && <div className="empty-state">LOADING MENU…</div>}

      {!loading && (
        <div className="screen-columns">
          {/* LEFT – EXTRAS / FREE TOPPINGS */}
          <section className="menu-board">
            <header className="menu-header">
              <div className="menu-header-label">EXTRAS</div>
            </header>
            <div className="menu-items">
              <div className="menu-items-main">
                <p className="menu-paragraph">
                  MAKE ANY SEAFOOD ORDER A PLATE FOR 6.50 MORE
                </p>
                <p className="menu-paragraph">(FRENCH FRIES &amp; COLESLAW)</p>

                <div className="menu-divider" />

                <p className="menu-paragraph">
                  SUBSTITUTE ONION RINGS FOR FRENCH FRIES FOR 8.50
                </p>

                <div className="menu-toppings-header">FREE TOPPINGS</div>

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
            <header className="menu-header">
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
                      src="/img/social-follow.png"
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
