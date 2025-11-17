// public/menu.js
(() => {
  const { useEffect, useState } = React;

  /* ───────────────────── helpers ───────────────────── */

  function getScreenIdFromPath() {
    // remove leading and trailing slashes
    const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
    return path || "screen-1"; // default if root
  }

  // NEW: turn API { sections } into the "screen" shape the UI expects
  function buildScreenFromApi(json) {
    const sections = Array.isArray(json.sections) ? json.sections : [];

    const columns = sections.map((sec) => ({
      id: sec.id,
      title: sec.title,
      // let MenuBoard do its "legacy items -> priceRow blocks" mapping
      items: Array.isArray(sec.items)
        ? sec.items
            .filter((it) => it.active !== false) // hide inactive by default
            .map((it) => ({
              type: "priceRow",
              label: it.label,
              price: it.price,
            }))
        : [],
    }));

    return {
      id: json.screenId || "screen-1",
      columns,
    };
  }

  function useScreenData(pollMs = 5000) {
    const [state, setState] = useState({
      loading: true,
      error: null,
      screen: null,
      group: null,
      theme: null,
    });

    useEffect(() => {
      const screenId = getScreenIdFromPath();
      let closed = false;
      let timerId;

      async function fetchScreen() {
        try {
          const res = await fetch(`/api/screens/${screenId}?t=${Date.now()}`, {
            cache: "no-store",
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          if (closed) return;

          // apply theme tokens
          if (json.theme) applyTheme(json.theme);

          // build the "screen" shape from sections
          const screen = buildScreenFromApi(json);

          // basic group stub (we only use baseFontSize right now)
          const group =
            json.group && typeof json.group === "object"
              ? json.group
              : { id: json.groupId || "default", baseFontSize: 32 };

          setState({
            loading: false,
            error: null,
            screen,
            group,
            theme: json.theme || null,
          });
        } catch (err) {
          if (closed) return;
          console.error("[useScreenData] fetch error", err);
          setState((s) => ({ ...s, loading: false, error: String(err) }));
        }
      }

      // initial load
      fetchScreen();

      // polling
      if (pollMs > 0) {
        timerId = setInterval(fetchScreen, pollMs);
      }

      return () => {
        closed = true;
        if (timerId) clearInterval(timerId);
      };
    }, [pollMs]);

    return state;
  }

  function applyTheme(theme) {
    if (!theme) return;
    const root = document.documentElement;

    root.style.setProperty("--rk-bg", theme.background);
    root.style.setProperty("--rk-header-bg", theme.headerBg);
    root.style.setProperty("--rk-header-text", theme.headerText);
    root.style.setProperty("--rk-header-border", theme.headerBorder);
    root.style.setProperty("--rk-row-text", theme.rowText);
    root.style.setProperty("--rk-price-text", theme.priceText);
    root.style.setProperty("--rk-accent", theme.accent);
    root.style.setProperty("--rk-notice-bg", theme.noticeBg);
    root.style.setProperty("--rk-notice-text", theme.noticeText);
  }

  /* ───────────────────── Screen Eight ──────────────────────── */

  function HistoryCarouselBlock({ block }) {
    const images = Array.isArray(block.images) ? block.images : [];
    const intervalMs = block.intervalMs || 15000; // 15s default
    const [idx, setIdx] = useState(0);

    // preload all images once
    useEffect(() => {
      images.forEach((img) => {
        if (!img || !img.src) return;
        const pre = new Image();
        pre.src = img.src;
      });
    }, [images]);

    // rotate through images
    useEffect(() => {
      if (!images.length) return;
      const id = setInterval(() => {
        setIdx((prev) => (prev + 1) % images.length);
      }, intervalMs);
      return () => clearInterval(id);
    }, [images, intervalMs]);

    if (!images.length) return null;
    const img = images[idx];

    return (
      <div className="info-card">
        {block.title && (
          <div className="info-card-title">{block.title}</div>
        )}
        {block.body && (
          <div className="info-card-subtitle">{block.body}</div>
        )}
        <div className="info-card-images">
          <img
            key={img.src}                     // re-mount to re-run CSS animation
            className="info-card-image slideshow-fade"
            src={img.src}
            alt={img.alt || ""}
          />
        </div>
      </div>
    );
  }

  function getCurrentPromoVariant(variants) {
    if (!Array.isArray(variants) || variants.length === 0) return null;
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12

    const byMonth = variants.find(
      (v) => Array.isArray(v.months) && v.months.includes(month)
    );
    if (byMonth) return byMonth;

    const def = variants.find((v) => v.default);
    return def || variants[0];
  }

  function PromoPanelBlock({ block }) {
    const variants = Array.isArray(block.variants) ? block.variants : [];
    const v = getCurrentPromoVariant(variants);
    if (!v) return null;

    return (
      <div className="info-card">
        {v.headline && (
          <div className="info-card-title">{v.headline}</div>
        )}
        {v.subHeadline && (
          <div className="info-card-subtitle">{v.subHeadline}</div>
        )}

        {Array.isArray(v.bodyLines) && v.bodyLines.length > 0 && (
          <div className="info-card-body">
            {v.bodyLines.map((line, i) =>
              line.trim() === "" ? (
                // spacer line
                <div key={`space-${i}`} style={{ height: "0.8em" }} />
              ) : (
                <div key={i}>{line}</div>
              )
            )}
          </div>
        )}

        {Array.isArray(v.logos) && v.logos.length > 0 && (
          <div className="info-card-logos">
            {v.logos.map((logo) => (
              <img
                key={logo.src}
                className="info-card-logo"
                src={logo.src}
                alt={logo.alt || ""}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ───────────────────── blocks renderer ───────────────────── */

  function renderBlock(block, idx) {
    switch (block.type) {
      case "priceRow":
        return (
          <div className="menu-row" key={idx}>
            <div
              className="menu-row-label"
              dangerouslySetInnerHTML={{ __html: block.label }}
            />
            <div className="menu-row-price">{block.price}</div>
          </div>
        );

      case "historyCarousel":
        return <HistoryCarouselBlock key={idx} block={block} />;

      case "promoPanel":
        return <PromoPanelBlock key={idx} block={block} />;

      case "paragraph":
        return (
          <div className="menu-paragraph" key={idx}>
            {block.text}
          </div>
        );

      case "small":
        return (
          <div className="menu-paragraph menu-paragraph--small" key={idx}>
            {block.text}
          </div>
        );

      case "divider":
        return <div className="menu-divider" key={idx} />;

      case "sectionHeader":
        return (
          <div className="menu-subheader" key={idx}>
            {block.text}
          </div>
        );

      case "toppingsRow":
        return (
          <div className="menu-toppings-row" key={idx}>
            {Array.isArray(block.items)
              ? block.items.map((t) => (
                  <span className="menu-topping" key={t}>
                    {t}
                  </span>
                ))
              : null}
          </div>
        );

      case "socialCard": {
        // Main social panel controls
        const scale = block.scale ?? 1;
        const x = block.xOffset ?? 0;
        const y = block.yOffset ?? 0;
        const maxH = block.maxHeight ?? "190px";

        // Coke logo controls (independent, like a second hero image)
        const cokeScale = block.cokeScale ?? 1;
        const cokeX = block.cokeXOffset ?? 0;
        const cokeY = block.cokeYOffset ?? 0;
        const cokeMaxH = block.cokeMaxHeight ?? maxH;

        return (
          <div className="social-card" key={idx}>
            <div className="social-card-inner">
              <img
                className="social-card-image"
                src={block.src || "/img/social-follow.png"}
                alt={block.alt || "Follow us on social media"}
                style={{
                  transform: `translate(${x}px, ${y}px) scale(${scale})`,
                  maxHeight: maxH,
                }}
              />
              {block.cokeSrc && (
                <img
                  className="social-card-logo"
                  src={block.cokeSrc}
                  alt={block.cokeAlt || "Coca-Cola"}
                  style={{
                    transform: `translate(${cokeX}px, ${cokeY}px) scale(${cokeScale})`,
                    maxHeight: cokeMaxH,
                  }}
                />
              )}
            </div>
          </div>
        );
      }

      case "noticeCard":
        return (
          <div className="notice-card" key={idx}>
            <div className="notice-card-main">
              *THOROUGHLY COOKING MEATS, POULTRY, SEAFOOD, SHELLFISH, OR EGGS REDUCES
              THE RISK OF FOODBORNE ILLNESS.
            </div>
            <div className="notice-card-sub">
              CONNECTICUT PUBLIC HEALTH CODE SECTION 19-13-B42(M)(1)(F)
            </div>
          </div>
        );

      case "heroImage": {
        // defaults
        const scale = block.scale ?? 1;
        const x = block.xOffset ?? 0;
        const y = block.yOffset ?? 0;
        const h = block.maxHeight ?? "100%";

        return (
          <img
            key={idx}
            className="menu-hero-image"
            src={block.src}
            alt={block.alt || ""}
            style={{
              transform: `translate(${x}px, ${y}px) scale(${scale})`,
              maxHeight: h,
            }}
          />
        );
      }

      default:
        if (block && (block.label || block.price)) {
          return (
            <div className="menu-row" key={idx}>
              <div className="menu-row-label">{block.label}</div>
              <div className="menu-row-price">{block.price}</div>
            </div>
          );
        }
        return null;
    }
  }

  /* ───────────────────── components ───────────────────── */

  function MenuBoard({ column }) {
    if (!column) return null;

    // hero blocks (for top images)
    const heroBlocks = Array.isArray(column.heroBlocks) ? column.heroBlocks : [];

    // If column.blocks exists, use that. Otherwise map legacy items -> priceRow blocks.
    const allBlocks =
      column.blocks && Array.isArray(column.blocks)
        ? column.blocks
        : Array.isArray(column.items)
        ? column.items.map((item) =>
            item && item.type
              ? item // already a block (paragraph, noticeCard, etc.)
              : { type: "priceRow", label: item.label, price: item.price }
          )
        : [];

    // Blocks that should live at the bottom of the column
    const footerTypes = new Set(["noticeCard", "socialCard"]);
    const mainBlocks = allBlocks.filter((b) => !footerTypes.has(b.type));
    const footerBlocks = allBlocks.filter((b) => footerTypes.has(b.type));

    return (
      <div className="menu-board">
        {heroBlocks.length > 0 && (
          <div className="menu-hero">
            {heroBlocks.map((b, idx) => renderBlock(b, idx))}
          </div>
        )}

        <div className="menu-header">{column.title}</div>

        <div className="menu-items">
          <div className="menu-items-main">
            {mainBlocks.length === 0 ? (
              <div className="empty-state">No items configured.</div>
            ) : (
              mainBlocks.map((b, idx) => renderBlock(b, idx))
            )}
          </div>

          {footerBlocks.length > 0 && (
            <div className="menu-items-footer">
              {footerBlocks.map((b, idx) => renderBlock(b, idx))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function App() {
    const { loading, error, screen, group } = useScreenData();

    const style = group
      ? {
          fontSize: group.baseFontSize
            ? group.baseFontSize + "px"
            : undefined,
        }
      : {};

    return (
      <div className="screen-root" style={style}>
        {loading && !screen && (
          <div className="empty-state">Loading screen...</div>
        )}
        {error && <div className="empty-state">{error}</div>}
        {!loading && !screen && !error && (
          <div className="empty-state">Screen not configured yet.</div>
        )}

        {screen && (
          <div className="screen-columns">
            {screen.columns && screen.columns.length > 0 ? (
              screen.columns.map((col) => (
                <MenuBoard key={col.id || col.title} column={col} />
              ))
            ) : (
              <div className="empty-state">No columns configured.</div>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ───────────────────── bootstrapping ───────────────────── */

  const rootEl = document.getElementById("root");
  if (rootEl) {
    const root = ReactDOM.createRoot(rootEl);
    root.render(<App />);
  }
})();
