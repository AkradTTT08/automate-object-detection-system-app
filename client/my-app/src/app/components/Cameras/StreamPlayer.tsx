"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

type Props = {
  streamUrl: string;
  onError?: () => void;
  className?: string;
};

/**
 * Component สำหรับเล่น HLS stream จาก FFmpeg
 * ใช้ HLS.js เพื่อเล่น HLS stream (.m3u8) ในเบราว์เซอร์
 */
export default function StreamPlayer({ streamUrl, onError, className = "" }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // ตรวจสอบว่า HLS.js รองรับหรือไม่
    if (!Hls.isSupported()) {
      console.error("[StreamPlayer] HLS.js is not supported");
      setError(true);
      setErrorMessage("HLS.js is not supported in this browser");
      onError?.();
      return;
    }

    // แปลง stream URL เป็น HLS URL
    // ถ้า streamUrl เป็น /api/cameras/:id/stream ให้เปลี่ยนเป็น /api/cameras/:id/hls/stream.m3u8
    const hlsUrl = streamUrl.replace(/\/stream(\?.*)?$/, "/hls/stream.m3u8");

    console.log(`[StreamPlayer] Loading HLS stream: ${hlsUrl}`);

    // สร้าง HLS instance - ปรับแต่งสำหรับ live streaming
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false, // ปิด low latency mode เพื่อลด buffer errors
      backBufferLength: 30, // ลด back buffer
      maxBufferLength: 10, // ลด max buffer เพื่อลด latency และ buffer stalls
      maxMaxBufferLength: 20, // จำกัด buffer สูงสุด
      maxBufferSize: 30 * 1000 * 1000, // 30MB - ลด buffer size
      maxBufferHole: 0.5,
      highBufferWatchdogPeriod: 2,
      nudgeOffset: 0.1,
      nudgeMaxRetry: 5, // เพิ่ม retry สำหรับ buffer recovery
      maxFragLoadingTimeOut: 10000, // ลด timeout
      startFragPrefetch: false, // ปิด prefetch เพื่อลด buffer issues
      testBandwidth: false, // ปิด bandwidth test เพื่อลด network overhead
      progressive: false,
      debug: false,
      // เพิ่ม configuration สำหรับ buffer management
      abrEwmaDefaultEstimate: 500000, // 500kbps default
      abrBandWidthFactor: 0.95,
      abrBandWidthUpFactor: 0.7,
      maxStarvationDelay: 4,
      maxLoadingDelay: 4,
      minAutoBitrate: 0,
    });

    hlsRef.current = hls;

    // Event handlers
    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      console.log("[StreamPlayer] Media attached");
      hls.loadSource(hlsUrl);
    });

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      console.log("[StreamPlayer] Manifest parsed, starting playback");
      // รอให้ video element พร้อมก่อน play
      const tryPlay = () => {
        if (video.readyState >= 2) {
          video.play().catch((e) => {
            console.error("[StreamPlayer] Play error:", e);
          });
        } else {
          // รอให้ video element พร้อม
          video.addEventListener('loadeddata', () => {
            video.play().catch((e) => {
              console.error("[StreamPlayer] Play error:", e);
            });
          }, { once: true });
        }
      };
      
      tryPlay();
    });
    
    // เพิ่ม event listener สำหรับ buffer management
    hls.on(Hls.Events.BUFFER_APPENDING, () => {
      // Clear error เมื่อ buffer กำลัง append
      if (error) {
        setError(false);
        setErrorMessage(null);
      }
    });
    
    hls.on(Hls.Events.BUFFER_APPENDED, () => {
      // Clear error เมื่อ buffer append สำเร็จ
      if (error) {
        setError(false);
        setErrorMessage(null);
      }
    });

    hls.on(Hls.Events.ERROR, (event: any, data: any) => {
      // กรอง non-fatal errors ที่ไม่สำคัญ
      const isBufferStallError = data?.details === 'bufferStalledError' || data?.details === Hls.ErrorDetails?.BUFFER_STALLED_ERROR;
      const isBufferSeekOverError = data?.details === 'bufferSeekOver' || data?.details === Hls.ErrorDetails?.BUFFER_SEEK_OVER;
      const isLevelLoadError = data?.details === 'levelLoadError' || data?.details === Hls.ErrorDetails?.LEVEL_LOAD_ERROR;
      const isServerError = data?.response?.code === 500 || data?.response?.code === 503;
      
      // กรอง levelLoadError ที่เกิดจาก server error (500/503) - ไม่ต้อง log ซ้ำๆ
      const shouldIgnore = !data?.fatal && (
        isBufferStallError || 
        isBufferSeekOverError || 
        (isLevelLoadError && isServerError)
      );
      
      // Log เฉพาะ fatal errors หรือ errors ที่สำคัญ (ไม่ใช่ errors ที่ ignore)
      if (!shouldIgnore) {
        const errorDetails = {
          type: data?.type,
          details: data?.details,
          fatal: data?.fatal,
          url: data?.url,
          code: data?.code,
          message: data?.message,
          response: data?.response,
        };
        
        if (data?.fatal) {
          console.error("[StreamPlayer] Fatal HLS error:", errorDetails);
        } else if (isLevelLoadError && isServerError) {
          // Log เฉพาะครั้งแรกเมื่อเกิด server error
          console.warn("[StreamPlayer] Server error (500/503) - HLS stream may not be ready yet");
        } else {
          // Log เฉพาะ non-fatal errors ที่สำคัญ
          console.warn("[StreamPlayer] Non-fatal HLS error:", errorDetails);
        }
      }
      
      if (data?.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // ถ้าเป็น server error (500/503) อาจเป็นเพราะ stream ยังไม่พร้อม
            const isServerError = data?.response?.code === 500 || data?.response?.code === 503;
            const isLevelLoadError = data?.details === 'levelLoadError' || data?.details === Hls.ErrorDetails?.LEVEL_LOAD_ERROR;
            
            if (isLevelLoadError && isServerError) {
              // Server error - รอสักครู่แล้ว retry (stream อาจยังไม่พร้อม)
              console.warn(`[StreamPlayer] Server error (${data?.response?.code}) - retrying in 3 seconds...`);
              setTimeout(() => {
                if (hlsRef.current) {
                  try {
                    if (!hlsRef.current.media) {
                      hlsRef.current.loadSource(hlsUrl);
                    } else {
                      hlsRef.current.startLoad();
                    }
                  } catch (err) {
                    console.error("[StreamPlayer] Retry failed:", err);
                  }
                }
              }, 3000);
            } else {
              // Network error อื่นๆ
              console.error("[StreamPlayer] Network error, trying to recover");
              setErrorMessage(`Network error: ${data?.details || data?.response?.code || 'Unknown'}`);
              // Retry loading after delay
              setTimeout(() => {
                if (hlsRef.current) {
                  try {
                    if (!hlsRef.current.media) {
                      console.log("[StreamPlayer] Retrying: loading source");
                      hlsRef.current.loadSource(hlsUrl);
                    } else {
                      console.log("[StreamPlayer] Retrying: starting load");
                      hlsRef.current.startLoad();
                    }
                  } catch (err) {
                    console.error("[StreamPlayer] Retry failed:", err);
                  }
                }
              }, 2000);
            }
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error("[StreamPlayer] Media error, trying to recover");
            setErrorMessage(`Media error: ${data?.details || 'Unknown'}`);
            try {
              // ลอง recover media error
              if (data.details === 'bufferAppendError' || data.details === Hls.ErrorDetails?.BUFFER_APPEND_ERROR) {
                // ถ้าเป็น buffer append error ให้ reload
                hls.startLoad();
              } else {
                hls.recoverMediaError();
              }
            } catch (err) {
              console.error("[StreamPlayer] Media error recovery failed:", err);
              // ถ้า recover ไม่ได้ ให้ลอง reload
              try {
                hls.startLoad();
              } catch (reloadErr) {
                console.error("[StreamPlayer] Reload failed:", reloadErr);
              }
            }
            break;
          default:
            console.error("[StreamPlayer] Fatal error, cannot recover:", data?.type);
            setError(true);
            setErrorMessage(`Fatal error: ${data?.type || 'Unknown'} - ${data?.details || ''}`);
            try {
              hls.destroy();
            } catch (err) {
              console.error("[StreamPlayer] Destroy failed:", err);
            }
            onError?.();
            break;
        }
      } else {
        // จัดการ non-fatal errors ที่สำคัญ
        if (isBufferStallError) {
          // bufferStalledError - ลอง recover โดยไม่ต้อง log
          try {
            const video = videoRef.current;
            if (video && video.readyState >= 2) {
              // ถ้า video มีข้อมูลแล้ว ให้ลอง play
              video.play().catch(() => {
                // ถ้า play ไม่ได้ ให้ startLoad
                if (hlsRef.current) {
                  hlsRef.current.startLoad();
                }
              });
            } else {
              // ถ้ายังไม่มีข้อมูล ให้ startLoad
              if (hlsRef.current) {
                hlsRef.current.startLoad();
              }
            }
          } catch (err) {
            // Silent fail สำหรับ buffer stall recovery
          }
        } else if (isLevelLoadError && isServerError) {
          // levelLoadError จาก server error (500/503) - ไม่ต้องทำอะไร เพราะ HLS.js จะ retry อัตโนมัติ
          // แต่ถ้า retry หลายครั้งแล้วยังไม่ได้ อาจต้อง reload
          // (HLS.js จะจัดการ retry เอง)
        }
      }
    });

    hls.on(Hls.Events.FRAG_LOADED, () => {
      // Clear error เมื่อได้รับข้อมูล
      if (error) {
        setError(false);
        setErrorMessage(null);
      }
    });

    hls.on(Hls.Events.FRAG_LOADING, () => {
      // Clear error เมื่อเริ่มโหลด fragment
      if (error) {
        setError(false);
        setErrorMessage(null);
      }
    });

    hls.on(Hls.Events.FRAG_PARSING_DATA, () => {
      // Clear error เมื่อเริ่ม parse fragment
      if (error) {
        setError(false);
        setErrorMessage(null);
      }
    });

    // Attach media
    hls.attachMedia(video);

    // Cleanup
    return () => {
      if (hlsRef.current) {
        console.log("[StreamPlayer] Cleaning up HLS instance");
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, onError, error]);

  // Video element error handler
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleError = (e: Event) => {
      const videoError = video.error;
      if (videoError) {
        let errorMsg = "Unknown error";
        switch (videoError.code) {
          case videoError.MEDIA_ERR_ABORTED:
            errorMsg = "Video playback aborted";
            break;
          case videoError.MEDIA_ERR_NETWORK:
            errorMsg = "Network error";
            break;
          case videoError.MEDIA_ERR_DECODE:
            errorMsg = "Decode error";
            break;
          case videoError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMsg = "Source not supported";
            break;
        }
        console.error("[StreamPlayer] Video element error:", errorMsg);
        setErrorMessage(errorMsg);
      }
    };

    video.addEventListener("error", handleError);
    return () => {
      video.removeEventListener("error", handleError);
    };
  }, []);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center text-gray-500">
          <p className="text-sm">Stream Error</p>
          {errorMessage && <p className="text-xs mt-1">{errorMessage}</p>}
          <p className="text-xs mt-1">Unable to load video stream</p>
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className={className}
      style={{ objectFit: "cover" }}
    />
  );
}
