import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import CodeEditor from "../components/CodeEditor";
import Whiteboard from "../components/Whiteboard";
import VideoCall from "../components/VideoCall";
import { api, getCurrentUser } from "../services/api";
import { Y, diffAndApply, uint8ToBase64, base64ToUint8 } from "../utils/yjsSync";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

export default function CollabRoom() {
  const user = getCurrentUser();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get("matchId");
  const matchRole = searchParams.get("role"); // "interviewer" | "candidate" | null
  const opponentName = searchParams.get("opponent");
  const opponentElo = searchParams.get("opponentElo");

  const [roomId, setRoomId] = useState(matchId || "team-room-1");
  const [joined, setJoined] = useState(false);
  const [code, setCode] = useState("// Waiting to join room...");
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [tab, setTab] = useState("code"); // "code" | "whiteboard"
  const [whiteboardStrokes, setWhiteboardStrokes] = useState([]);
  const [whiteboardShapes, setWhiteboardShapes] = useState([]);
  const [whiteboardConnectors, setWhiteboardConnectors] = useState([]);
  const [syncStatus, setSyncStatus] = useState("");
  const [showVideoCall, setShowVideoCall] = useState(!!matchId);
  const [pickingQuestion, setPickingQuestion] = useState(false);
  const socketRef = useRef(null);

  const ydocRef = useRef(null);
  const ytextRef = useRef(null);

  const joinRoom = () => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    const ydoc = new Y.Doc();
    const ytext = ydoc.getText("code");
    ydocRef.current = ydoc;
    ytextRef.current = ytext;

    ydoc.on("update", (update, origin) => {
      if (origin === "remote") return;
      socket.emit("yjs-update", { roomId, update: uint8ToBase64(update) });
    });
    ytext.observe(() => setCode(ytext.toString()));

    socket.on("connect", () => {
      socket.emit("join-room", { roomId, userName: user?.name || "Guest" });
      setJoined(true);
    });

    socket.on("room-state", ({ yjsState, whiteboard, shapes, connectors }) => {
      if (yjsState) Y.applyUpdate(ydoc, base64ToUint8(yjsState), "remote");
      setWhiteboardStrokes(whiteboard || []);
      setWhiteboardShapes(shapes || []);
      setWhiteboardConnectors(connectors || []);
    });

    socket.on("yjs-update", (update) => {
      Y.applyUpdate(ydoc, base64ToUint8(update), "remote");
    });

    socket.on("user-list", (list) => {
      setUsers(list);
      setSyncStatus(list.length > 1 ? "🟢 Live synced (CRDT)" : "Waiting for a peer to join...");
    });

    socket.on("system-message", (msg) => {
      setMessages((prev) => [...prev, { system: true, message: msg, timestamp: Date.now() }]);
    });

    socket.on("chat-message", (payload) => {
      setMessages((prev) => [...prev, payload]);
    });
  };

  // Auto-join immediately when arriving via matchmaking
  useEffect(() => {
    if (matchId && !joined) joinRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  useEffect(() => {
    return () => socketRef.current?.disconnect();
  }, []);

  const handleCodeChange = (newCode) => {
    if (ytextRef.current) {
      diffAndApply(ytextRef.current, ytextRef.current.toString(), newCode);
    } else {
      setCode(newCode);
    }
  };

  const sendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socketRef.current?.emit("chat-message", { roomId, userName: user?.name || "Guest", message: chatInput });
    setChatInput("");
  };

  const pickQuestionForCandidate = async () => {
    setPickingQuestion(true);
    try {
      const q = await api.nextQuestion();
      socketRef.current?.emit("chat-message", {
        roomId,
        userName: user?.name || "Interviewer",
        message: `📋 Question for you: "${q.title}" (${q.difficulty}, ${q.topic}) — ${q.description}`,
      });
    } finally {
      setPickingQuestion(false);
    }
  };

  if (!joined) {
    return (
      <div className="page-container">
        <div className="card max-w-md">
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">Collaborative DSA Room</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Share a room ID with a friend to code and design together in real time — powered by Yjs CRDT sync for Google-Docs-style conflict-free editing.
          </p>
          <div className="flex gap-2">
            <input className="input" value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Room ID" />
            <button onClick={joinRoom} className="btn-primary whitespace-nowrap">Join Room</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {matchRole && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-primary-200 dark:border-primary-900/50 bg-primary-50 dark:bg-primary-900/20 px-4 py-3 mb-4">
          <p className="text-sm text-primary-800 dark:text-primary-300">
            ⚔️ Matched vs <strong>{opponentName}</strong> ({opponentElo} Elo) — you are the{" "}
            <span className="font-bold">{matchRole === "interviewer" ? "🎤 Interviewer" : "💻 Candidate"}</span>
          </p>
          {matchRole === "interviewer" && (
            <button onClick={pickQuestionForCandidate} disabled={pickingQuestion} className="btn-primary !py-1.5 !px-3 !text-xs whitespace-nowrap">
              {pickingQuestion ? "Picking..." : "📋 Send a Question"}
            </button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">Room: {roomId}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="badge bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
            Online: {users.join(", ") || "..."}
          </span>
          <span className="badge bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">{syncStatus}</span>
          <button onClick={() => setShowVideoCall(!showVideoCall)} className="btn-outline !py-1 !px-3 !text-xs">
            {showVideoCall ? "Hide" : "📹"} Video Call
          </button>
        </div>
      </div>

      {showVideoCall && (
        <div className="mb-4">
          <VideoCall roomId={`video-${roomId}`} userName={user?.name || "Guest"} onClose={() => setShowVideoCall(false)} />
        </div>
      )}

      <div className="flex gap-2 mb-3">
        <button onClick={() => setTab("code")} className={`badge cursor-pointer !text-sm ${tab === "code" ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}>💻 Code Editor</button>
        <button onClick={() => setTab("whiteboard")} className={`badge cursor-pointer !text-sm ${tab === "whiteboard" ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}>🖊️ System Design Whiteboard</button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {tab === "code" ? (
            <CodeEditor value={code} onChange={handleCodeChange} height={420} />
          ) : (
            <div className="card">
              <Whiteboard
                socket={socketRef.current}
                roomId={roomId}
                initialStrokes={whiteboardStrokes}
                initialShapes={whiteboardShapes}
                initialConnectors={whiteboardConnectors}
              />
            </div>
          )}
        </div>

        <div className="card flex flex-col !p-0 overflow-hidden">
          <div className="flex-1 p-3 overflow-y-auto space-y-2" style={{ height: 380 }}>
            {messages.map((m, i) => (
              m.system ? (
                <p key={i} className="text-xs text-gray-400 italic">{m.message}</p>
              ) : (
                <p key={i} className="text-sm text-gray-700 dark:text-gray-200">
                  <span className="font-semibold">{m.userName}:</span> {m.message}
                </p>
              )
            ))}
          </div>
          <form onSubmit={sendChat} className="flex border-t border-gray-100 dark:border-gray-800">
            <input
              className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none text-gray-900 dark:text-gray-100"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Discuss strategy..."
            />
            <button type="submit" className="px-4 bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
