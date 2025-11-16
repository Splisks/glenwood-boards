// app/screens/screen-8/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function Screen8Page() {
  const [images, setImages] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  // Load list of images from /public/img/slider via API
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/slider");
        const data = await res.json();
        const list: string[] = Array.isArray(data.images) ? data.images : [];

        if (list.length > 0) {
          setImages(list);
          // start on a random image so each load feels different
          const start = Math.floor(Math.random() * list.length);
          setIndex(start);
        }
      } catch (err) {
        console.error("[screen-8] failed to load slider images", err);
      }
    }

    load();
  }, []);

  // Rotate through images if we have more than 1
  useEffect(() => {
    if (images.length <= 1) return;

    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 8000); // 8 seconds per slide

    return () => clearInterval(id);
  }, [images]);

  const currentSlide =
    images.length > 0
      ? images[index]
      : "/img/history-1.png"; // fallback if folder empty

  return (
    <div className="screen-root">
      <div className="screen-stack">
        <div className="screen-columns">
          {/* ───────── LEFT COLUMN: EXTRAS + TOPPINGS ───────── */}
          <section className="menu-board">
            <header className="menu-header">
              <div>EXTRAS</div>
            </header>

            <div className="menu-items">
              <div className="menu-items-main">
                <p className="menu-paragraph">
                  MAKE ANY SEAFOOD ORDER A PLATE FOR 6.50 MORE
                </p>
                <p className="menu-paragraph menu-paragraph--small">
                  (FRENCH FRIES &amp; COLESLAW)
                </p>

                <div className="menu-divider" />

                <p className="menu-paragraph">
                  SUBSTITUTE ONION RINGS FOR FRENCH FRIES 8.50
                </p>

                <div className="menu-subheader">TOPPINGS</div>

                <div className="menu-toppings-row">
                  <span>PICKLES</span>
                  <span>ONION</span>
                  <span>TOMATO</span>
                  <span>MAYO</span>
                  <span>LETTUCE</span>
                  <span>HOT PEPPERS</span>
                </div>
              </div>
            </div>
          </section>

          {/* ───────── RIGHT COLUMN: WELCOME + SEASONAL PROMO ───────── */}
          <section className="menu-board">
            <header className="menu-header">
              <div>WELCOME</div>
            </header>

            <div className="menu-items">
              <div className="menu-items-main">
                {/* WELCOME CARD WITH RANDOM / ROTATING SLIDER */}
                <div className="info-card">
                  <div className="info-card-title">GLENWOOD DRIVE-IN</div>
                  <div className="info-card-subtitle">
                    FAMILY OWNED &amp; OPERATED SINCE 1955
                  </div>

                  <div className="info-card-images">
                    <img
                      key={currentSlide}
                      src={currentSlide}
                      alt="WELCOME FEATURE"
                      className="info-card-image slideshow-fade"
                    />
                  </div>
                </div>

                {/* SEASONAL / PROMO SPOT – CURRENTLY ORDER ONLINE */}
                <div className="info-card">
                  <div className="info-card-title">ORDER ONLINE</div>
                  <div className="info-card-subtitle">&amp; BEAT THE LINE!</div>

                  <div className="info-card-body">
                    GLENWOODDRIVEIN.COM
                    <br />
                    GIFT CARDS AVAILABLE ALL YEAR
                    <br />
                    PERFECT FOR THE GLENWOOD FAN IN YOUR LIFE
                  </div>

                  <div className="info-card-logos">
                    <img
                      src="/img/logo-ubereats.png"
                      alt="UBER EATS"
                      className="info-card-logo"
                    />
                    <img
                      src="/img/logo-doordash.png"
                      alt="DOORDASH"
                      className="info-card-logo"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
