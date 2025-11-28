"use client";
import { useState } from "react";
import {Dialog,DialogTrigger, DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogFooter,} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem,} from "@/components/ui/select";

export default function RegisterUserDialog() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("ttt@1234");


  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function validatePhone(v: string): string {
    const trimmed = v.trim();
    if (trimmed === "") return "";
    const digits = (trimmed.match(/\d/g) || []).length;
    if (!/^[+\d][\d\s\-()]*$/.test(trimmed)) return "Invalid phone number.";
    if (digits < 7) return "Invalid phone number.";
    if (digits > 10) return "Phone must be at most 10 digits.";
    return "";
  }

  async function handleGenerateUser() {
  try {
    const res = await fetch("/api/users/next-username", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // 🔹 อ่านเป็น text ก่อน กันเคสที่ backend ส่ง "Internal Server Error" ที่ไม่ใช่ JSON
    const raw = await res.text();
    let data: any = null;

    try {
      data = raw ? JSON.parse(raw) : null; // ถ้าเป็น JSON จริงจะ parse ได้
    } catch {
      // ถ้า parse ไม่ได้ → raw คือข้อความดิบเช่น "Internal Server Error"
      throw new Error(raw || `Server error (HTTP ${res.status})`);
    }

    if (!res.ok) {
      const msg = data?.message || raw || `Failed to generate username (HTTP ${res.status})`;
      throw new Error(msg);
    }

    if (!data?.username) {
      throw new Error("Server did not return username");
    }

    // ✅ ใส่ค่าใน input อัตโนมัติ
    setUsername(data.username);
    setPassword("ttt@1234"); // password default
  } catch (err: any) {
    alert(err.message || "Failed to generate username");
  }
}

  async function handleSubmit() {
    setError("");

    if (!username || !email || role === undefined || !phone ) {
      setError("กรุณากรอก Username, Email, Role และ phone ให้ครบ");
      return;
    }

    if (!isValidEmail(email)) {
      setError("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }

    const phoneError = validatePhone(phone);
    if (phoneError !== "") {
      setError(phoneError);
      return;
    }

    try {
      setSubmitting(true);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        email,
        password, // ค่าใน state (เช่น "ttt@1234")
        role,
        phone,
      }),
    });

    // 🔹 อ่านเป็น text ก่อน
    const raw = await res.text();
    let data: any = null;

    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      // ถ้า parse ไม่ได้ แสดงว่า backend ส่งข้อความธรรมดามา
    }

    if (!res.ok) {
      const msg = data?.message || raw || `Register failed (HTTP ${res.status})`;
      throw new Error(msg);
    }


      console.log("Register success: ", data);

      setOpen(false);
      setUsername("");
      setEmail("");
      setRole(undefined);
      setPhone("");
      setPassword("");

      window.location.reload();
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#0077FF] text-white hover:bg-[#0063d6]">
          Register
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#0077FF]"> Register</DialogTitle>
          <DialogDescription>
            Fill in the details and click Register
          </DialogDescription>

           <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateUser}>
              Generate
            </Button>
      </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <input
                id="username"
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full rounded-md border px-3 py-2 text-sm">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="security officer">
                    Security Officer
                  </SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <input
              id="email"
              type="email"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring focus:ring-blue-100"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="phone">Phone</Label>
            <input
              id="phone"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring focus:ring-blue-100"
              placeholder="Enter your phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>



          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter className="mt-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            className="bg-[#0077FF] text-white hover:bg-[#0063d6]"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Registering..." : "Register"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
