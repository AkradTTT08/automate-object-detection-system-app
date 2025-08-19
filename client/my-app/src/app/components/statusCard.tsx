"use client";

import React from "react";
import { Bell, Video, Info, CheckCircle2, XCircle, AlertTriangle, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** เลือกชุดไอคอนที่ต้องการใช้: "fi" (flaticon) หรือ "lucide" */
const ICON_SET: "fi" | "lucide" = "lucide";

/* ---------------------------------- Types --------------------------------- */
interface StatusCardProps {
  id: number;
  title: string;
  value: string;
  totalValue?: string;
  subtitle?: string;
  textColorClass: string;
  /** ไอคอนที่เราสร้างให้แล้ว (มาจาก flaticon หรือ lucide ก็ได้) */
  IconComponent: React.ReactNode;
}

interface SummaryCardBase {
  id: number;
  title: string;
  value: string;
  totalValue?: string;
  subtitle?: string;
  textColorClass: string;
  fi: string;         // flaticon class
  lucide: LucideIcon; // lucide component
}

/* --------------------------- Shared Style (base) --------------------------- */
const cardBase =
  "bg-white w-full min-w-0 rounded-[10px] shadow-md border border-gray-100 " +
  "min-h-[120px] flex";

/* ------------------------------- StatusCard -------------------------------- */
const StatusCard: React.FC<StatusCardProps> = (props) => {
  const { id, title, value, totalValue, subtitle, IconComponent, textColorClass } = props;

  // กลุ่มการ์ดใน Alerts (1,3,5,7) กับ Cameras (2,4,6,8) — ใช้ layout เดียวกัน ปรับ padding นิดหน่อย
  const isAlerts = [1, 3, 5, 7].includes(id);
  const innerPad = isAlerts
    ? "px-[20px] sm:px-[24px] pt-[14px] pb-[15px]"
    : "px-[20px] sm:px-[24px] py-[20px] sm:py-[22px]";

  return (
    <div className={cardBase}>
      {/* จัดให้อยู่กึ่งกลางแนวตั้ง และชิดซ้าย */}
      <div className={`flex flex-1 flex-col justify-center items-start text-left ${innerPad}`}>
        {/* Title */}
        <h4 className="text-base font-medium text-[#000000]">{title}</h4>

        {/* Icon + Value (/total) */}
        <div className="mt-2 flex items-center gap-x-[10px]">
          <div className={`w-[30px] h-[30px] flex items-center justify-center ${textColorClass}`}>
            {IconComponent}
          </div>

          <div className="flex items-baseline gap-x-1">
            <span className={`text-[24px] font-medium pb-1 ${textColorClass}`}>{value}</span>

            {!!totalValue && (
              <>
                <span className="text-[16px] text-[#8C8686] font-medium pb-1">/</span>
                <span className="text-[12px] text-[#8C8686] font-medium pb-1">{totalValue}</span>
              </>
            )}
          </div>
        </div>

        {/* Subtitle (optional) */}
        {!!subtitle && (
          <p className={`mt-1 ${isAlerts ? "text-[10px] font-medium text-[#8C8686]" : "text-[12px] font-normal text-gray-500"}`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

/* -------------------------- Cards Data (fi + lucide) ----------------------- */
const summaryCardsBase: SummaryCardBase[] = [
  { id: 1, title: "Total Alerts", value: "12", subtitle: "Last 7 days",
    fi: "fi fi-br-bells", lucide: Bell, textColorClass: "text-[var(--color-primary)]" },
  { id: 2, title: "Total Cameras", value: "8",
    fi: "fi fi-br-video-camera-alt", lucide: Video, textColorClass: "text-[var(--color-primary)]" },
  { id: 3, title: "Active Alerts", value: "5", subtitle: "Require attention",
    fi: "fi fi-br-info", lucide: Info, textColorClass: "text-[var(--color-danger)]" },
  { id: 4, title: "Active Cameras", value: "7", totalValue: "8",
    fi: "fi fi-rr-check-circle", lucide: CheckCircle2, textColorClass: "text-[var(--color-success)]" },
  { id: 5, title: "Resolved Alerts", value: "5", subtitle: "Successfully handled",
    fi: "fi fi-br-check-circle", lucide: CheckCircle2, textColorClass: "text-[var(--color-success)]" },
  { id: 6, title: "Inactive Cameras", value: "1",
    fi: "fi fi-rr-cross-circle", lucide: XCircle, textColorClass: "text-[var(--color-danger)]" },
  { id: 7, title: "Critical Alerts", value: "3", subtitle: "High priority",
    fi: "fi fi-br-triangle-warning", lucide: AlertTriangle, textColorClass: "text-[var(--color-danger)]" },
  { id: 8, title: "Avg. Camera Health", value: "83 %",
    fi: "fi fi-br-circle-heart", lucide: Heart, textColorClass: "text-[var(--color-warning)]" },
];

/* -------- Map ให้กลายเป็นข้อมูลที่ StatusCard ใช้ได้ทันที (IconComponent) ------- */
export const summaryCards: StatusCardProps[] = summaryCardsBase.map((c) => ({
  id: c.id,
  title: c.title,
  value: c.value,
  totalValue: c.totalValue,
  subtitle: c.subtitle,
  textColorClass: c.textColorClass,
  IconComponent:
    ICON_SET === "lucide"
      ? React.createElement(c.lucide, { className: "h-[30px] w-[30px]" })
      : <i className={`${c.fi} text-[30px] leading-none`} />,
}));

/* ----------------------- Helpers + Exported Card Components ----------------- */
const findCardData = (id: number) => summaryCards.find((card) => card.id === id);

export const TotalAlertsCard = () => {
  const cardData = findCardData(1);
  return cardData ? <StatusCard {...cardData} /> : null;
};

export const TotalCamerasCard = () => {
  const cardData = findCardData(2);
  return cardData ? <StatusCard {...cardData} /> : null;
};

export const ActiveAlertsCard = () => {
  const cardData = findCardData(3);
  return cardData ? <StatusCard {...cardData} /> : null;
};

export const ActiveCamerasCard = () => {
  const cardData = findCardData(4);
  return cardData ? <StatusCard {...cardData} /> : null;
};

export const ResolvedAlertsCard = () => {
  const cardData = findCardData(5);
  return cardData ? <StatusCard {...cardData} /> : null;
};

export const InactiveCamerasCard = () => {
  const cardData = findCardData(6);
  return cardData ? <StatusCard {...cardData} /> : null;
};

export const CriticalAlertsCard = () => {
  const cardData = findCardData(7);
  return cardData ? <StatusCard {...cardData} /> : null;
};

export const AvgCameraHealthCard = () => {
  const cardData = findCardData(8);
  return cardData ? <StatusCard {...cardData} /> : null;
};