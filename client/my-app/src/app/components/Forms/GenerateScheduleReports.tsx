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
import { Textarea } from "@/components/ui/textarea";

export default function GenerateScheduleReports() {
  return (
    <Dialog open>
      <DialogContent
        className="w-full max-w-[95vw] md:!w-[880px] !max-w-none !p-6 md:!p-8 h-auto rounded-xl 
       flex flex-col font-[var(--font-poppin)] max-h-[93vh] overflow-hidden md:overflow-visible overflow-y-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-6 md:gap-8 mt-4 flex-1">
          {/* Left — Preview Box */}
          <div className="bg-[var(--color-gray)] w-full h-[200px] md:h-full rounded-md" />

          {/* Right — Form */}
          <div className="space-y-4 overflow-auto pr-1">
            <DialogHeader className="pb-3">
              <DialogTitle className="text-[var(--color-primary)] text-lg font-medium">
                Schedule Reports
              </DialogTitle>
            </DialogHeader>

            {/* Report Name */}
            <div className="grid gap-2">
              <Label htmlFor="report_name">Report Name</Label>
              <Input id="report_name" placeholder="Enter your report name" />
            </div>

            {/* Template */}
            <div className="grid gap-2">
              <Label>Template</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="template1">กิจกรรมรายงาน</SelectItem>
                  <SelectItem value="template2">รายงานประสิทธิภาพ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Frequency + Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Frequency</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Daily" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>   

              

              <div className="grid gap-2">
                <Label>Time</Label>
                <Input type="time" defaultValue="08:30" />
              </div>
            </div>

            {/* Send to Email */}
            <div className="grid gap-2">
              <Label>Send to Email</Label>
              <Input type="email" placeholder="Enter email" />
            </div>

            {/* Report Type & Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Report Type</Label>
                <div className="rounded-md border px-2 py-1.5 text-sm">PDF</div>
              </div>

              <div className="grid gap-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-[1fr_16px_1fr] items-center gap-2 rounded-md border px-2 py-1.5">
                  <input
                    type="text"
                    onFocus={(e) => (e.currentTarget.type = "date")}
                    onBlur={(e) =>
                      !e.currentTarget.value && (e.currentTarget.type = "text")
                    }
                    className="w-full bg-transparent outline-none text-sm "
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
                    className="w-full bg-transparent outline-none text-sm  text-right md:text-left"
                    placeholder="End date"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="grid gap-2 min-h-0">
              <Label>Description</Label>
              <Textarea
                className="w-full h-[80px] min-h-0 resize-none overflow-y-auto"
                placeholder="Enter your description"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-2 pt-2">
          <Button> Create </Button>
          <Button variant="outline"> Close </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
