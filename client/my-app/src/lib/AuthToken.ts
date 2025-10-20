// app/utils/AuthToken.ts
"use client";

export class AuthToken {
  private static token: string | null = null;

  /** เก็บ token ใน memory + localStorage */
  static set(token: string) {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  /** ดึง token จาก memory หรือ localStorage */
  static get(): string | null {
    if (this.token) return this.token;
    const stored = localStorage.getItem("auth_token");
    if (stored) this.token = stored;
    return this.token;
  }

  /** ลบ token (เช่นตอน logout) */
  static clear() {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  /** ดึงข้อมูลผู้ใช้จาก /api/auth/me */
  static async fetchMe(baseUrl: string) {
    const token = this.get();
    if (!token) throw new Error("No token found");

    const res = await fetch(`${baseUrl}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch user");
    return res.json();
  }
}
