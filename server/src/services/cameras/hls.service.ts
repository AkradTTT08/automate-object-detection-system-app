import { spawn, ChildProcess } from "child_process";
import * as fs from "fs";
import * as path from "path";

export type HlsOptions = {
  /** ความยาว GOP (เฟรม) เช่น 30 ที่ 30fps = 1 วินาทีต่อ IDR */
  gop?: number;
  /** เวลา timeout RTSP input (มิลลิวินาที) */
  stimeoutMs?: number;
  /** ความยาวของแต่ละ segment (วินาที) */
  hlsTime?: number;
  /** จำนวน segments ที่เก็บไว้ */
  hlsListSize?: number;
};

export class HlsService {
  private streams: Map<number, ChildProcess> = new Map();
  private hlsDir: string;

  constructor() {
    // สร้าง directory สำหรับเก็บ HLS files
    this.hlsDir = path.join(process.cwd(), "hls");
    if (!fs.existsSync(this.hlsDir)) {
      fs.mkdirSync(this.hlsDir, { recursive: true });
    }
  }

  /**
   * เริ่มต้น HLS stream สำหรับ camera
   * @param cameraId Camera ID
   * @param rtspUrl RTSP URL ของ camera
   * @param opts Options สำหรับ HLS streaming
   */
  startHlsStream(cameraId: number, rtspUrl: string, opts: HlsOptions = {}) {
    const {
      gop = Number(process.env.FF_GOP || 30),
      stimeoutMs = Number(process.env.FF_STIMEOUT_MS || 5000),
      hlsTime = 2, // 2 seconds per segment
      hlsListSize = 5, // Keep 5 segments
    } = opts;

    // หยุด stream เดิมถ้ามี
    this.stopHlsStream(cameraId);

    const hlsPath = path.join(this.hlsDir, `camera_${cameraId}`);
    const m3u8Path = path.join(hlsPath, "stream.m3u8");

    // สร้าง directory สำหรับ camera นี้
    if (!fs.existsSync(hlsPath)) {
      fs.mkdirSync(hlsPath, { recursive: true });
    }

    // Video encoding options
    const videoArgs = [
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-tune", "zerolatency",
      "-profile:v", "baseline",
      "-level", "3.0",
      "-pix_fmt", "yuv420p",
      "-b:v", "1000k",
      "-maxrate", "1000k",
      "-bufsize", "2000k",
      "-g", String(gop),
      "-force_key_frames", "expr:gte(t,n_forced*1)",
    ];

    // FFmpeg arguments สำหรับ HLS
    const ffArgs = [
      "-rtsp_transport", "tcp",
      "-timeout", String(stimeoutMs * 1000000), // microseconds
      "-fflags", "nobuffer",
      "-flags", "low_delay",
      "-i", rtspUrl,
      ...videoArgs,
      "-an", // ไม่มีเสียง
      "-f", "hls",
      "-hls_time", String(hlsTime),
      "-hls_list_size", String(hlsListSize),
      "-hls_flags", "delete_segments+program_date_time",
      "-hls_segment_filename", path.join(hlsPath, "segment_%03d.ts"),
      "-hls_segment_type", "mpegts",
      m3u8Path,
    ];

    console.log(`[HLS] Starting HLS stream for camera ${cameraId}`);
    console.log(`[HLS] Output path: ${m3u8Path}`);

    const ff = spawn("ffmpeg", ffArgs, { stdio: ["ignore", "pipe", "pipe"] });

    this.streams.set(cameraId, ff);

    ff.on("spawn", () => {
      console.log(`[HLS] FFmpeg process spawned for camera ${cameraId}`);
    });

    ff.stderr.on("data", (d) => {
      const msg = d.toString();
      if (msg.includes("error") || msg.includes("Error") || msg.includes("failed")) {
        console.error(`[HLS] Camera ${cameraId} error:`, msg.trim());
      } else if (msg.includes("Stream #0") || msg.includes("frame=")) {
        console.log(`[HLS] Camera ${cameraId}:`, msg.trim());
      }
    });

    ff.on("error", (err) => {
      console.error(`[HLS] FFmpeg spawn error for camera ${cameraId}:`, err);
      this.streams.delete(cameraId);
      // ลบ directory ถ้าเกิด error
      const hlsPath = path.join(this.hlsDir, `camera_${cameraId}`);
      if (fs.existsSync(hlsPath)) {
        try {
          fs.rmSync(hlsPath, { recursive: true, force: true });
        } catch (rmErr) {
          console.error(`[HLS] Error cleaning up directory for camera ${cameraId}:`, rmErr);
        }
      }
    });

    ff.on("close", (code) => {
      if (code !== 0 && code !== null) {
        console.error(`[HLS] FFmpeg process exited for camera ${cameraId} with error code ${code}`);
      } else {
        console.log(`[HLS] FFmpeg process exited for camera ${cameraId} with code ${code}`);
      }
      this.streams.delete(cameraId);
    });

    return m3u8Path;
  }

  /**
   * หยุด HLS stream สำหรับ camera
   */
  stopHlsStream(cameraId: number) {
    const ff = this.streams.get(cameraId);
    if (ff && !ff.killed) {
      console.log(`[HLS] Stopping stream for camera ${cameraId}`);
      ff.kill("SIGINT");
      setTimeout(() => {
        if (!ff.killed) ff.kill("SIGKILL");
      }, 2000);
      this.streams.delete(cameraId);
    }

    // ลบ HLS files
    const hlsPath = path.join(this.hlsDir, `camera_${cameraId}`);
    if (fs.existsSync(hlsPath)) {
      try {
        fs.rmSync(hlsPath, { recursive: true, force: true });
        console.log(`[HLS] Deleted HLS files for camera ${cameraId}`);
      } catch (err) {
        console.error(`[HLS] Error deleting HLS files for camera ${cameraId}:`, err);
      }
    }
  }

  /**
   * ตรวจสอบว่า stream กำลังทำงานอยู่หรือไม่
   */
  isStreaming(cameraId: number): boolean {
    const ff = this.streams.get(cameraId);
    if (!ff) return false;
    
    // ตรวจสอบว่า process ยังทำงานอยู่
    if (ff.killed) {
      this.streams.delete(cameraId);
      return false;
    }
    
    // ตรวจสอบว่า process ยังมีอยู่ (ใช้ signal 0)
    if (ff.pid) {
      try {
        // signal 0 ไม่ kill process แต่จะ throw error ถ้า process ไม่มีอยู่
        process.kill(ff.pid, 0);
        return true;
      } catch (err: any) {
        // ESRCH = process ไม่มีอยู่แล้ว
        if (err?.code === 'ESRCH') {
          this.streams.delete(cameraId);
          return false;
        }
        // error อื่นๆ ให้ถือว่ายังทำงานอยู่
        return true;
      }
    }
    
    // ถ้าไม่มี pid ให้ตรวจสอบ killed flag เท่านั้น
    return !ff.killed;
  }

  /**
   * Get path to m3u8 file
   */
  getM3u8Path(cameraId: number): string {
    return path.join(this.hlsDir, `camera_${cameraId}`, "stream.m3u8");
  }

  /**
   * Get path to segment file
   */
  getSegmentPath(cameraId: number, segmentName: string): string {
    return path.join(this.hlsDir, `camera_${cameraId}`, segmentName);
  }
}

export const hlsService = new HlsService();

