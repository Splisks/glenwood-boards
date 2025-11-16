import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const sliderDir = path.join(process.cwd(), "public", "img", "slider");

    const files = await fs.readdir(sliderDir);

    const images = files
      .filter((name) => /\.(png|jpe?g|gif|webp)$/i.test(name))
      .map((name) => `/img/slider/${name}`);

    return NextResponse.json({ images });
  } catch (err) {
    console.error("[slider-api] failed to read slider folder", err);
    // graceful fallback so the page still renders
    return NextResponse.json({ images: [] });
  }
}
