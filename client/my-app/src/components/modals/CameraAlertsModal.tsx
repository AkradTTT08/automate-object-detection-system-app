"use client";

import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AlertMiniTable from "../features/dashboard/AlertMiniTable";

interface NotificationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cameraName: string | null;
}

export default function CameraAlertsModal({
    open,
    onOpenChange,
    cameraName
}: NotificationModalProps) {
    const router = useRouter();

    const handleGoToAlerts = () => {
        router.push("/alerts");
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-[var(--color-primary)]">
                        Alerts: {cameraName}
                    </AlertDialogTitle>

                    {/* ตาราง AlertMiniTable */}
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6 mt-4">
                        <AlertMiniTable
                            cameraName={cameraName}
                        />
                    </div>

                </AlertDialogHeader>

                <AlertDialogFooter className="justify-between">
                    <AlertDialogAction onClick={handleGoToAlerts}>
                        Go to alerts
                    </AlertDialogAction>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
