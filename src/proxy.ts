import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const intlMiddleware = createMiddleware(routing);

function resolveLocale(pathname: string): string {
  if (pathname.startsWith("/en")) return "en";
  if (pathname.startsWith("/ar")) return "ar";
  return routing.defaultLocale;
}

function withLocaleHeader(response: NextResponse, locale: string) {
  response.headers.set("x-next-locale", locale);
  return response;
}

function loginRedirect(request: NextRequest, clearToken = false) {
  const response = withLocaleHeader(
    NextResponse.redirect(new URL("/admin/login", request.url)),
    routing.defaultLocale
  );
  if (clearToken) {
    response.cookies.delete("admin-token");
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Root files requested by crawlers — never treat as [locale].
  if (pathname === "/ads.txt" || pathname === "/robots.txt" || pathname === "/sitemap.xml") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("admin-token")?.value;
    const isLoginPage = pathname === "/admin/login";

    if (!token && !isLoginPage) {
      return loginRedirect(request);
    }

    if (token) {
      const payload = await verifyToken(token);

      if (!payload && !isLoginPage) {
        return loginRedirect(request, true);
      }

      if (payload && isLoginPage) {
        return withLocaleHeader(
          NextResponse.redirect(new URL("/admin", request.url)),
          routing.defaultLocale
        );
      }
    }

    return withLocaleHeader(NextResponse.next(), routing.defaultLocale);
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const response = intlMiddleware(request);
  return withLocaleHeader(response, resolveLocale(pathname));
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
