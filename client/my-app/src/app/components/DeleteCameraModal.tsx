"use client";
import { useState, useEffect } from "react";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type Props = {
    camId: number;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function DeleteCameraModal({ camId, open, setOpen }: Props) {

    const [form, setForm] = useState({
        cam_name: "",
    });

    // โหลดข้อมูลกล้องเมื่อ modal เปิด
    useEffect(() => {
        if (open) {
            fetch(`/api/cameras/${camId}`)
                .then((res) => res.json())
                .then((data) => {
                    setForm({
                        cam_name: data.name,
                    })
                });
        }
    }, [open, camId]);

    async function handleDelete(e: React.MouseEvent) {
        console.log("clicked confirm delete:", camId);
        const res = await fetch(`/api/cameras/${camId}/soft-delete`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
        });
        console.log("response status:", res.status);

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            console.error("Delete failed:", data);
            return;
        }
        window.location.reload()
        setOpen(false);
    }


    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Camera#{camId}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete camera{" "}
                        <span className="font-semibold">{form.cam_name}</span>?
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button
                        className="bg-red-500 text-white hover:bg-red-600"
                        onClick={handleDelete}
                    >
                        Confirm Delete
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );





}