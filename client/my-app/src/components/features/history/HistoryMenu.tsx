/**
 * Component: HistoryMenu
 * Path: /app/history/page.tsx
 *
 * Purpose:
 *  เมนูแท็บสำหรับสลับมุมมองประวัติการทำงาน (Logs)
 *  ระหว่าง Camera Logs, Alert Logs และ User Activity
 *
 * Responsibilities:
 *  - แสดงแท็บสำหรับเลือกประเภทประวัติ (History type)
 *  - สลับการแสดงผลระหว่าง CameraLogs, AlertLogs, UserLogs
 *  - รองรับการเลื่อนแนวนอนบนจอเล็ก (mobile-friendly tabs)
 *
 * Tabs:
 *  - Camera Logs   → ประวัติกิจกรรมที่เกี่ยวข้องกับกล้อง
 *  - Alert Logs    → ประวัติการแจ้งเตือน
 *  - User Activity → ประวัติกิจกรรมของผู้ใช้งาน
 *
 * UI Behavior:
 *  - แสดงเส้น underline ที่แท็บที่ถูกเลือก
 *  - ใช้ snap scrolling บน mobile เพื่อเลื่อนแท็บได้สะดวก
 *
 * Dependencies:
 *  - shadcn/ui → Tabs, TabsList, TabsTrigger, TabsContent
 *  - CameraLogs, AlertLogs, UserLogs → child components
 *
 * Notes:
 *  - ค่า default ของแท็บตั้งไว้ที่ "camera"
 *
 * Author: Wanasart
 * Created: 2025-12-02
 * Updated: 2025-12-02
 */
"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import CameraLogs from "./CameraLogs";
import AlertLogs from "./AlertLogs";
import UserLogs from "./UserLogs";

/* ============================== CONSTS ==================================== */

const HISTORY_TABS: { id: "camera" | "alert" | "user"; label: string }[] = [
  { id: "camera", label: "Camera Logs" },
  { id: "alert", label: "Alert Logs" },
  { id: "user", label: "User Activity" },
];

/* ============================== COMPONENT ================================= */

export default function HistoryMenu() {
  return (
    <div className="w-full">
      {/* ---------- Tabs ---------- */}
      <Tabs defaultValue="camera" className="mt-4 w-full">
        <div className="scroll-gutter overflow-x-auto snap-x snap-mandatory scrollbar-hide ios-smooth">
          <div className="relative -mx-5 w-full border-b border-gray-200 px-5">
            <TabsList className="inline-flex w-auto flex-nowrap whitespace-nowrap bg-transparent p-0 text-base">
              {HISTORY_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="
                    relative mr-6 h-9 flex-shrink-0 snap-start
                    rounded-none bg-transparent px-0 font-medium
                    text-gray-500
                    transition-all
                    data-[state=active]:text-[var(--color-primary)]
                    after:absolute after:left-0 after:-bottom-[1px]
                    after:h-[2px] after:w-0 after:bg-[var(--color-primary)]
                    data-[state=active]:after:w-full
                  "
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        <TabsContent value="camera" className="py-2 text-sm text-gray-600">
          <CameraLogs />
        </TabsContent>

        <TabsContent value="alert" className="py-2 text-sm text-gray-600">
          <AlertLogs />
        </TabsContent>

        <TabsContent value="user" className="py-2 text-sm text-gray-600">
          <UserLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
}