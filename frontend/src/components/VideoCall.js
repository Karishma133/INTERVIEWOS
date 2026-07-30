import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

// Free public STUN servers — no paid TURN/media relay service used.
// Note: this works for most home/office networks. Some restrictive
// corporate NATs may block direct peer-to-peer connections; a TURN
// server would be needed for those (out of scope for a free build).
const ICE_SERVERS = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }],
};

export default function VideoCall({ roomId, userName, onClose }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const peerSocketIdRef = useRef(null);
  const localStreamRef = useRef(null);

  const [status, setStatus] = useState("Connecting...");
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) return;
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (err) {
        setStatus("Camera/mic permission denied");
        return;
      }

      const socket = io(SOCKET_URL);
      socketRef.current = socket;

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;
      localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current));

      pc.ontrack = (e) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
        setStatus("Connected");
      };
      pc.onicecandidate = (e) => {
        if (e.candidate && peerSocketIdRef.current) {
          socket.emit("webrtc-ice-candidate", { targetSocketId: peerSocketIdRef.current, candidate: e.candidate });
        }
      };

      socket.on("connect", () => {
        socket.emit("join-room", { roomId, userName });
      });

      socket.on("peer-joined", async ({ socketId }) => {
        peerSocketIdRef.current = socketId;
        setStatus("Peer joined — connecting...");
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("webrtc-offer", { targetSocketId: socketId, offer });
      });

      socket.on("webrtc-offer", async ({ fromSocketId, offer }) => {
        peerSocketIdRef.current = fromSocketId;
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc-answer", { targetSocketId: fromSocketId, answer });
      });

      socket.on("webrtc-answer", async ({ answer }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on("webrtc-ice-candidate", async ({ candidate }) => {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) { /* ignore */ }
      });

      socket.on("peer-left", () => {
        setStatus("Peer disconnected");
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      });

      setStatus("Waiting for peer to join...");
    }

    start();

    return () => {
      cancelled = true;
      pcRef.current?.close();
      socketRef.current?.disconnect();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = muted));
    setMuted(!muted);
  };
  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = videoOff));
    setVideoOff(!videoOff);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">📹 Live Interview Call</h3>
        <span className="badge bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">{status}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="relative rounded-lg overflow-hidden bg-gray-900 aspect-video">
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">You</span>
        </div>
        <div className="relative rounded-lg overflow-hidden bg-gray-900 aspect-video">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">Peer</span>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button onClick={toggleMute} className="btn-secondary flex-1">{muted ? "🔇 Unmute" : "🎙️ Mute"}</button>
        <button onClick={toggleVideo} className="btn-secondary flex-1">{videoOff ? "📷 Video On" : "🚫 Video Off"}</button>
        <button onClick={onClose} className="btn-outline flex-1">End Call</button>
      </div>
    </div>
  );
}
