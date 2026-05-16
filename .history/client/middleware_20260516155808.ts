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
  [ROLES.BORROWER]: [
    "/",
    "/home",
    "/application",
    "/loan",
    "/profile",
  ],
};

const decodeJwtPayload = (
  token: string
): { role?: string } | null => {
  try {
    const payload = token.split(".")[1];

    if (!payload) return null;

    const base64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = atob(base64);

    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
};

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Skip static files
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  const token = req.cookies.get(COOKIE_NAME)?.value;

  // No token
  if (!token) {
    if (isPublicRoute) {
      return NextResponse.next();
    }

    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  // Decode token
  const payload = decodeJwtPayload(token);

  if (!payload?.role) {
    const response = NextResponse.redirect(
      new URL("/login", req.url)
    );

    response.cookies.delete(COOKIE_NAME);

    return response;
  }

  const role = payload.role;

  // Already logged in user visiting login/signup
  if (isPublicRoute) {
    const redirectMap: Record<string, string> = {
      [ROLES.BORROWER]: "/home",
      [ROLES.SALES]: "/dashboard/sales",
      [ROLES.SANCTION]: "/dashboard/sanction",
      [ROLES.DISBURSEMENT]: "/dashboard/disbursement",
      [ROLES.COLLECTION]: "/dashboard/collection",
      [ROLES.ADMIN]: "/dashboard",
    };

    return NextResponse.redirect(
      new URL(redirectMap[role] || "/login", req.url)
    );
  }

  // RBAC
  const allowedRoutes =
    ROLE_ALLOWED_ROUTES[role] || [];

  const isAllowed = allowedRoutes.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(route);
  });

  if (!isAllowed) {
    return NextResponse.redirect(
      new URL("/unauthorized", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};