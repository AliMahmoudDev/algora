import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Protected routes (all under /[locale]/ prefix)
  const protectedRoutes = ["/dashboard", "/profile", "/settings"];
  const isProtected = protectedRoutes.some((route) =>
    pathname.includes(route)
  );

  if (isProtected && !req.auth) {
    // Detect locale from the URL path
    const segments = pathname.split("/");
    const possibleLocale = segments[1];
    const locale = possibleLocale === "ar" ? "ar" : "en";
    return NextResponse.redirect(
      new URL(`/${locale}/auth/signin`, req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match protected routes with locale prefix
    "/:locale/dashboard/:path*",
    "/:locale/profile/:path*",
    "/:locale/settings/:path*",
  ],
};
