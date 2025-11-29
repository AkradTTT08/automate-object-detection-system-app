"use client";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function RegisterUserDialog() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<string | undefined>("staff");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const defaultPassword = process.env.DEFAULT_PASSWORD || "";

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);
  const [serverErrorCode, setServerErrorCode] = useState<number | null>(null);
  //เช็คอีเมลว่าถูก Format มั้ย
  function isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }
  //เช็คเบอร์โทรว่าถูก Format มั้ย
  function validatePhone(v: string): string {
    const trimmed = v.trim();
    if (trimmed === "") return "";
    const digits = (trimmed.match(/\d/g) || []).length;
    if (!/^[+\d][\d\s\-()]*$/.test(trimmed)) return "Invalid phone number.";
    if (digits < 7) return "Invalid phone number.";
    if (digits > 10) return "Phone must be at most 10 digits.";
    return "";
  }
  //  GenerateUser จากฝั่ง Servics
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

      const raw = await res.text();
      let data: any = null;

      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        throw new Error(raw || `Server error (HTTP ${res.status})`);
      }

      if (!res.ok) {
        const msg =
          data?.message ||
          raw ||
          `Failed to generate username (HTTP ${res.status})`;
        throw new Error(msg);
      }

      if (!data?.username) {
        throw new Error("Server did not return username");
      }

      // ใส่ค่าใน input อัตโนมัติ
      setUsername(data.username);
    } catch (err: any) {
      alert(err.message || "Failed to generate username");
    }
  }

  async function handleSubmit() {
    setError("");
    setSuccess(false); // reset success
    setServerErrorCode(null); // reset error code

    const trimmedUsername = username.trim();
    const rawEmail = email.trim();
    const rawPhone = phone.trim();

    if (!trimmedUsername) {
      setError("Username required");
      return;
    }

    if (rawEmail !== "" && !isValidEmail(rawEmail)) {
      setError("Email format is invalid.");
      return;
    }

    if (rawPhone !== "") {
      const phoneError = validatePhone(rawPhone);
      if (phoneError !== "") {
        setError("Phone number format is invalid.");
        return;
      }
    }

    try {
      setSubmitting(true);

      const emailToSend =
        rawEmail !== "" ? rawEmail : `${trimmedUsername}@no-email.local`;

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: emailToSend,
          password: defaultPassword,
          role,
          phone: rawPhone,
        }),
      });

      const raw = await res.text();
      let data: any = null;

      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }

      if (!res.ok) {
        let msg = "";

        if (data && typeof data === "object" && "message" in data) {
          msg = (data as any).message ?? "";
        } else if (raw.startsWith("<")) {
          const m = raw.match(/Error:\s*([^<\n]+)/i);
          msg = m?.[0]?.trim() || "";
        }

        if (!msg) {
          msg = `Register failed (HTTP ${res.status})`;
        }

        setServerErrorCode(res.status);
        throw new Error(msg);
      }

      console.log("Register success: ", data);

      setOpen(false);
      setUsername("");
      setEmail("");
      setRole("staff");
      setPhone("");

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

      <DialogContent className="max-w-md rounded-2xl [&>button]:hidden">
        <DialogHeader className="space-y-0">
          <div className="flex items-start justify-between">
            {/* ซ้าย: Title + Description (stack กันใน column) */}
            <div>
              <DialogTitle className="text-[#0077FF] text-lg">
                Register
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Fill in the details and click Register
              </DialogDescription>
            </div>

            {/* ขวา: ปุ่ม Generate */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-[#0077FF] text-[#0077FF] hover:bg-blue-50"
              onClick={handleGenerateUser}
            >
              Generate
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
                  <SelectItem value="security team">
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

          {error && (
            <p className="text-sm text-red-600">
              {serverErrorCode === 409
                ? "This username already exists."
                : error}
            </p>
          )}

          {success && (
            <p className="text-sm text-green-600">Register success.</p>
          )}
        </div>
        <DialogFooter className="mt-6 flex flex-row gap-3 justify-end">
          <Button
            className="bg-[#0077FF] text-white hover:bg-[#0063d6]"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Registering..." : "Register"}
          </Button>

          <Button
            variant="outline"
            className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
