// app/api/groups/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ groups });
  } catch (err: any) {
    console.error("[api/groups] error", err);
    return NextResponse.json(
      { error: err?.message || "Failed to load groups" },
      { status: 500 }
    );
  }
}
