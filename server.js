// server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { menuSections, asItems, asPriceRows, saveMenuSections } from "./menu-data.js";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SLIDER_DIR = path.join(__dirname, "public", "img", "slider");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ───────────────────────── Groups ─────────────────────────

const groups = {
  default: {
    id: "default",
    name: "Default Group",
    fontFamily: "'Luckiest Guy', system-ui, sans-serif",
    baseFontSize: 32,
    themeId: "classic-blue" // default theme
  }
};

// ───────────────────────── Themes ─────────────────────────

const themes = {
  "classic-blue": {
    id: "classic-blue",
    label: "Classic Blue",
    background: "#007bff",
    headerBg: "#00cb31",
    headerText: "#ffffff",
    headerBorder: "#000000",
    rowText: "#ffffff",
    priceText: "#ffffff",
    accent: "#007bff",
    noticeBg: "#007bff",
    noticeText: "#ffffff"
  },
  summer: {
    id: "summer",
    label: "Summer",
    background: "#ffb347",
    headerBg: "#ff7b00",
    headerText: "#ffffff",
    headerBorder: "#5a2e00",
    rowText: "#2b1900",
    priceText: "#2b1900",
    accent: "#ffe66d",
    noticeBg: "#2b1900",
    noticeText: "#ffe66d"
  },
  "breast-cancer-pink": {
    id: "breast-cancer-pink",
    label: "Breast Cancer Awareness",
    background: "#ffb3d9",
    headerBg: "#ff4d94",
    headerText: "#ffffff",
    headerBorder: "#7a0033",
    rowText: "#3a0019",
    priceText: "#3a0019",
    accent: "#ffe6f2",
    noticeBg: "#7a0033",
    noticeText: "#ffe6f2"
  }
};

// ───────────────────────── Slider helpers ─────────────────────────

function getSliderImages() {
  let files = [];
  try {
    files = fs.readdirSync(SLIDER_DIR);
  } catch (err) {
    console.error("Error reading slider dir:", err);
    return [];
  }

  const images = files.filter((file) => /\.(png|jpe?g|gif|webp)$/i.test(file));

  // Fisher–Yates shuffle
  for (let i = images.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [images[i], images[j]] = [images[j], images[i]];
  }

  return images.map((file) => {
    const nameWithoutExt = file.replace(/\.[^/.]+$/, "");
    return {
      src: `/img/slider/${file}`,
      alt: nameWithoutExt.replace(/[-_]/g, " ").toUpperCase()
    };
  });
}

function getThemeForScreen(screen) {
  if (!screen) return themes["classic-blue"];

  // 1) per-screen override
  if (screen.themeId && themes[screen.themeId]) {
    return themes[screen.themeId];
  }

  // 2) group theme
  const group = groups[screen.groupId] || groups.default;
  if (group.themeId && themes[group.themeId]) {
    return themes[group.themeId];
  }

  // 3) fallback
  return themes["classic-blue"];
}

/**
 * Hydrate a screen:
 * - rebuild items/blocks from menuSections using column.sectionKey + sectionMode
 * - append any extraBlocks
 * - inject slider images into historyCarousel blocks
 */
function hydrateScreen(screenId) {
  const base = screens[screenId];
  if (!base) return null;

  // deep clone so we don't mutate the template in memory
  const screen = JSON.parse(JSON.stringify(base));

  // 1) Rebuild menu items/blocks from the *current* menuSections
  for (const col of screen.columns || []) {
    // only dynamic menu columns have these
    if (!col.sectionKey || !col.sectionMode) continue;

    const section = menuSections[col.sectionKey];
    if (!section) continue;

    // extras like noticeCard / socialCard defined on the column
    const extras = Array.isArray(col.extraBlocks) ? col.extraBlocks : [];

    if (col.sectionMode === "items") {
      // Normal item columns (HOT_DOGS, BURGERS on screen-5, etc.)
      // MenuBoard will convert these into priceRow blocks unless they already have type.
      col.items = [...asItems(section), ...extras];
    } else if (col.sectionMode === "priceRows") {
      // Columns that explicitly use blocks/priceRow (BURGERS on screen-1, BEVERAGES)
      col.blocks = [...asPriceRows(section), ...extras];
    }
  }

  // 2) Inject slider images into any historyCarousel blocks
  for (const col of screen.columns || []) {
    if (!col.blocks) continue;
    for (const block of col.blocks) {
      if (block.type === "historyCarousel") {
        block.images = getSliderImages();
      }
    }
  }

  return screen;
}

