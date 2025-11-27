"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function GenerateReportForm() {
  return (
     <Dialog open>
  <DialogContent className="!w-[880px] !max-w-none !p-8 h-[649px] rounded-xl overflow-hidden flex flex-col">

    {/* -------- Body -------- */}
    <div className="grid grid-cols-2 gap-8 mt-4 flex-1">

      {/* Left — Preview Box */}
      <div className="bg-gray-200 w-full h-full rounded-md" />

      {/* Right — Form */}
      <div className="space-y-4 overflow-hidden">
        
    {/* -------- Header Right-------- */}
    <DialogHeader className="pb-3">
      <DialogTitle className="text-[var(--color-primary)] text-lg font-medium">
        Document preview — General
      </DialogTitle>
    </DialogHeader>

        {/* Report Name */}
        <div className="grid gap-2">
          <Label htmlFor="report_name">Report Name</Label>
          <Input id="report_name" placeholder="Enter your report name" />
        </div>

        {/* Type + Date Range */}
        <div className="grid grid-cols-2 gap-4">

          {/* Type */}
          <div className="grid gap-2">
            <Label>Report Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="PDF" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="grid gap-2">
            <Label>Data Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" />
              <Input type="date" />
            </div>
          </div>

        </div>
      </div>
    </div>

    {/* -------- Footer -------- */}
    <div className="flex justify-end gap-3 mt-6 pt-4">

      <Button variant="outline">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
          />
        </svg>
        Download
      </Button>

      <Button variant="outline">Close</Button>
    </div>

  </DialogContent>
</Dialog>


  );
}
