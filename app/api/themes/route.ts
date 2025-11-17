// app/api/themes/route.ts
import { NextResponse } from "next/server";
import { THEMES } from "@/lib/themes";

export async function GET() {
  const themes = Object.values(THEMES).map((t) => ({
    id: t.id,
    label: t.label,
  }));
  return NextResponse.json({ themes });
}
