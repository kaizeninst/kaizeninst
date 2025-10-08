import { NextResponse } from "next/server";

export const config = {
  matcher: ["/admin/:path*"],
};

/* -------------------------------------------------------------
 * Helper: Decode JWT payload safely (Base64URL → JSON)
 * ------------------------------------------------------------- */
function decodeJwtPayload(token) {
  try {
    const encodedPart = token.split(".")[1];
    if (!encodedPart) return null;
    const jsonString = Buffer.from(
      encodedPart.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString("utf8");
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------
 * Helper: Validate expiration and role permissions
 * ------------------------------------------------------------- */
function isTokenExpired(payload) {
  if (!payload || typeof payload.exp !== "number") return true;
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= currentTimeInSeconds;
}

function isAllowedRole(payload) {
  return payload && ["admin", "staff"].includes(payload.role);
}

/* -------------------------------------------------------------
 * Main Middleware: Protect admin routes
 * ------------------------------------------------------------- */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  // ✅ Allow public assets, API routes, and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|txt|map)$/)
  ) {
    return NextResponse.next();
  }

  // ✅ Allow /admin/login without authentication
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // 🚫 No token → redirect to login
  if (!accessToken) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // ✅ Decode and verify token
  const payload = decodeJwtPayload(accessToken);
  if (isTokenExpired(payload) || !isAllowedRole(payload)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // 🚫 Restrict staff from accessing /admin/staffs/**
  if (pathname.startsWith("/admin/staffs") && payload.role === "staff") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // 🔁 Force staff with must_change_password=true to /admin/change-password
  if (payload.role === "staff" && payload.must_change_password === true) {
    const isAlreadyOnChangePasswordPage = pathname.startsWith("/admin/change-password");
    if (!isAlreadyOnChangePasswordPage) {
      return NextResponse.redirect(new URL("/admin/change-password", request.url));
    }
  }

  // ✅ Allow access
  return NextResponse.next();
}
