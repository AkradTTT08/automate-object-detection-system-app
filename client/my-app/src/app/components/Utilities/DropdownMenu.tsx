"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DropdownMenuDemo({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  // ---- detect platform เพื่อโชว์ปุ่มให้ตรง OS ----
  const isMac = typeof navigator !== "undefined"
    ? /Mac|iPhone|iPad|iPod/.test(navigator.platform || "") ||
      /Mac OS/.test(navigator.userAgent || "")
    : false;
  const shortcutLabel = isMac ? "⌘B" : "Ctrl+B";

  function handleAccount() {
    window.location.href = "/settings";
  }
  function handleSetting() {}
  async function handleLogout() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      window.location.href = "/login";
    } catch (_) {
      // noop
    } finally {
      setLoading(false);
    }
  }

  // ---- คีย์ลัด: ⌘B (Mac) / Ctrl+B (Win/Linux) ----
  useEffect(() => {
    const isEditable = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName.toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        el.isContentEditable ||
        (tag === "div" && el.getAttribute("role") === "textbox")
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // ข้ามถ้ากำลังพิมพ์ในช่องข้อความ
      if (isEditable(e.target)) return;

      const key = e.key.toLowerCase();
      const metaOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (metaOrCtrl && key === "b") {
        e.preventDefault();
        handleAccount();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMac]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleAccount}>
            Account
            <DropdownMenuShortcut>{shortcutLabel}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSetting} disabled>
            Settings
            {/* <DropdownMenuShortcut>{isMac ? "⌘S" : "Ctrl+S"}</DropdownMenuShortcut> */}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Log out
          {/* <DropdownMenuShortcut>{isMac ? "⇧⌘Q" : "Ctrl+Shift+Q"}</DropdownMenuShortcut> */}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}