// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const MENU = {
  HOT_DOGS: [
    { id: "hotdog", label: "HOT DOG", price: "6.25" },
    { id: "red-hotdog", label: "RED HOT DOG", price: "6.75" },
    { id: "cheese-dog", label: "CHEESE DOG", price: "7.25" },
    { id: "chili-dog", label: "CHILI DOG", price: "7.25" },
    { id: "chili-cheese", label: "CHILI/CHEESE DOG", price: "7.95" },
    { id: "add-bacon", label: "ADD BACON", price: "1.65" },
    { id: "grilled-onions", label: "GRILLED ONIONS", price: "1.65" }
  ],
  BURGERS: [
    {
      id: "hamburger",
      label: "HAMBURGER",
      price: "10.35"
    },
    {
      id: "cheeseburger",
      label: "CHEESEBURGER",
      price: "7.85"
    },
    {
      id: "big-boy",
      // strip HTML -> nice text
      label: "BIG BOY BURGER (2 PATTIES)",
      price: "11.00"
    },
    {
      id: "big-boy-cheese",
      label: "BIG BOY CHEESEBURGER",
      price: "11.75"
    }
  ],
  SIDES_LEFT: [
    { id: "fries", label: "FRENCH FRIES", price: "4.60" },
    { id: "cheese-fries", label: "CHEESE FRIES", price: "6.35" },
    { id: "chili-cheese-fries", label: "CHILI CHEESE FRIES", price: "8.00" },
    { id: "sweet-potato", label: "SWEET POTATO FRIES", price: "7.00" },
    { id: "rings", label: "ONION RINGS", price: "8.50" },
    {
      id: "frings",
      label: "FRINGS (1/2 FRIES, 1/2 RINGS)",
      price: "8.75"
    }
  ],
  SIDES_RIGHT: [
    { id: "bites", label: "BUFFALO CHICKEN BITES", price: "9.00" },
    { id: "coleslaw", label: "COLESLAW", price: "6.00" },
    { id: "mozz-sticks", label: "MOZZARELLA STICKS", price: "8.50" },
    { id: "zucchini", label: "ZUCCHINI", price: "5.50" },
    { id: "add-cheese", label: "ADD CHEESE", price: "1.50" },
    {
      id: "add-bacon-or-onion",
      label: "ADD BACON OR GRILLED ONION",
      price: "1.65"
    }
  ],
  SANDWICHES: [
    { id: "grilled-cheese", label: "GRILLED CHEESE", price: "4.65" },
    { id: "blt", label: "BLT", price: "8.00" },
    { id: "fried-chicken", label: "FRIED CHICKEN", price: "7.75" },
    { id: "grilled-chicken", label: "GRILLED CHICKEN", price: "8.25" },
    { id: "tuna", label: "TUNA", price: "8.00" },
    { id: "fish", label: "FISH", price: "12.00" },
    { id: "chicken-fingers", label: "CHICKEN FINGER ORDER", price: "9.75" },
    {
      id: "chicken-plate",
      label: "CHICKEN FINGER PLATE",
      price: "14.00"
    }
  ],
  SEAFOOD_ORDERS: [
    { id: "clam-strip", label: "CLAM STRIP", price: "19.50" },
    { id: "whole-clams", label: "WHOLE CLAMS", price: "27.00" },
    { id: "scallops", label: "SCALLOPS", price: "24.00" },
    { id: "shrimp", label: "SHRIMP", price: "16.00" },
    { id: "lobster-roll", label: "LOBSTER ROLL", price: "26.50" },
    { id: "fish-plate", label: "FISH PLATE", price: "23.00" },
    {
      id: "soft-shell",
      label: "SOFT SHELL CRAB (SEASONAL)",
      price: "M/P"
    }
  ],
  BEVERAGES: [
    { id: "soda", label: "SODA", price: "2.75" },
    {
      id: "bottle-soda",
      label: "BOTTLED SODA (20OZ)",
      price: "2.60"
    },
    {
      id: "bottle-water",
      label: "BOTTLED WATER (20OZ)",
      price: "2.35"
    },
    { id: "ice-tea", label: "ICE TEA", price: "2.65" },
    { id: "powerade", label: "POWERADE", price: "2.50" }
  ]
};

async function main() {
  console.log("Seeding menu…");

  for (const [sectionKey, items] of Object.entries(MENU)) {
    // Create or find section by key
    const section = await prisma.menuSection.upsert({
      where: { key: sectionKey },
      update: {},
      create: {
        key: sectionKey,
        title: sectionKey.replace(/_/g, " ")
      }
    });

    // Clear existing items in this section (so re-running seed is safe)
    await prisma.menuItem.deleteMany({
      where: { sectionId: section.id }
    });

    // Insert items in order
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      await prisma.menuItem.create({
        data: {
          sectionId: section.id,
          code: item.id,
          label: normalizeLabel(item.label),
          price: item.price,
          active: true,
          sortOrder: index
        }
      });
    }

    console.log(`Seeded section ${sectionKey}`);
  }

  console.log("Done.");
}

// strip any remaining <br>, &nbsp; just in case
function normalizeLabel(label) {
  return label
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
