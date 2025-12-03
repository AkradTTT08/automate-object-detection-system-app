// src/lib/fetchWithAuth.ts
import { cookies, headers } from "next/headers";

export async function fetchWithAuth<T = any>(
  path: string,
  options?: RequestInit
): Promise<T> {
  // ⬇️ ดึง cookie จาก request ปัจจุบัน
  const cookieHeader = cookies().toString();

  // ⬇️ สร้าง base URL จาก header ของ request (host + protocol)
  const h = headers();
  const host =
    h.get("x-forwarded-host") ?? // ใช้กรณีรันหลัง proxy (เช่น reverse proxy / vercel)
    h.get("host");

  if (!host) {
    throw new Error("fetchWithAuth: cannot resolve host from request headers");
  }

  const protocol =
    h.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");

  const base = `${protocol}://${host}`;

  // ⬇️ ถ้า path เป็น relative (/api/...) ให้ต่อเป็น absolute URL ก่อน
  const url = path.startsWith("http") ? path : `${base}${path}`;

  const res = await fetch(url, {
    ...options,
    method: options?.method ?? "GET",
    cache: options?.cache ?? "no-store",
    headers: {
      Cookie: cookieHeader, // ✅ forward token ใน cookie ไปให้ backend
      Accept: "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let body = "";
    try {
      body = await res.text();
    } catch {}

    console.error("[fetchWithAuth] API error:", {
      url,
      status: res.status,
      statusText: res.statusText,
      body,
    });

    throw new Error(
      `API request failed: ${path} (${res.status} ${res.statusText})`
    );
  }

  return res.json() as Promise<T>;
}