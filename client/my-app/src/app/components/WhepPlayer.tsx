"use client";
import { useEffect, useRef } from "react";

function parseBasicAuth(rtsp: string): string | undefined {
  const m = rtsp.match(/^rtsp:\/\/([^:@]+):([^@]+)@/i);
  return m ? "Basic " + btoa(`${decodeURIComponent(m[1])}:${decodeURIComponent(m[2])}`) : undefined;
}

type Props = {
  camAddressRtsp: string;                 // rtsp://user:pass@host:port/city-traffic
  webrtcBase?: string;                    // http://localhost:8889
  onFailure?: () => void;                 // เรียกเมื่อหมดหนทางจริง ๆ เท่านั้น
  maxRetries?: number;                    // จำนวนครั้งที่ลองเชื่อมใหม่
  disconnectGraceMs?: number;             // รอ "disconnected" ฟื้นก่อนถือว่าหลุดจริง
};

export default function WhepPlayer({
  camAddressRtsp,
  webrtcBase = "http://localhost:8889",
  onFailure,
  maxRetries = 2,
  disconnectGraceMs = 5000,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const abortedRef = useRef(false);
  const sessionIdRef = useRef(0);
  const retriesRef = useRef(0);

  const connect = async (sid: number): Promise<boolean> => {
    try {
      const m = camAddressRtsp.match(/^rtsp:\/\/(?:[^@]*@)?[^/]+\/(.+)$/i);
      const path = m?.[1];
      if (!path) return false;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      const transceiver = pc.addTransceiver("video", { direction: "recvonly" });

      // ให้ H.264 มี priority
      try {
        const caps = RTCRtpReceiver.getCapabilities("video");
        const h264First =
          (caps?.codecs ?? [])
            .filter((c) => /H264/i.test(c.mimeType))
            .concat((caps?.codecs ?? []).filter((c) => !/H264/i.test(c.mimeType)));
        // @ts-ignore
        transceiver.setCodecPreferences?.(h264First);
      } catch { }

      const ms = new MediaStream();
      pc.ontrack = (ev) => {
        if (sid !== sessionIdRef.current) return;
        ms.addTrack(ev.track);
        if (videoRef.current) {
          videoRef.current.srcObject = ms;
          videoRef.current.play().catch(() => {});
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (sid !== sessionIdRef.current) return;
        const s = pc.iceConnectionState;
        if (s === "failed" || s === "closed") {
          cleanup(sid);
          if (retriesRef.current < maxRetries) {
            retriesRef.current += 1;
            connect(sid);
          } else {
            onFailure?.();
          }
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === "complete") return resolve();
        const h = () => {
          if (pc.iceGatheringState === "complete") {
            pc.removeEventListener("icegatheringstatechange", h);
            resolve();
          }
        };
        pc.addEventListener("icegatheringstatechange", h);
      });

      // 🔑 URL ต้องเป็น <path>/whep
      const whepUrl = `${webrtcBase.replace(/\/+$/, "")}/${encodeURIComponent(path)}/whep`;

      const headers: Record<string, string> = {
        "Content-Type": "application/sdp",
        "Accept": "application/sdp",
      };
      const auth = parseBasicAuth(camAddressRtsp);
      if (auth) headers.Authorization = auth;

      const resp = await fetch(whepUrl, { method: "POST", headers, body: pc.localDescription?.sdp ?? "" });
      if (!resp.ok) {
        if (resp.status === 404) {
          retriesRef.current = maxRetries; // หยุด retry ถ้า path ไม่มี
          onFailure?.();
        }
        return false;
      }

      const answer = await resp.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answer });
      return true;
    } catch {
      return false;
    }
  };

  const cleanup = (sid: number) => {
    if (sid !== sessionIdRef.current) return;
    const pc = pcRef.current;
    pcRef.current = null;
    try {
      pc?.getTransceivers().forEach((t) => t.stop?.());
      pc?.close();
    } catch {}
  };

  useEffect(() => {
    abortedRef.current = false;
    retriesRef.current = 0;

    const sid = ++sessionIdRef.current;
    connect(sid);

    return () => {
      abortedRef.current = true;
      cleanup(sid);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camAddressRtsp, webrtcBase]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="absolute inset-0 h-full w-full object-cover rounded-md"
    />
  );
}