"use client";
import { useState } from "react";

import GeneratePDFReports from "@/components/forms/GeneratePDFReports";
import GenerateScheduleReports from "@/components/forms/GenerateScheduleReports";

export default function Reports() {
    const [open, setOpen] = useState(false);
    return (
        <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
                <h1 className="text-2xl font-bold">
                    Reports
                </h1>
            </div>
            <GenerateScheduleReports open={open} setOpen={setOpen} />
            <GeneratePDFReports open={open} setOpen={setOpen} />
        </div>
    );
}