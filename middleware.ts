import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const ROUTE_PERMISSIONS: Record<string, string> = {
  "/reports": "reports:view",
  "/employees": "employees:view",
  "/settings": "settings:view",
  "/finance": "finance:view",
};

function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  );
}

function requiredPermissionForPath(pathname: string): string | null {
  for (const [path, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    const apiPath = `/api${path}`;
    const matches =
      pathname === path ||
      pathname.startsWith(`${path}/`) ||
      pathname === apiPath ||
      pathname.startsWith(`${apiPath}/`);

    if (matches) {
      return permission;
    }
  }

  return null;
}

function nextWithPathname(request: NextRequest, pathname: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith("/api/");

  if (isPublicPath(pathname)) {
    return nextWithPathname(request, pathname);
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    if (isApiRoute) {
      return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  const requiredPermission = requiredPermissionForPath(pathname);

  if (requiredPermission && !hasPermission(session.roles, requiredPermission)) {
    if (isApiRoute) {
      return NextResponse.json({ message: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return nextWithPathname(request, pathname);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
