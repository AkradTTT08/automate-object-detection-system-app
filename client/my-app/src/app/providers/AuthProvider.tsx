"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthToken } from "@/lib/AuthToken";

export interface Me {
  usr_id: number;
  usr_username: string;
  usr_email: string;
  usr_role?: string;
}

interface AuthContextType {
  me: Me | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  getToken: () => string | null; // 👈 เพิ่มใน type
}

const AuthContext = createContext<AuthContextType | null>(null);
const base = process.env.NEXT_PUBLIC_APP_URL!;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลผู้ใช้เมื่อเปิดหน้า (ถ้ามี token)
  useEffect(() => {
    (async () => {
      const token = AuthToken.get();
      if (token) {
        try {
          const res = await AuthToken.fetchMe(base);
          setMe(res.user);
        } catch (err) {
          console.error("Auth load error:", err);
          AuthToken.clear();
        }
      }
      setLoading(false);
    })();
  }, []);

  // เข้าสู่ระบบ
  const login = async (username: string, password: string) => {
    const res = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (res.ok && data.token) {
      AuthToken.set(data.token);
      setMe(data.user);
    } else {
      throw new Error(data.message || "Login failed");
    }
  };

  // ออกจากระบบ
  const logout = () => {
    AuthToken.clear();
    setMe(null);
  };

  // ✅ ฟังก์ชันใหม่: getToken
  const getToken = (): string | null => {
    return AuthToken.get();
  };

  // ฟังก์ชัน fetch ที่แนบ token อัตโนมัติ
  const authFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const token = getToken();
    const headers = new Headers(init?.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);
    headers.set("Content-Type", "application/json");

    const response = await fetch(input, { ...init, headers });
    return response;
  };

  return (
    <AuthContext.Provider value={{ me, loading, login, logout, authFetch, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};