// ───────────────────────── Screens ─────────────────────────
// NOTE: columns that use menu sections have:
//   - sectionKey: which menuSections[...] to use
//   - sectionMode: "items" or "priceRows"
//   - extraBlocks: extra blocks appended after price rows/items

const screens = {
  "screen-1": {
    id: "screen-1",
    groupId: "default",
    columns: [
      {
        id: "left-hotdogs",
        title: "HOT DOGS",
        sectionKey: "HOT_DOGS",
        sectionMode: "items"
      },
      {
        id: "right-burgers",
        title: "HAMBURGERS*",
        sectionKey: "BURGERS",
        sectionMode: "priceRows",
        extraBlocks: [{ type: "noticeCard" }]
      }
    ]
  },

  "screen-2": {
    id: "screen-2",
    groupId: "default",
    columns: [
      {
        id: "left-sandwiches",
        title: "SANDWICHES",
        sectionKey: "SANDWICHES",
        sectionMode: "items"
      },
      {
        id: "right-seafood",
        title: "SEAFOOD ORDERS",
        sectionKey: "SEAFOOD_ORDERS",
        sectionMode: "items"
      }
    ]
  },

  "screen-3": {
    id: "screen-3",
    groupId: "default",
    columns: [
      {
        id: "left-sides-1",
        title: "SIDES",
        sectionKey: "SIDES_LEFT",
        sectionMode: "items"
      },
      {
        id: "right-sides-2",
        title: "SIDES",
        sectionKey: "SIDES_RIGHT",
        sectionMode: "items"
      }
    ]
  },

  "screen-4": {
    id: "screen-4",
    groupId: "default",
    columns: [
      {
        id: "left-extras-1",
        title: "EXTRAS",
        blocks: [
          { type: "paragraph", text: "MAKE ANY SEAFOOD ORDER A PLATE FOR 6.50 MORE" },
          { type: "small", text: "(FRENCH FRIES & COLESLAW)" },
          { type: "divider" },
          { type: "paragraph", text: "SUBSTITUTE ONION RINGS FOR FRENCH FRIES FOR 8.50" },
          { type: "sectionHeader", text: "FREE TOPPINGS" },
          {
            type: "toppingsRow",
            items: ["PICKLES", "ONION", "TOMATO", "MAYO", "LETTUCE", "HOT PEPPERS"]
          }
        ]
      },
      {
        id: "right-beverages-2",
        title: "BEVERAGES",
        sectionKey: "BEVERAGES",
        sectionMode: "priceRows",
        extraBlocks: [
          {
            type: "socialCard",
            src: "/img/social-follow.png",
            alt: "Follow Glenwood Drive-In",
            cokeSrc: "/img/coke-logo.png",
            cokeAlt: "Coca-Cola",
            scale: 1.0,
            xOffset: -60,
            yOffset: -20,
            maxHeight: "180px",
            cokeScale: 1.2,
            cokeXOffset: -20,
            cokeYOffset: -20,
            cokeMaxHeight: "160px"
          }
        ]
      }
    ]
  },

  "screen-5": {
    id: "screen-5",
    groupId: "default",
    columns: [
      {
        id: "screen5-burgers",
        title: "HAMBURGERS*",
        heroBlocks: [
          {
            type: "heroImage",
            src: "/img/s5-kid-hotdog.png",
            scale: 1.2,
            xOffset: -120,
            yOffset: -22,
            maxHeight: "180px"
          },
          {
            type: "heroImage",
            src: "/img/s5-burger.png",
            scale: 1.2,
            xOffset: 12,
            yOffset: -10,
            maxHeight: "190px"
          }
        ],
        sectionKey: "BURGERS",
        sectionMode: "items",
        extraBlocks: [{ type: "noticeCard" }]
      },
      {
        id: "screen5-hotdogs",
        title: "HOT DOGS",
        heroBlocks: [
          {
            type: "heroImage",
            src: "/img/s5-fries.png",
            scale: 1.3,
            xOffset: -15,
            yOffset: 5
          },
          {
            type: "heroImage",
            src: "/img/s5-hotdogs.png",
            scale: 1.1,
            xOffset: 10,
            yOffset: -5
          }
        ],
        sectionKey: "HOT_DOGS",
        sectionMode: "items"
      }
    ]
  },

  "screen-6": {
    id: "screen-6",
    groupId: "default",
    columns: [
      {
        id: "screen6-sides-left",
        title: "SIDES",
        heroBlocks: [
          {
            type: "heroImage",
            src: "/img/s6-lobster-roll.png",
            scale: 1.25,
            xOffset: -30,
            yOffset: -15,
            maxHeight: "190px"
          },
          {
            type: "heroImage",
            src: "/img/s6-onion-rings.png",
            scale: 1.45,
            xOffset: 70,
            yOffset: 5,
            maxHeight: "190px"
          }
        ],
        sectionKey: "SIDES_LEFT",
        sectionMode: "items"
      },
      {
        id: "screen6-sides-right",
        title: "SIDES",
        heroBlocks: [
          {
            type: "heroImage",
            src: "/img/s6-clam-plate.png",
            scale: 1.3,
            xOffset: -80,
            yOffset: -5,
            maxHeight: "190px"
          },
          {
            type: "heroImage",
            src: "/img/s6-kid.-icecream.png",
            scale: 1.2,
            xOffset: 75,
            yOffset: -22,
            maxHeight: "180px"
          }
        ],
        sectionKey: "SIDES_RIGHT",
        sectionMode: "items"
      }
    ]
  },

  "screen-7": {
    id: "screen-7",
    groupId: "default",
    columns: [
      {
        id: "left-sandwiches",
        title: "SANDWICHES",
        sectionKey: "SANDWICHES",
        sectionMode: "items"
      },
      {
        id: "right-seafood",
        title: "SEAFOOD ORDERS",
        sectionKey: "SEAFOOD_ORDERS",
        sectionMode: "items"
      }
    ]
  },

  "screen-8": {
    id: "screen-8",
    groupId: "default",
    columns: [
      {
        id: "screen8-extras",
        title: "EXTRAS",
        blocks: [
          { type: "paragraph", text: "MAKE ANY SEAFOOD ORDER A PLATE FOR 6.50 MORE" },
          { type: "small", text: "(FRENCH FRIES & COLESLAW)" },
          { type: "divider" },
          { type: "paragraph", text: "SUBSTITUTE ONION RINGS FOR FRENCH FRIES 8.50" },
          { type: "sectionHeader", text: "TOPPINGS" },
          {
            type: "toppingsRow",
            items: ["PICKLES", "ONION", "TOMATO", "MAYO", "LETTUCE", "HOT PEPPERS"]
          }
        ]
      },
      {
        id: "screen8-info",
        title: "WELCOME",
        blocks: [
          {
            type: "historyCarousel",
            title: "GLENWOOD DRIVE-IN",
            body: "FAMILY OWNED & OPERATED SINCE 1955",
            intervalMs: 12000
          },
          {
            type: "promoPanel",
            variants: [
              {
                id: "online",
                default: true,
                headline: "ORDER ONLINE",
                subHeadline: "& BEAT THE LINE!",
                bodyLines: [
                  "GLENWOODDRIVEIN.COM",
                  " ",
                  "GIFT CARDS AVAILABLE ALL YEAR",
                  "Perfect for the Glenwood fan in your life"
                ],
                logos: [
                  { src: "/img/logo-ubereats.png", alt: "Uber Eats" },
                  { src: "/img/logo-doordash.png", alt: "DoorDash" }
                ]
              },
              {
                id: "breast-cancer",
                months: [10],
                headline: "PAINT HAMDEN PINK",
                bodyLines: [
                  "Ask about how you to support"
                ],
                logos: Array.from({ length: 11 }).map(() => ({
                  src: "/img/s9-breast-cancer-ribbon.png",
                  alt: "Ribbon"
                }))
              }
            ]
          }
        ]
      }
    ]
  },

  outdated: {
    id: "outdated",
    groupId: "default",
    columns: [
      {
        id: "left",
        title: "OUTDATED",
        items: [
          { label: "SOFT SHELL CRAB (SEASONAL)", price: "M/P" }
        ]
      },
      {
        id: "right",
        title: "ITEMS",
        items: [
          { label: "SOFT SHELL CRAB (SEASONAL)", price: "M/P" }
        ]
      }
    ]
  }
};

