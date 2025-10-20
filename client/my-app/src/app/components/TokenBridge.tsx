// app/components/TokenBridge.tsx
"use client";

import { useEffect } from "react";
import { useAuth } from "@/app/providers/AuthProvider"; // path ให้ตรงโปรเจกต์คุณ
import { setToken, initTokenStoreSync } from "@/lib/TokenStore";

export default function TokenBridge() {
  const { getToken } = useAuth(); // ✅ ใช้ useAuth เฉพาะใน client

  useEffect(() => {
    initTokenStoreSync(); // เปิด sync ข้ามแท็บ
    // ตั้งค่า token ตอน mount
    setToken(getToken(), { persist: true, broadcast: false });
    // ถ้าอยากให้ตาม token แบบ reactive มากขึ้น
    // แนะนำให้ AuthProvider เรียก setToken ใน login/logout ด้วย (ดูด้านล่าง)
  }, [getToken]);

  return null;
}
