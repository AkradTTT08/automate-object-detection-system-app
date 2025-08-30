import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { Response } from "express";

export class FFmpegService {
  private ffmpegProcess: ChildProcessWithoutNullStreams | null = null;

  // กล้องตัวเดียว → ชี้ไปที่ stream จำลอง
  private rtspUrl: string = "rtsp://rtsp-server:8554/city-traffic";

  public startStream(res: Response) {
    res.setHeader("Content-Type", "multipart/x-mixed-replace; boundary=frame");

    this.ffmpegProcess = spawn("ffmpeg", [
      "-i", this.rtspUrl,
      "-f", "mjpeg",
      "-q:v", "5",
      "pipe:1"
    ]);

    this.ffmpegProcess.stdout.on("data", (chunk) => {
      res.write(`--frame\r\nContent-Type: image/jpeg\r\n\r\n`);
      res.write(chunk);
    });

    this.ffmpegProcess.stderr.on("data", (err) => {
      console.error("[FFmpeg]", err.toString());
    });

    this.ffmpegProcess.on("close", () => {
      console.log("FFmpeg closed");
      res.end();
    });
  }
}

export const ffmpegService = new FFmpegService();
