import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import type { Response } from "express";

export type StreamOptions = {
  /** บังคับเข้ารหัสใหม่ด้วย x264 (ถ้า false จะพยายาม copy เพื่อให้หน่วงต่ำ/กิน CPU น้อย) */
  forceEncode?: boolean;
  /** ความยาว GOP (เฟรม) เช่น 30 ที่ 30fps = 1 วินาทีต่อ IDR */
  gop?: number;
  /** เวลา timeout RTSP input (มิลลิวินาที) */
  stimeoutMs?: number;
};

export class FFmpegService {
  startStream(res: Response, rtspUrl: string, opts: StreamOptions = {}) {
    const {
      forceEncode = process.env.FORCE_ENCODE === "1",
      gop = Number(process.env.FF_GOP || 30),
      stimeoutMs = Number(process.env.FF_STIMEOUT_MS || 5000),
    } = opts;

    // เฮดเดอร์สำหรับ fMP4 ที่เล่นบนเบราว์เซอร์ได้ทันที
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
    res.socket?.setTimeout(0); // ไม่ให้ timeout เอง

    // บังคับ encode เพื่อให้แน่ใจว่า codec ถูกต้องและเล่นได้บนเบราว์เซอร์
    // ใช้ baseline profile และ level 3.0 เพื่อความเข้ากันได้สูงสุด
    const videoArgs = [
      "-c:v", "libx264",
      "-preset", "ultrafast",
      "-tune", "zerolatency",
      "-profile:v", "baseline",
      "-level", "3.0",
      "-pix_fmt", "yuv420p",
      "-b:v", "500k",
      "-maxrate", "500k",
      "-bufsize", "1000k",
    ];

    // ลอง TCP ก่อน ถ้าไม่ได้ผลจะลอง UDP
    const ffArgs = [
      "-rtsp_transport", "tcp",
      "-timeout", String(stimeoutMs * 1000000), // ffmpeg ใช้หน่วย "ไมโครวินาที" (microseconds)
      "-fflags", "nobuffer",
      "-flags", "low_delay",
      "-i", rtspUrl,
      "-g", String(gop),
      "-force_key_frames", "expr:gte(t,n_forced*1)", // บังคับ IDR ประมาณทุก 1s
      ...videoArgs,
      "-an", // ไม่มีเสียง
      "-f", "mp4",
      "-movflags", "frag_keyframe+empty_moov+default_base_moof",
      "-reset_timestamps", "1",
      "-avoid_negative_ts", "make_zero",
      "-loglevel", "error", // แสดงเฉพาะ errors เพื่อลด noise
      "pipe:1",
    ];

    console.log(`[ffmpeg] Starting FFmpeg with args: ${ffArgs.join(' ')}`);
    
    const ff = spawn("ffmpeg", ffArgs, { stdio: ["ignore", "pipe", "pipe"] });

    // ตรวจสอบว่า FFmpeg process เริ่มต้นได้หรือไม่
    ff.on("spawn", () => {
      console.log("[ffmpeg] Process spawned successfully");
    });

    ff.stdout.on("error", (err) => {
      console.error("[ffmpeg] stdout error:", err);
      if (!res.headersSent) {
        res.status(502).end("FFmpeg stdout error");
      }
    });

    let hasOutput = false;
    let outputStartTime = Date.now();
    
    // ตรวจสอบว่า stdout มีข้อมูลหรือไม่
    const checkOutputTimeout = setTimeout(() => {
      if (!hasOutput && Date.now() - outputStartTime > 10000) {
        console.error("[ffmpeg] No output received after 10 seconds");
        if (!res.headersSent) {
          res.status(502).json({ error: "FFmpeg stream timeout - no data received" });
        }
        kill("SIGKILL");
      }
    }, 10000);

    ff.stdout.on("data", (chunk) => {
      if (!hasOutput && chunk.length > 0) {
        hasOutput = true;
        clearTimeout(checkOutputTimeout);
        console.log(`[ffmpeg] First data received: ${chunk.length} bytes`);
      }
    });

    ff.stdout.pipe(res, { end: false });

    res.on("error", (err) => {
      console.error("[ffmpeg] Response error:", err);
      clearTimeout(checkOutputTimeout);
      kill("SIGKILL");
    });

    let stderrBuffer = '';
    let hasError = false;
    
    ff.stderr.on("data", (d) => {
      const msg = d.toString();
      stderrBuffer += msg;
      
      // Log errors และ warnings
      if (msg.includes("error") || msg.includes("Error") || msg.includes("failed") || 
          msg.includes("Connection refused") || msg.includes("timeout") || 
          msg.includes("Unable to open") || msg.includes("Connection timed out") ||
          msg.includes("No route to host") || msg.includes("Network is unreachable") ||
          msg.includes("Error opening input")) {
        console.error("[ffmpeg error]", msg.trim());
        hasError = true;
        
        // ถ้าเป็น critical error ให้ส่ง error response
        if ((msg.includes("Connection refused") || msg.includes("timeout") || 
             msg.includes("Unable to open") || msg.includes("Connection timed out") ||
             msg.includes("No route to host") || msg.includes("Network is unreachable") ||
             msg.includes("Error opening input")) && 
            !res.headersSent && !hasOutput) {
          let errorMsg = "RTSP connection failed";
          if (msg.includes("Connection refused")) {
            errorMsg = "RTSP connection refused - check camera IP and port";
          } else if (msg.includes("timeout") || msg.includes("Connection timed out")) {
            errorMsg = "RTSP connection timeout - check network connectivity";
          } else if (msg.includes("Unable to open") || msg.includes("Error opening input")) {
            errorMsg = "Unable to open RTSP stream - check URL and credentials";
          } else if (msg.includes("No route to host")) {
            errorMsg = "No route to host - check network configuration";
          } else if (msg.includes("Network is unreachable")) {
            errorMsg = "Network is unreachable - check network connectivity";
          }
          
          console.error(`[ffmpeg] Sending error response: ${errorMsg}`);
          res.status(502).json({ error: errorMsg });
          kill("SIGKILL");
        }
      } else if (msg.includes("warning") || msg.includes("Warning")) {
        console.warn("[ffmpeg warning]", msg.trim());
      } else {
        // Log info messages เฉพาะบางส่วน
        if (msg.includes("Stream #0") || msg.includes("Duration") || msg.includes("bitrate") || msg.includes("frame=") || msg.includes("Input #0")) {
          console.log("[ffmpeg info]", msg.trim());
        }
      }
    });

    const kill = (sig: NodeJS.Signals = "SIGINT") => {
      if (!ff.killed) ff.kill(sig);
    };

    res.on("close", () => {
      // client ปิด → ปิด ffmpeg ด้วย
      kill("SIGINT");
      setTimeout(() => kill("SIGKILL"), 2000);
    });

    ff.on("error", (err) => {
      console.error("spawn ffmpeg error:", err);
      if (!res.headersSent) res.status(502).end("ffmpeg failed to start");
      try { kill("SIGKILL"); } catch {}
    });

    ff.on("close", (code, signal) => {
      clearTimeout(checkOutputTimeout);
      console.log(`[ffmpeg] Process exited with code ${code}, signal ${signal}`);
      
      // ถ้า process exit โดยไม่มี output และมี error ให้ส่ง error response
      if ((code !== 0 && code !== null) || (hasError && !hasOutput)) {
        console.error(`[ffmpeg] FFmpeg exited with error code ${code}`);
        console.error(`[ffmpeg] Last stderr output:`, stderrBuffer.slice(-500)); // แสดง 500 ตัวอักษรสุดท้าย
        
        if (!res.headersSent) {
          let errorMsg = `FFmpeg process exited with code ${code || 'unknown'}`;
          if (stderrBuffer.includes("Connection refused")) {
            errorMsg = "Cannot connect to RTSP camera - connection refused";
          } else if (stderrBuffer.includes("timeout") || stderrBuffer.includes("Connection timed out")) {
            errorMsg = "RTSP connection timeout - check network connectivity";
          } else if (stderrBuffer.includes("Unable to open") || stderrBuffer.includes("Error opening input")) {
            errorMsg = "Unable to open RTSP stream - check URL and credentials";
          } else if (stderrBuffer.includes("No route to host")) {
            errorMsg = "No route to host - check network configuration";
          } else if (stderrBuffer.includes("Network is unreachable")) {
            errorMsg = "Network is unreachable - check network connectivity";
          } else if (!hasOutput) {
            errorMsg = "RTSP stream failed - no data received from camera";
          }
          
          console.error(`[ffmpeg] Sending error response: ${errorMsg}`);
          res.status(502).json({ error: errorMsg });
        } else if (!res.writableEnded) {
          res.end();
        }
      } else if (!res.writableEnded) {
        res.end();
      }
    });
  }
}

export const ffmpegService = new FFmpegService();