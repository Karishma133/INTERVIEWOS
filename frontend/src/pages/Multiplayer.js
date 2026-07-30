import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { getCurrentUser } from "../services/api";
import { getEloTier } from "../utils/eloTiers";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

/**
 * Live Multiplayer Peer-to-Peer Mock Interviews — Elo-based matchmaking,
 * similar in spirit to chess.com pairing players by rating. One matched
 * user becomes the "interviewer" (picks and shares a question), the
 * other the "candidate" (solves it) — both land in the same Collab Room
 * with a shared live editor and optional video call.
 */
export default function Multiplayer() {
  const user = getCurrentUser();
  const tier = getEloTier(user?.eloRating || 1200);
  const [status, setStatus] = useState("idle");
  const [waitSeconds, setWaitSeconds] = useState(0);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => socketRef.current?.disconnect();
  }, []);

  useEffect(() => {
    let interval;
    if (status === "searching") {
      interval = setInterval(() => setWaitSeconds((s) => s + 1), 1000);
    } else {
      setWaitSeconds(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  const findMatch = () => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    setStatus("searching");

    socket.on("connect", () => {
      socket.emit("join-matchmaking", { userId: user._id, name: user.name, eloRating: user.eloRating || 1200 });
    });

    socket.on("matchmaking-status", () => setStatus("searching"));

    socket.on("match-found", ({ roomId, role, opponentName, opponentElo }) => {
      setStatus("matched");
      setTimeout(() => {
        navigate(`/room?matchId=${roomId}&role=${role}&opponent=${encodeURIComponent(opponentName)}&opponentElo=${opponentElo}`);
      }, 1200);
    });
  };

  const cancelSearch = () => {
    socketRef.current?.emit("leave-matchmaking");
    socketRef.current?.disconnect();
    setStatus("idle");
  };

  return (
    <div className="page-container max-w-xl">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">⚔️ Multiplayer Mock Interview</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Get matched with another candidate near your Elo rating — one of you interviews, the other solves.
      </p>

      <div className="card text-center">
        <span className={`badge !text-base inline-block mb-6 ${tier.classes}`}>{tier.emoji} {tier.name} · {user?.eloRating || 1200} Elo</span>

        {status === "idle" && (
          <button onClick={findMatch} className="btn-primary w-full !py-3 !text-base">🔍 Find a Match</button>
        )}

        {status === "searching" && (
          <div>
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">Searching for an opponent...</p>
            <p className="text-sm text-gray-400 mb-4">{waitSeconds}s elapsed — widening match range the longer you wait</p>
            <button onClick={cancelSearch} className="btn-outline">Cancel</button>
          </div>
        )}

        {status === "matched" && (
          <div>
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-gray-900 dark:text-gray-100 font-semibold">Match found! Entering room...</p>
          </div>
        )}
      </div>

      <div className="card mt-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How it works</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
          <li>You're matched with someone within ~200 Elo points (widens if no one's around)</li>
          <li>One of you is randomly assigned <strong>Interviewer</strong>, the other <strong>Candidate</strong></li>
          <li>You land in a shared live-coding room with real-time sync + optional video call</li>
          <li>The Interviewer picks a question from the bank to share; the Candidate solves it live</li>
        </ul>
      </div>
    </div>
  );
}
