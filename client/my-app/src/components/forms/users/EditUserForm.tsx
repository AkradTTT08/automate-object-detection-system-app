"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type User = {
  usr_id: number;
  usr_username: string;
  usr_name: string;
  usr_email: string;
  usr_phone: string;
  usr_role: string;
  usr_is_use: boolean;
};

type EditUserDialogProps = {
  user: User;
  onUpdated?: (user: User) => void; 
};

export function EditUserDialog({ user, onUpdated }: EditUserDialogProps) {
  const [open, setOpen] = useState(false);

  const [username, setUsername] = useState(user.usr_username);
  const [name, setName] = useState(user.usr_name);
  const [phone, setPhone] = useState(user.usr_phone);
  const [email, setEmail] = useState(user.usr_email);
  const [role, setRole] = useState(user.usr_role); 
  const [isUse, setIsUse] = useState(user.usr_is_use); 

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/users/${user.usr_id}`, {
        method: "PUT",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username,
          name,
          phone,
          email,
          usr_role: role, 
          is_use: isUse,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to update the user information.");
      }

      const updatedUser: User = result.data ?? result;

      onUpdated?.(updatedUser);
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while updating the user information.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </DialogTrigger>

      
      <DialogContent   className="sm:max-w-md [&>button:nth-of-type(1)]:hidden" >
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-blue-600">Edit User</DialogTitle>
            <DialogDescription>
              Fill in the details and click Save.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="space-y-2">
              <Label htmlFor="name"className="font-normal">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username"className="font-normal">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email"className="font-normal">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone"className="font-normal">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone"
              />
            </div>

            <div className="flex items-start justify-between gap-8 mt-2">
              
              <div className="flex flex-col flex-1">
                <Label className="text-sm font-normal ">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือก role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="security team">Security Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              
              <div className="flex flex-col flex-1">
                <Label className="text-sm font-normal mb-2">Status</Label>

                
                <div className="flex items-center h-full">
                  <Switch
                    checked={isUse}
                    onCheckedChange={setIsUse}
                    className="scale-150 data-[state=checked]:bg-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={saving} className="px-6">
              {saving ? "saving..." : "Save"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
