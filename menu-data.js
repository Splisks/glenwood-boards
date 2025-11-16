// menu-data.js
// Shared menu sections + helpers for Glenwood boards.
// Single source of truth for items + prices.
// Supports saving to menu-data.json so admin changes persist.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "menu-data.json");

// Default data used if menu-data.json doesn't exist yet
const defaultMenuSections = {
  HOT_DOGS: [
    { id: "hotdog",         label: "HOT DOG",            price: "6.25" },
    { id: "red-hotdog",     label: "RED HOT DOG",        price: "6.75" },
    { id: "cheese-dog",     label: "CHEESE DOG",         price: "7.25" },
    { id: "chili-dog",      label: "CHILI DOG",          price: "7.25" },
    { id: "chili-cheese",   label: "CHILI/CHEESE DOG",   price: "7.95" },
    { id: "add-bacon",      label: "ADD BACON",          price: "1.65" },
    { id: "grilled-onions", label: "GRILLED ONIONS",     price: "1.65" }
  ],

  BURGERS: [
    { id: "hamburger",      label: "HAMBURGER",                price: "7.35" },
    { id: "cheeseburger",   label: "CHEESEBURGER",             price: "7.85" },
    {
      id: "big-boy",
      label: "BIG BOY BURGER<br>&nbsp;&nbsp;(2 PATTIES)",
      price: "11.00"
    },
    { id: "big-boy-cheese", label: "BIG BOY CHEESEBURGER",     price: "11.75" }
  ],

  SIDES_LEFT: [
    { id: "fries",        label: "FRENCH FRIES",                 price: "4.60" },
    { id: "cheese-fries", label: "CHEESE FRIES",                 price: "6.35" },
    { id: "chili-cheese", label: "CHILI CHEESE FRIES",           price: "8.00" },
    { id: "sweet-potato", label: "SWEET POTATO FRIES",           price: "7.00" },
    { id: "rings",        label: "ONION RINGS",                  price: "8.50" },
    {
      id: "frings",
      label: "FRINGS<br>&nbsp;&nbsp;(1/2 FRIES, 1/2 RINGS)",
      price: "8.75",
      type: "priceRow" // keep special formatting
    }
  ],

  SIDES_RIGHT: [
    { id: "bites",        label: "BUFFALO CHICKEN BITES",        price: "9.00" },
    { id: "coleslaw",     label: "COLESLAW",                     price: "6.00" },
    { id: "mozz-sticks",  label: "MOZZARELLA STICKS",            price: "8.50" },
    { id: "zucchini",     label: "ZUCCHINI",                     price: "5.50" },
    { id: "add-cheese",   label: "ADD CHEESE",                   price: "1.50" },
    {
      id: "add-bacon-or-onion",
      label: "ADD BACON OR<br>&nbsp;&nbsp;GRILLED ONION",
      price: "1.65",
      type: "priceRow"
    }
  ],

  SANDWICHES: [
    { id: "grilled-cheese",   label: "GRILLED CHEESE",           price: "4.65" },
    { id: "blt",              label: "BLT",                      price: "8.00" },
    { id: "fried-chicken",    label: "FRIED CHICKEN",            price: "7.75" },
    { id: "grilled-chicken",  label: "GRILLED CHICKEN",          price: "8.25" },
    { id: "tuna",             label: "TUNA",                     price: "8.00" },
    { id: "fish",             label: "FISH",                     price: "12.00" },
    { id: "chicken-fingers",  label: "CHICKEN FINGER ORDER",     price: "9.75" },
    { id: "chicken-plate",    label: "CHICKEN FINGER PLATE",     price: "14.00" }
  ],

  SEAFOOD_ORDERS: [
    { id: "clam-strip",   label: "CLAM STRIP",                   price: "19.50" },
    { id: "whole-clams",  label: "WHOLE CLAMS",                  price: "27.00" },
    { id: "scallops",     label: "SCALLOPS",                     price: "24.00" },
    { id: "shrimp",       label: "SHRIMP",                       price: "16.00" },
    { id: "lobster-roll", label: "LOBSTER ROLL",                 price: "26.50" },
    { id: "fish-plate",   label: "FISH PLATE",                   price: "23.00" },
    {
      id: "soft-shell",
      label: "SOFT SHELL CRAB<br>&nbsp;&nbsp;(SEASONAL)",
      price: "M/P",
      type: "priceRow"
    }
  ],

  BEVERAGES: [
    { id: "soda",         label: "SODA",                price: "2.75" },
    { id: "bottle-soda",  label: "BOTTLED SODA (20oz)", price: "2.60" },
    { id: "bottle-water", label: "BOTTLED WATER (20oz)",price: "2.35" },
    { id: "ice-tea",      label: "ICE TEA",             price: "2.65" },
    { id: "powerade",     label: "POWERADE",            price: "2.50" }
  ]
};

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// Live object we mutate and export
export let menuSections = deepClone(defaultMenuSections);

// Try to load from JSON on disk
try {
  if (fs.existsSync(DATA_PATH)) {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      menuSections = parsed;
      console.log("Loaded menu-data.json");
    }
  }
} catch (err) {
  console.error("Failed to load menu-data.json, using defaults:", err);
}

export function saveMenuSections() {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(menuSections, null, 2), "utf8");
    console.log("Saved menu-data.json");
  } catch (err) {
    console.error("Failed to save menu-data.json:", err);
  }
}

// Helpers so you do not repeat type: "priceRow" everywhere
// Inactive items (active === false) are filtered out.
export const asItems = (section) =>
  (section || [])
    .filter((item) => item.active !== false)
    .map(({ label, price, type, id }) =>
      type ? { type, label, price, id } : { label, price, id }
    );

export const asPriceRows = (section) =>
  (section || [])
    .filter((item) => item.active !== false)
    .map(({ label, price, id }) => ({ type: "priceRow", label, price, id }));
