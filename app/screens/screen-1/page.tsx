// app/screens/screen-1/page.tsx
"use client";

import { useEffect, useState } from "react";

type MenuItem = {
  id: string;
  label: string;
  price: string;
  active?: boolean;
};

type MenuSections = Record<string, MenuItem[]>;

export default function Screen1Page() {
  const [menuSections, setMenuSections] = useState<MenuSections>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/menu");
        const data = await res.json();
        setMenuSections(data.menuSections || {});
      } catch (err) {
        console.error("[screen-1] failed to load menu", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const hotDogs = (menuSections["HOT_DOGS"] || []).filter(
    (i) => i.active !== false
  );
  const burgers = (menuSections["BURGERS"] || []).filter(
    (i) => i.active !== false
  );

  return (
    <div className="screen-root">
      {loading && (
        <div className="empty-state">
          <span>Loading menu…</span>
        </div>
      )}

      {!loading && (
        <div className="screen-columns">
          {/* Left column – HOT DOGS */}
          <section className="menu-board">
            <header className="menu-header">Hot Dogs</header>

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

          {/* Right column – HAMBURGERS + food safety notice */}
          <section className="menu-board">
            <header className="menu-header">Hamburgers*</header>

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

              {/* Bottom notice card, like in your screenshot */}
              <div className="menu-items-footer">
                <div className="notice-card">
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