// ───────────────────────── SSE helpers ─────────────────────────

const clients = new Map(); // { screenId: Set<res> }

function sendScreenUpdate(screenId) {
  const screen = hydrateScreen(screenId);
  const group = screen ? groups[screen.groupId] || groups.default : groups.default;
  const theme = getThemeForScreen(screen);

  const payload = JSON.stringify({ screen, group, theme });
  const set = clients.get(screenId);
  if (!set) return;

  for (const res of set) {
    res.write(`data: ${payload}\n\n`);
  }
}

// ───────────────────────── API routes ─────────────────────────

// Get a screen
app.get("/api/screens/:screenId", (req, res) => {
  const { screenId } = req.params;
  const screen = hydrateScreen(screenId);
  if (!screen) return res.status(404).json({ error: "Screen not found" });

  const group = groups[screen.groupId] || groups.default;
  const theme = getThemeForScreen(screen);
  res.json({ screen, group, theme });
});

// Create or update screen (not used much)
app.post("/api/screens/:screenId", (req, res) => {
  const { screenId } = req.params;
  const current = screens[screenId];

  if (!current) {
    screens[screenId] = {
      id: screenId,
      groupId: req.body.groupId || "default",
      columns: req.body.columns || []
    };
  } else {
    screens[screenId] = {
      ...current,
      ...req.body,
      id: screenId,
      groupId: req.body.groupId || current.groupId || "default"
    };
  }

  sendScreenUpdate(screenId);
  res.json({ ok: true, screen: screens[screenId] });
});

