"use client";

import { useEffect, useRef, useState, memo } from "react";
import StreamPlayer from "./StreamPlayer";

type Props = {
  streamUrl: string;
  onError?: () => void;
  className?: string;
  /** ระยะห่างจาก viewport ก่อนจะเริ่มโหลด (px) */
  rootMargin?: string;
};

/**
 * Lazy-loaded StreamPlayer ที่จะโหลด stream เฉพาะเมื่อ component เข้าสู่ viewport
 * ช่วยลด resource usage เมื่อมีกล้องหลายตัวในหน้าเดียวกัน
 */
const LazyStreamPlayer = memo(function LazyStreamPlayer({ 
  streamUrl, 
  onError, 
  className = "",
  rootMargin = "100px" // โหลดล่วงหน้า 100px ก่อนเข้าสู่ viewport
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ใช้ Intersection Observer เพื่อตรวจสอบว่า component อยู่ใน viewport หรือไม่
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !shouldLoad) {
          // Delay เล็กน้อยเพื่อให้ browser มีเวลา render ก่อน
          setTimeout(() => {
            setShouldLoad(true);
          }, 100);
          // หยุด observe เมื่อโหลดแล้ว
          observer.disconnect();
        }
      },
      {
        rootMargin, // โหลดล่วงหน้าก่อนเข้าสู่ viewport
        threshold: 0.01, // เริ่มโหลดเมื่อเห็นแค่ 1%
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin]);

  return (
    <div ref={containerRef} className={className}>
      {shouldLoad ? (
        <StreamPlayer
          streamUrl={streamUrl}
          onError={onError}
          className={className}
        />
      ) : (
        // Placeholder ขณะรอโหลด
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-xs">Loading...</div>
        </div>
      )}
    </div>
  );
});

export default LazyStreamPlayer;

