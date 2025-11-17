// app/screens/screen-8/page.tsx
"use client";

import { useEffect, useState } from "react";

const SCREEN_ID = "screen-8";
const POLL_MS = 5000;

/* ───────────── Types ───────────── */

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

type Section = {
  id: string;
  key: string;
  title: string;
  items: {
    id: string;
    code?: string;
    label: string;
    price: string;
    active?: boolean;
    sortOrder?: number;
  }[];
};

type ScreenResponse = {
  screenId: string;
  groupId: string;
  themeId: string;
  theme: Theme;
  sections: Section[];
};

/* ───────────── Component ───────────── */

export default function Screen8Page() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load theme from /api/screens/screen-8 and images from /api/slider
  useEffect(() => {
    let cancelled = false;

    async function load(isFirst = false) {
      try {
        if (isFirst) setLoading(true);

        const [screenRes, sliderRes] = await Promise.all([
          fetch(`/api/screens/${SCREEN_ID}?t=${Date.now()}`, {
            cache: "no-store",
          }),
          fetch(`/api/slider?t=${Date.now()}`, {
            cache: "no-store",
          }),
        ]);

        if (!screenRes.ok) {
          throw new Error(`screen HTTP ${screenRes.status}`);
        }
        if (!sliderRes.ok) {
          throw new Error(`slider HTTP ${sliderRes.status}`);
        }

        const screenData: ScreenResponse = await screenRes.json();
        const sliderJson = await sliderRes.json();
        const list: string[] = Array.isArray(sliderJson.images)
          ? sliderJson.images
          : [];

        if (cancelled) return;

        setTheme(screenData.theme || null);

        if (list.length > 0) {
          setImages(list);
          const start = Math.floor(Math.random() * list.length);
          setIndex(start);
        } else {
          setImages([]);
          setIndex(0);
        }

        setError(null);
      } catch (err: any) {
        if (cancelled) return;
        console.error("[screen-8] failed to load screen or slider", err);
        setError(err?.message ?? "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // initial load
    load(true);

    // polling
    const id = setInterval(() => {
      load(false);
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Rotate through images if we have more than 1
  useEffect(() => {
    if (images.length <= 1) return;

    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 12000); // Speed Adjustment

    return () => clearInterval(id);
  }, [images]);

  const bg = theme?.background ?? "#007bff";
  const headerBg = theme?.headerBg ?? "#00cb31";
  const headerText = theme?.headerText ?? "#ffffff";
  const headerBorder = theme?.headerBorder ?? "#003b7a";
  const accent = theme?.accent ?? "#00cb31";

  return (
    <div className="screen-root" style={{ backgroundColor: bg }}>
      <div className="screen-stack">
        <div className="screen-columns">
          {/* - LEFT COLUMN - */}
          <section className="menu-board">
            <header
              className="menu-header"
              style={{
                backgroundColor: headerBg,
                color: headerText,
                borderColor: headerBorder,
              }}
            >
              <div className="menu-header-label">EXTRAS</div>
            </header>

            <div className="menu-items">
              <div className="menu-items-main">
                <p className="menu-paragraph">
                  MAKE ANY SEAFOOD ORDER A PLATE FOR 6.50 MORE
                </p>

                <p className="menu-paragraph menu-paragraph--small">
                  (FRENCH FRIES &amp; COLESLAW)
                </p>

                <div
                  className="menu-divider"
                  style={{ backgroundColor: accent }}
                />

                <p className="menu-paragraph">
                  SUBSTITUTE ONION RINGS FOR FRENCH FRIES 8.50
                </p>

                {/* TOPPINGS HEADER MATCHING STYLE */}
                <header
                  className="menu-header"
                  style={{
                    backgroundColor: headerBg,
                    color: headerText,
                    borderColor: headerBorder,
                  }}
                >
                  <div className="menu-header-label">TOPPINGS</div>
                </header>

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

          {/* - RIGHT COLUMN: WELCOME + SEASONAL PROMO - */}
          <section className="menu-board">
            <header
              className="menu-header"
              style={{
                backgroundColor: headerBg,
                color: headerText,
                borderColor: headerBorder,
              }}
            >
              <div>WELCOME</div>
            </header>

            <div className="menu-items">
              <div className="menu-items-main">
                {/* WELCOME CARD WITH ROTATING SLIDER */}
                <div className="info-card">
                  <div className="info-card-title">GLENWOOD DRIVE-IN</div>
                  <div className="info-card-subtitle">
                    FAMILY OWNED &amp; OPERATED SINCE 1955
                  </div>

                  <div className="info-card-images">
                    {images.length > 0 ? (
                      images.map((src, i) => (
                        <img
                          key={src}
                          src={src}
                          alt="WELCOME FEATURE"
                          className={
                            "info-card-image" +
                            (i === index ? " is-active" : "")
                          }
                        />
                      ))
                    ) : (
                      <img
                        src="/img/history-1.png"
                        alt="WELCOME FEATURE"
                        className="info-card-image is-active"
                      />
                    )}
                  </div>
                </div>

                {/* SEASONAL / PROMO SPOT - CURRENTLY ORDER ONLINE */}
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

        {(loading || error) && (
          <div className="empty-state empty-state--overlay">
            {error ? error : "Loading…"}
          </div>
        )}
      </div>
    </div>
  );
}