// Change a group's theme
app.post("/api/groups/:groupId/theme", (req, res) => {
  const { groupId } = req.params;
  const { themeId } = req.body;

  if (!themes[themeId]) {
    return res.status(400).json({ error: "Unknown themeId" });
  }

  const group = groups[groupId];
  if (!group) {
    return res.status(404).json({ error: "Group not found" });
  }

  group.themeId = themeId;
  console.log(`Group ${groupId} theme set to ${themeId}`);

  // refresh all screens in that group
  for (const [id, screen] of Object.entries(screens)) {
    if (screen.groupId === groupId && !screen.themeId) {
      sendScreenUpdate(id);
    }
  }

  res.json({ ok: true, group });
});

// List themes
app.get("/api/themes", (req, res) => {
  res.json({ themes: Object.values(themes) });
});

// List groups
app.get("/api/groups", (req, res) => {
  res.json({ groups: Object.values(groups) });
});

// Get menu data (admin-menu)
app.get("/api/menu", (req, res) => {
  res.json({ menuSections });
});

// Save menu data (admin-menu)
app.post("/api/menu", (req, res) => {
  const incoming = req.body.menuSections;

  if (!incoming || typeof incoming !== "object") {
    return res.status(400).json({ error: "menuSections object required" });
  }

  // Replace in-place so references stay valid
  for (const key of Object.keys(menuSections)) {
    delete menuSections[key];
  }
  for (const [key, value] of Object.entries(incoming)) {
    menuSections[key] = value;
  }

  saveMenuSections();

  // notify all connected screens
  for (const screenId of Object.keys(screens)) {
    sendScreenUpdate(screenId);
  }

  res.json({ ok: true, menuSections });
});

// SSE stream for live updates
app.get("/api/stream/:screenId", (req, res) => {
  const { screenId } = req.params;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
  });

  if (!clients.has(screenId)) {
    clients.set(screenId, new Set());
  }
  clients.get(screenId).add(res);

  // initial payload
  const screen = hydrateScreen(screenId);
  const group = screen ? groups[screen.groupId] || groups.default : groups.default;
  const theme = getThemeForScreen(screen);
  res.write(`data: ${JSON.stringify({ screen, group, theme })}\n\n`);

  req.on("close", () => {
    const set = clients.get(screenId);
    if (set) {
      set.delete(res);
      if (set.size === 0) clients.delete(screenId);
    }
  });
});

// ───────────────────────── Static files ─────────────────────────

app.use(express.static(path.join(__dirname, "public")));

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("/admin-menu", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin-menu.html"));
});

// All screen paths use the same HTML shell
app.get("/:screenId", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// root points to screen-1
app.get("/", (req, res) => {
  res.redirect("/screen-1");
});

app.listen(PORT, () => {
  console.log(`Live boards server running on http://localhost:${PORT}`);
});
