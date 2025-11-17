// app/api/screens/[screenId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { THEMES, resolveActiveThemeId, type ThemeId } from "@/lib/themes";

// Force this route to be fully dynamic & non-cached
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _req: NextRequest,
  { params }: { params: { screenId: string } }
) {
  const screenId = params.screenId || "unknown";

  // ───────── Theme from Group (with safe fallback) ─────────
  // For now we use a single group "default". Later you can map screenId -> groupId.
  let groupId = "default";
  let baseThemeId: ThemeId = "classic-blue";

  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (group?.themeId) {
      baseThemeId = group.themeId as ThemeId;
    }
  } catch (err) {
    console.error(
      "[api/screens] failed to read Group, using default theme",
      err
    );
  }

  const activeThemeId = resolveActiveThemeId(baseThemeId);
  const theme = THEMES[activeThemeId] ?? THEMES["classic-blue"];

  // ───────── Menu sections (LIVE from DB) ─────────
  let sections: {
    id: string;
    key: string;
    title: string;
    items: any[];
  }[] = [];

  try {
    const rows = await prisma.menuSection.findMany({
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { title: "asc" },
    });

    sections = rows.map((s) => ({
      id: s.id,
      key: s.key,
      title: s.title,
      items: s.items,
    }));
  } catch (err) {
    console.error("[api/screens] failed to load menuSection data", err);
    sections = [];
  }

  // Important: send explicit no-store headers so Vercel / browsers never cache this
  return NextResponse.json(
    {
      screenId,
      groupId,
      themeId: activeThemeId,
      theme,
      sections,
    },
    {
      headers: {
        "Cache-Control": "no-store", // always hit the server / DB
      },
    }
  );
}
