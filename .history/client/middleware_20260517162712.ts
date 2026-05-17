import { NextRequest, NextResponse } from "next/server";

const ROLES = {
  BORROWER: "borrower",
  SALES: "sales",
  SANCTION: "sanction",
  DISBURSEMENT: "disbursement",
  COLLECTION: "collection",
  ADMIN: "admin",
} as const;

const COOKIE_NAME = "lms_token";

const PUBLIC_ROUTES = ["/login", "/signup", "/unauthorized"];

const ROLE_ALLOWED_ROUTES: Record<string, string[]> = {
  [ROLES.ADMIN]: ["/dashboard"],
  [ROLES.SALES]: ["/dashboard/sales"],
  [ROLES.SANCTION]: ["/dashboard/sanction"],
  [ROLES.DISBURSEMENT]: ["/dashboard/disbursement"],
  [ROLES.COLLECTION]: ["/dashboard/collection"],
  [ROLES.BORROWER]: ["/application", "/loan", "/profile"],
};

const ROLE_REDIRECT: Record<string, string> = {
  [ROLES.BORROWER]: "/application",
  [ROLES.SALES]: "/dashboard/sales",
  [ROLES.SANCTION]: "/dashboard/sanction",
  [ROLES.DISBURSEMENT]: "/dashboard/disbursement",
  [ROLES.COLLECTION]: "/dashboard/collection",
  [ROLES.ADMIN]: "/dashboard/admin",
};

/**
 * Decodes JWT payload using atob — works on Edge Runtime without Buffer.
 */
const decodeJwtPayload = (token: string): { role?: string } | null => {
  try {
    const base64 = token.split(".")[1]
      ?.replace(/-/g, "+")
      .replace(/_/g, "/");
    if (!base64) return null;
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

export function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;

    const isPublicRoute = PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    const token = req.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      if (isPublicRoute) return NextResponse.next();
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const payload = decodeJwtPayload(token);

    if (!payload?.role) {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete(COOKIE_NAME);
      return res;
    }

    const { role } = payload;

    if (isPublicRoute) {
      return NextResponse.redirect(
        new URL(ROLE_REDIRECT[role] ?? "/login", req.url)
      );
    }

    const allowedRoutes = ROLE_ALLOWED_ROUTES[role] ?? [];
    const isAllowed = allowedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (!isAllowed) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.next();
  }
}

