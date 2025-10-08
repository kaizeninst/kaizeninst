import { NextResponse } from "next/server";

export const config = {
  matcher: ["/admin/:path*"],
};

// 🔹 Helper: decode JWT payload
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

// 🔹 Helper: ตรวจหมดอายุ + สิทธิ์
const isExpired = (p) => !p || typeof p.exp !== "number" || p.exp <= Math.floor(Date.now() / 1000);
const allowedRole = (p) => p && ["admin", "staff"].includes(p.role);

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("accessToken")?.value;

  // ✅ allow static assets / api / favicon
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|txt|map)$/)
  ) {
    return NextResponse.next();
  }

  // ✅ allow login page
  if (pathname === "/admin/login") return NextResponse.next();

  // 🚫 ถ้าไม่มี token → กลับหน้า login
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const p = decodeJwtPayload(token);
  if (isExpired(p) || !allowedRole(p)) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // 🚫 staff ห้ามเข้า /admin/staffs/**
  if (pathname.startsWith("/admin/staffs") && p.role === "staff") {
    // เด้งกลับ dashboard
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // ✅ ผ่านได้ทั้งหมด
  return NextResponse.next();
}
