// app/api/groups/[groupId]/theme/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastMenuUpdated } from "@/lib/sse";

export async function POST(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const { groupId } = params;

  try {
    const body = await req.json().catch(() => ({}));
    const themeId = body.themeId as string | undefined;

    if (!themeId || typeof themeId !== "string") {
      return NextResponse.json(
        { error: "themeId is required" },
        { status: 400 }
      );
    }

    // Use your real Prisma model: Group
    const group = await prisma.group.upsert({
      where: { id: groupId },
      update: { themeId },
      create: { id: groupId, themeId },
    });

    // Notify all connected screens so they re-fetch
    broadcastMenuUpdated({
      reason: "themeChanged",
      groupId: group.id,
      themeId,
    });

    return NextResponse.json({ group });
  } catch (err: any) {
    console.error("[api/groups/[groupId]/theme] error", err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Failed to update theme (see server logs for details).",
      },
      { status: 500 }
    );
  }
}
