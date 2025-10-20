// lib/TokenStore.ts
let _token: string | null = null;

type Listener = (token: string | null) => void;
const listeners = new Set<Listener>();

// ✅ ตั้งค่า token (เลือก persist = localStorage, broadcast = sync ข้ามแท็บ)
export function setToken(
  token: string | null,
  opts: { persist?: boolean; broadcast?: boolean } = { persist: true, broadcast: true }
) {
  _token = token;

  if (typeof window !== "undefined" && opts.persist) {
    if (token) localStorage.setItem("auth_token", token);
    else localStorage.removeItem("auth_token");
  }

  // แจ้งผู้ฟังในหน้านี้
  listeners.forEach((l) => l(_token));

  // กระตุ้น storage event ข้ามแท็บ/หน้าต่าง
  if (typeof window !== "undefined" && opts.broadcast) {
    try {
      localStorage.setItem("__auth_ping__", String(Date.now()));
    } catch {}
  }
}

// ✅ ดึง token ปัจจุบัน (memory > localStorage)
export function getToken(): string | null {
  if (_token) return _token;
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("auth_token");
    if (stored) _token = stored;
  }
  return _token;
}

// ✅ subscribe สำหรับกรณีอยากฟังการเปลี่ยน token
export function onTokenChange(cb: Listener) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// ✅ เรียกครั้งเดียวใน client เพื่อรับ storage event ข้ามแท็บ
export function initTokenStoreSync() {
  if (typeof window === "undefined") return;
  // sync เมื่ออีกแท็บ login/logout
  window.addEventListener("storage", (e) => {
    if (e.key === "auth_token") {
      _token = e.newValue;
      listeners.forEach((l) => l(_token));
    }
  });
}
