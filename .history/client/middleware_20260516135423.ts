import { NextRequest, NextResponse } from "next/server";
import { ROLES } from "@/lib/constants";
import { COOKIE_NAME } from "@/lib/constants";

const PUBLIC_ROUTES = ["/login", "/signup", "/unauthorized"];

const ROLE_ALLOWED_ROUTES: Record<string, string[]> = {
  [ROLES.ADMIN]: ["/dashboard"],
  [ROLES.SALES]: ["/dashboard/sales"],
  [ROLES.SANCTION]: ["/dashboard/sanction"],
  [ROLES.DISBURSEMENT]: ["/dashboard/disbursement"],
  [ROLES.COLLECTION]: ["/dashboard/collection"],
  [ROLES.BORROWER]: ["/", "/home", "/application", "/loan", "/profile"],
};

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

  if (!token) {
    if (isPublicRoute) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const payload = decodeJwtPayload(token);

  if (!payload?.role) {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  const role = payload.role;

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

  const allowedRoutes = ROLE_ALLOWED_ROUTES[role] ?? [];
  const isAllowed = allowedRoutes.some((route) => {
    // "/" should match only "/" exactly, not everything starting with "/"
    if (route === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(route);
  });

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