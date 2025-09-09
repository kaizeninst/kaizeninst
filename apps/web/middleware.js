// apps/web/middleware.js
import { NextResponse } from "next/server";

// ทำงานเฉพาะ /admin/** เท่านั้น
export const config = {
  matcher: ["/admin/:path*"],
};

// Helpers
function decodeJwtPayload(token) {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}
const isExpired = (p) => !p || typeof p.exp !== "number" || p.exp <= Math.floor(Date.now() / 1000);
const allowedRole = (p) => p && ["admin", "staff"].includes(p.role);

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // ---- Allowlist: อย่าแตะไฟล์ระบบ/สาธารณะ/ API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|txt|map)$/)
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("accessToken")?.value;

  if (pathname === "/admin/login") {
    if (!token) return NextResponse.next();

    const p = decodeJwtPayload(token);
    if (!p || isExpired(p) || !allowedRole(p)) {
      return NextResponse.next();
    }
    // มี token ใช้ได้แล้ว แต่ดันเข้าหน้า login → เด้งไปแดชบอร์ด
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // ----- หน้า /admin อื่น ๆ ต้องมี token + role ถูกต้อง
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  const payload = decodeJwtPayload(token);
  if (isExpired(payload) || !allowedRole(payload)) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}
