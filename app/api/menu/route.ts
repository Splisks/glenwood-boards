// app/api/menu/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// Shape returned to frontend:
// { menuSections: { [key: string]: { id, label, price, active }[] } }

export async function GET() {
  try {
    const sections = await prisma.menuSection.findMany({
      orderBy: { key: "asc" },
      include: {
        items: {
          orderBy: { sortOrder: "asc" }
        }
      }
    });

    const menuSections: Record<string, { id: string; label: string; price: string; active?: boolean }[]> =
      {};

    for (const section of sections) {
      menuSections[section.key] = section.items.map((item) => ({
        id: item.code,
        label: item.label,
        price: item.price,
        active: item.active
      }));
    }

    return NextResponse.json({ menuSections });
  } catch (err) {
    console.error("[GET /api/menu] error", err);
    return NextResponse.json(
      { error: "Failed to load menu." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const menuSections = body.menuSections as
      | Record<string, { id: string; label: string; price: string; active?: boolean }[]>
      | undefined;

    if (!menuSections) {
      return NextResponse.json(
        { error: "menuSections missing in body" },
        { status: 400 }
      );
    }

    for (const [sectionKey, items] of Object.entries(menuSections)) {
      if (!sectionKey) continue;

      // upsert section
      const section = await prisma.menuSection.upsert({
        where: { key: sectionKey },
        update: {},
        create: {
          key: sectionKey,
          title: sectionKey.replace(/_/g, " ")
        }
      });

      const codesInPayload = new Set<string>();

      // upsert items
      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        const code = item.id?.trim() || `${sectionKey.toLowerCase()}-${index}`;

        codesInPayload.add(code);

        await prisma.menuItem.upsert({
          where: {
            sectionId_code: {
              sectionId: section.id,
              code
            }
          },
          update: {
            label: item.label ?? "",
            price: item.price ?? "",
            active: item.active !== false,
            sortOrder: index
          },
          create: {
            sectionId: section.id,
            code,
            label: item.label ?? "",
            price: item.price ?? "",
            active: item.active !== false,
            sortOrder: index
          }
        });
      }

      // delete removed items
      await prisma.menuItem.deleteMany({
        where: {
          sectionId: section.id,
          NOT: {
            code: { in: Array.from(codesInPayload) }
          }
        }
      });
    }

    // Return the fresh state
    return GET();
  } catch (err) {
    console.error("[POST /api/menu] error", err);
    return NextResponse.json(
      { error: "Failed to save menu." },
      { status: 500 }
    );
  }
}
