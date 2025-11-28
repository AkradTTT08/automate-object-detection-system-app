"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export default function GenerateReportForm() {
  return (
    <Dialog open>
      <DialogContent className="w-full max-w-[95vw] md:!w-[880px] !max-w-none !p-6 md:!p-8 h-auto md:h-[649px] rounded-xl overflow-hidden flex flex-col font-[var(--font-poppin)]">
        {/* -------- Body -------- */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-6 md:gap-8 mt-4 flex-1">
          {/* Left — Preview Box */}
          <div className="bg-[var(--color-gray)] w-full h-[200px] md:h-full rounded-md" />

          {/* Right — Form */}
          <div className="space-y-4 overflow-auto pr-1">
            {/* -------- Header Right-------- */}
            <DialogHeader className="pb-3">
              <DialogTitle className="text-[var(--color-primary)] text-lg font-medium">
                Document preview — General
              </DialogTitle>
            </DialogHeader>

            {/* Report Name */}
            <div className="grid gap-2 ">
              <Label htmlFor="report_name">Report Name</Label>
              <Input
                id="report_name"
                placeholder="Enter your report name"
                className="border-[var(--color-gray)]"
              />
            </div>

            {/* Type + Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type */}
              <div className="grid gap-2 ">
                <Label>Report Type</Label>
                {/* <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="PDF" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select> */}
                <div className="rounded-md border border-[var(--color-gray)] px-2 py-1.5 text-sm">
                  PDF
                </div>
              </div>

              {/* Date */}
              <div className="grid gap-2">
                <Label>Date Range</Label>
                {/* <div className="grid grid-cols-2 gap-2">
                  <Input type="date" />
                  <Input type="date" />
                </div> */}
                <div className="w-full">
                  <div className="grid grid-cols-[1fr_16px_1fr] items-center gap-2 rounded-md border border-[var(--color-primary)] px-2 py-1.5">
                    {/* Start date */}
                    <input
                      type="text"
                      onFocus={(e) => (e.currentTarget.type = "date")}
                      onBlur={(e) => {
                        if (!e.currentTarget.value)
                          e.currentTarget.type = "text";
                      }}
                      className="w-full bg-transparent outline-none text-xs sm:text-sm"
                      placeholder="Start date"
                    />

                    <span className="text-[var(--color-primary)] text-sm md:text-center mr-3">
                      →
                    </span>

                    {/* End date */}
                    <input
                      type="text"
                      onFocus={(e) => (e.currentTarget.type = "date")}
                      onBlur={(e) => {
                        if (!e.currentTarget.value)
                          e.currentTarget.type = "text";
                      }}
                      className="w-full bg-transparent outline-none text-xs sm:text-sm text-right md:text-left"
                      placeholder="End date"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* -------- Footer -------- */}
        <div className="flex justify-end gap-3 mt-2 pt-2 ">
          <Button
            variant="outline"
            className="text-[var(--color-primary)] flex items-center"
          >
            <Download className="fi fi-br-download mr-2" />
            Download
          </Button>

          <Button variant="outline">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
