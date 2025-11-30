'use client';
import React from "react";

{/* TemplateTab Component */ }
export default function TemplateTab({ onPreview, }: { onPreview?: (id: string) => void; }) {
  const templates = [
    { id: 'g', title: 'รายงานทั่วไป', subtitle: 'สรุปกิจกรรมและเหตุการณ์', color: 'b' },
    { id: 'a', title: 'รายงานการแจ้งเตือน', subtitle: 'ลายละเอียดการแจ้งเตือนเหตุการณ์และการจัดกิจกรรม', color: 'r' },
    { id: 'p', title: 'รายงานประสิทธิภาพ', subtitle: 'รายงานประสิทธิภาพของระบบ', color: 'p' },
  ];

  { /* Define color */ }
  const colorClasses: Record<string, { bg: string }> = {
    b: { bg: 'bg-blue-500' },
    r: { bg: 'bg-red-500' },
    p: { bg: 'bg-purple-500' },
  };

  {/* Icons map */ }
  const icons: Record<string, React.ReactNode> = {
    g: (
      <img src="https://cdn-icons-png.flaticon.com/128/1508/1508964.png" alt="Calendar Icon" className="mt-1 ml-0.5 h-6 w-6 filter brightness-0 invert" />
    ),
    a: (
      <img src="https://cdn-icons-png.flaticon.com/128/9307/9307174.png" alt="Calendar Icon" className="mt-0.5 ml-1 h-7 w-7 filter brightness-0 invert" />
    ),
    p: (
      <img src="https://cdn-icons-png.flaticon.com/128/16747/16747475.png" alt="Calendar Icon" className="mt-1 h-8 w-8 filter brightness-0 invert" />
    ),
  };

  {/* TemplateTab component */ }
  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-full text-sm text-slate-500 flex items-center justify-between">
          <div className="text-[var(--color-primary,_#0B63FF)] font-medium text-lg">Templates</div>
          <button className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary,_#0B63FF)] text-white px-4 py-1 text-sm font-medium hover:cursor-pointer  group transition">
            <img src="https://cdn-icons-png.flaticon.com/128/5251/5251753.png" alt="Calendar Icon" className="mt-1 h-4 w-4 filter brightness-0 invert " />
            Schedule Reports
          </button>
        </div>
        <hr className="col-span-full border-t pt-2 border-blue-500" />

        {/* Selection */}
        {templates.map((t) => {
          const cls = colorClasses[t.color] ?? colorClasses.blue;
          return (
            <div key={t.id} className="rounded-lg border p-6 text-center bg-white shadow-sm">
              <div className={`mb-4 inline-flex items-center justify-center h-14 w-14 rounded-full ${cls.bg} mx-auto`}>
                {icons[t.id]}
              </div>

              {/* Selection title */}
              <h3 className="text-base font-semibold">{t.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{t.subtitle}</p>

              <div className="mt-20">

                {/*  Preview button */}
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1 text-sm text-[var(--color-primary,_#0B63FF)] mx-auto hover:bg-[var(--color-primary,_#0B63FF)] hover:text-white transition hover:cursor-pointer mr-2"
                >
                  <img src="https://cdn-icons-png.flaticon.com/128/11502/11502607.png" alt="Preview Icon" className="relative top-0.5 h-4 w-4 transition" />
                  Preview
                </button>

                {/* Download button */}
                <button
                  className="relative -top-1 inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1 text-sm text-[var(--color-primary,_#0B63FF)] mx-auto hover:bg-[var(--color-primary,_#0B63FF)] hover:text-white transition hover:cursor-pointer ml-2"
                >
                  <img src="https://cdn-icons-png.flaticon.com/128/7268/7268609.png" alt="Preview Icon" className="relative top-0.2 h-3 w-3 transition" />              
                  Download
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}