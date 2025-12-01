"use client";

import { useState } from "react";
import { Dispatch, SetStateAction } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
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
import { Textarea } from "@/components/ui/textarea";

type GenerateScheduleReportsProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export default function GenerateScheduleReports({
  open,
  setOpen,
}: GenerateScheduleReportsProps) {
  const handleCreate = () => {
    // TODO: call API / submit form
    setOpen(false);
  };

  const [submitting, setSubmitting] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {/* ปุ่มกดเปิด AlertDialog */}
      <AlertDialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          className="bg-[#0077FF] text-white hover:bg-[#0063d6] flex items-center gap-2"
        >
          {/* <PlusCircle className="w-5 h-5" /> */}
          Schedule Reports
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent
        className="w-full max-w-[95vw] md:!w-[880px] !max-w-none !p-6 md:!p-8 h-auto rounded-xl 
        flex flex-col font-[var(--font-poppin)] max-h-[93vh] overflow-hidden md:overflow-visible overflow-y-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-6 md:gap-8 mt-2 flex-1">
          {/* Left — Preview Box */}
          <div className="bg-[var(--color-gray)] w-full h-[200px] md:h-full rounded-md" />

          {/* Right — Form */}
          <div className="space-y-4 overflow-auto pr-1">
            <AlertDialogHeader className="pb-3">
              <AlertDialogTitle className="text-[var(--color-primary)] text-lg font-medium">
                Schedule Reports
              </AlertDialogTitle>

              <AlertDialogDescription className="text-sm text-muted-foreground">
                Set up report templates, schedules, and delivery details before generating your report.
              </AlertDialogDescription>
            </AlertDialogHeader>

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
                  <SelectItem value="overview">General Summary Report</SelectItem>
                  <SelectItem value="alerts">Alert Analysis Report</SelectItem>
                  <SelectItem value="performance">Performance Evaluation Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Frequency + Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Frequency" />
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
                <Select defaultValue="pdf">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
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
        <AlertDialogFooter className="flex justify-end gap-3 mt-2 pt-2">
          <AlertDialogCancel
              disabled={submitting}
              className="border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </AlertDialogCancel>

            <Button
              onClick={handleCreate}
              className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] px-4 py-2 rounded-md disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create"}
            </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}