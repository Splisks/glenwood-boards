import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPath =
    pathname === "/admin" || pathname.startsWith("/admin/");

  if (!isAdminPath) return NextResponse.next();

  // Bypass auth in local dev if flag is set
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "1") {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || !token.email) {
    const signInUrl = new URL("/api/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const allowedEmails = (process.env.ALLOWED_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const email = String(token.email).toLowerCase();

  if (!allowedEmails.includes(email)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
