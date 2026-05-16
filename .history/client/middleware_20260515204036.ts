import { NextRequest, NextResponse } from "next/server";
import { ROLES } from "@/lib/constants";
import { COOKIE_NAME } from "@/lib/constants";

const PUBLIC_ROUTES = ["/login", "/signup"];

// Which dashboard routes each role can access
const ROLE_ALLOWED_ROUTES: Record<string, string[]> = {
  [ROLES.ADMIN]: [
    "/dashboard/admin",
    "/dashboard/sales",
    "/dashboard/sanction",
    "/dashboard/disbursement",
    "/dashboard/collection",
  ],
  [ROLES.SALES]: ["/dashboard/sales"],
  [ROLES.SANCTION]: ["/dashboard/sanction"],
  [ROLES.DISBURSEMENT]: ["/dashboard/disbursement"],
  [ROLES.COLLECTION]: ["/dashboard/collection"],
  [ROLES.BORROWER]: ["/application", "/loan", "/profile"],
};

/**
 * Decodes JWT payload without verifying signature.
 * Verification happens on the backend — middleware only reads role for routing.
 */
const decodeJwtPayload = (token: string): { role?: string } | null => {
  try {
    const base64Payload = token.split(".")[1];
    const decoded = Buffer.from(base64Payload, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  const token = req.cookies.get(COOKIE_NAME)?.value;


  // No token — redirect to login unless already on public route
  if (!token) {
    if (isPublicRoute) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const payload = decodeJwtPayload(token);

  // Invalid token structure — clear and redirect
  if (!payload?.role) {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  const role = payload.role;

  // Logged in user trying to access login/signup — redirect to their home
  if (isPublicRoute) {
    const redirectMap: Record<string, string> = {
      [ROLES.BORROWER]: "/application",
      [ROLES.SALES]: "/dashboard/sales",
      [ROLES.SANCTION]: "/dashboard/sanction",
      [ROLES.DISBURSEMENT]: "/dashboard/disbursement",
      [ROLES.COLLECTION]: "/dashboard/collection",
      [ROLES.ADMIN]: "/dashboard/admin",
    };
    return NextResponse.redirect(
      new URL(redirectMap[role] ?? "/login", req.url)
    );
  }

  // Check if role is allowed on the requested route
  const allowedRoutes = ROLE_ALLOWED_ROUTES[role] ?? [];
  const isAllowed = allowedRoutes.some((route) => pathname.startsWith(route));

  if (!isAllowed) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};