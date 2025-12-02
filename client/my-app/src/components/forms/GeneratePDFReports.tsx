"use client";

import { useState } from "react";
import { Dispatch, SetStateAction } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";

type GenerateReportFormProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export default function GenerateReportForm({
  open,
  setOpen,
}: GenerateReportFormProps) {

  const [submitting, setSubmitting] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {/* ========= Trigger button ========= */}
      <AlertDialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          className="bg-[#0077FF] text-white hover:bg-[#0063d6] flex items-center gap-2"
        >
          {/* <PlusCircle className="w-5 h-5" /> */}
          Generate Report
        </Button>
      </AlertDialogTrigger>

      {/* ========= Modal ========= */}
      <AlertDialogContent
        className="w-full max-w-[95vw] md:!w-[880px] !max-w-none !p-6 md:!p-8 
        h-auto md:h-[649px] rounded-xl overflow-hidden flex flex-col 
        font-[var(--font-poppin)]"
      >
        {/* -------- Body -------- */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-6 md:gap-8 mt-4 flex-1">
          {/* Left — Preview Box */}
          <div className="bg-[var(--color-gray)] w-full h-[200px] md:h-full rounded-md" />

          {/* Right — Form */}
          <div className="space-y-4 overflow-auto pr-1">
            {/* -------- Header Right-------- */}
            <AlertDialogHeader className="pb-3">
              <AlertDialogTitle className="text-[var(--color-primary)] text-lg font-medium">
                Document preview — General
              </AlertDialogTitle>

              <AlertDialogDescription className="text-sm text-muted-foreground">
                Configure report details and export your document based on the
                selected date range.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* Report Name */}
            <div className="grid gap-2 ">
              <Label htmlFor="report_name">Report Name</Label>
              <Input
                id="report_name"
                placeholder="Enter your report name"
              />
            </div>

            {/* Type + Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Type */}
              <div className="grid gap-2">
                <Label>Report Type</Label>
                <Select defaultValue="pdf">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="grid gap-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-[1fr_16px_1fr] items-center gap-2 rounded-md border px-2 py-1.5">
                  <input
                    type="text"
                    onFocus={(e) => (e.currentTarget.type = "date")}
                    onBlur={(e) =>
                      !e.currentTarget.value && (e.currentTarget.type = "text")
                    }
                    className="w-full bg-transparent outline-none text-sm"
                    placeholder="Start date"
                  />
                  <span className="text-[var(--color-primary)] text-sm text-center">
                    →
                  </span>
                  <input
                    type="text"
                    onFocus={(e) => (e.currentTarget.type = "date")}
                    onBlur={(e) =>
                      !e.currentTarget.value && (e.currentTarget.type = "text")
                    }
                    className="w-full bg-transparent outline-none text-sm text-right md:text-left"
                    placeholder="End date"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* -------- Footer -------- */}
        <div className="flex justify-end gap-3 mt-2 pt-2">
          <AlertDialogCancel
            disabled={submitting}
            className="border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </AlertDialogCancel>

          <Button
            className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] px-4 py-2 rounded-md disabled:opacity-50"
          >
            <Download size={16} />
            Download
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}