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
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

type User = {
  usr_id: number;
  usr_username: string;
  usr_name: string;
};

type DeleteUserDialogProps = {
  user: User;
  onDeleted?: (id: number) => void; // callback ให้ parent ลบออกจาก list
};
export function DeleteUserDialog({ user, onDeleted }: DeleteUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ต้องพิมพ์คำว่า Delete เท่านั้น
  const match = confirmText === "Delete";

  async function handleDelete() {
    if (!match) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/users/${user.usr_id}/deactivate`, {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Unable to delete the user.");
      }

      onDeleted?.(user.usr_id);
      setOpen(false);
      setConfirmText("");
    } catch (err: any) {
      setError(err.message || "Failed to delete the user.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setConfirmText(""); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
          Delete
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md [&>button:nth-of-type(1)]:hidden">
        <DialogHeader className="items-center space-y-3">

          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50">
            <Trash2 className="w-7 h-7 text-red-500" />
          </div>

          <DialogTitle className="text-lg font-semibold text-center">
            Delete User
          </DialogTitle>

          <DialogDescription className="text-center text-sm">
            You are about to delete the user&nbsp;
            <span className="font-semibold text-gray-900">{user.usr_name}</span>.
            This action is irreversible and the user will no longer be able to log in.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-sm text-center">
            To confirm the deletion, please type  
            <span className="font-semibold text-red-600"> "Delete" </span>
          </p>

          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder='Type "Delete" to confirm.'
          />
        </div>

        {error && <p className="text-xs text-red-500 mt-1 text-center">{error}</p>}

        <DialogFooter className="mt-4 flex justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="min-w-[100px]"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleDelete}
            disabled={!match || loading}
            className="min-w-[120px] bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}