// middleware.ts
import { NextRequest, NextResponse } from "next/server";

function isPublic(pathname: string) {
  // ไฟล์ statics ไม่ต้องยุ่ง
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.[a-zA-Z0-9]+$/) // ไฟล์มีนามสกุล เช่น .png .css
  );
}

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get("access_token")?.value;

  // 1) ถ้าเข้า /login แล้วมี token -> เด้งออก
  if (pathname === "/login") {
    if (token) {
      const nextParam = searchParams.get("next");
      // กัน open redirect: ยอมรับเฉพาะ path ภายในแอพ
      const safeNext =
        nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
          ? nextParam
          : "/cameras"; // หรือจะเปลี่ยนเป็น "/cameras" ก็ได้
      return NextResponse.redirect(new URL(safeNext, req.url));
    }
    return NextResponse.next(); // ยังไม่ล็อกอิน -> เข้าหน้า login ได้
  }

  // 2) หน้าที่ต้องล็อกอิน
  const needsAuth =
    pathname.startsWith("/cameras") || pathname.startsWith("/alerts");
  if (needsAuth && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// ให้ middleware ทำงานที่ /login ด้วย
export const config = {
  matcher: ["/login", "/cameras/:path*", "/alerts/:path*"],
};
