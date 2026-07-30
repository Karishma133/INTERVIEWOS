import React, { useRef, useState } from "react";
import { api } from "../services/api";
import { useVoiceSentiment } from "../utils/useVoiceSentiment";

// Filler words commonly flagged in real interview communication coaching.
const FILLER_WORDS = ["um", "uh", "like", "basically", "actually", "you know", "so yeah", "kind of"];

/**
 * AI Voice & Text Mock Interviewer — built entirely on the browser-native
 * Web Speech API (SpeechSynthesis + SpeechRecognition) plus the Web Audio
 * API for real vocal-steadiness signal (pauses, volume variance). No
 * external AI/LLM API, no server cost. Works in Chrome/Edge.
 *
 * The "communication rating" is a rule-based heuristic over the
 * transcribed answer (duration, word count, filler-word frequency,
 * keyword coverage) combined with the real audio steadiness signal.
 * Scores are persisted for the Scorecard radar chart.
 */
export default function VoiceInterviewer({ question }) {
  const [isSupported] = useState(() => "webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [rating, setRating] = useState(null);
  const recognitionRef = useRef(null);
  const startTimeRef = useRef(null);
  const sentiment = useVoiceSentiment();

  const speakQuestion = () => {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(
      `Here is your question. ${question?.title}. ${question?.description}`
    );
    utterance.rate = 0.95;
    setStatus("asking");
    utterance.onend = () => setStatus("idle");
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    let finalText = "";
    startTimeRef.current = Date.now();
    setTranscript("");
    setRating(null);
    setStatus("listening");
    sentiment.start();

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += text + " ";
        else interim += text;
      }
      setTranscript(finalText + interim);
    };

    recognition.onerror = () => setStatus("idle");
    recognition.onend = async () => {
      const audioSignal = sentiment.stop();
      const finalRating = rateAnswer(finalText, Date.now() - startTimeRef.current, question, audioSignal);
      setRating(finalRating);
      setStatus("done");

      // Persist for the Scorecard radar chart's "Communication" dimension
      try {
        await api.recordAssessment({
          type: "voice_interview",
          score: finalRating.score,
          meta: { wpm: finalRating.wpm, fillerCount: finalRating.fillerCount, pauseCount: audioSignal.pauseCount },
        });
      } catch (e) { /* non-critical, ignore */ }
    };

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  const rateAnswer = (text, durationMs, q, audioSignal) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const durationSec = Math.max(1, durationMs / 1000);
    const wpm = Math.round((wordCount / durationSec) * 60);

    const lowerText = text.toLowerCase();
    const fillerCount = FILLER_WORDS.reduce((count, fw) => count + (lowerText.split(fw).length - 1), 0);
    const fillerRate = wordCount ? fillerCount / wordCount : 0;

    const keyTerms = [q?.topic, ...(q?.title?.split(" ") || [])]
      .filter(Boolean)
      .map((t) => t.toLowerCase())
      .filter((t) => t.length > 3);
    const mentionedTerms = keyTerms.filter((t) => lowerText.includes(t));
    const keywordCoverage = keyTerms.length ? mentionedTerms.length / keyTerms.length : 0.5;

    let score = 100;
    if (wordCount < 15) score -= 30;
    if (wpm > 200) score -= 15;
    if (wpm < 80 && wordCount > 15) score -= 10;
    score -= Math.round(fillerRate * 100);
    score += Math.round(keywordCoverage * 15);

    // Blend in the real audio steadiness signal (pauses/volume variance)
    const steadiness = audioSignal?.steadinessScore ?? 50;
    score = Math.round(score * 0.75 + steadiness * 0.25);
    score = Math.max(0, Math.min(100, score));

    const tips = [];
    if (wordCount < 15) tips.push("Try to explain your approach more fully — walk through your reasoning step by step.");
    if (fillerRate > 0.05) tips.push(`Detected ${fillerCount} filler words (um, like, etc.) — pausing silently reads more confidently than filler words.`);
    if (wpm > 200) tips.push("You spoke quite fast — slowing down helps the interviewer follow your logic.");
    if (keywordCoverage < 0.3) tips.push("Try to explicitly mention the core concept/topic in your explanation.");
    if (audioSignal?.pauseCount > 3) tips.push(`Noticed ${audioSignal.pauseCount} longer pauses — a bit of thinking time is fine, but frequent long pauses can read as uncertainty.`);
    if (tips.length === 0) tips.push("Clear, well-paced explanation — good communication!");

    return {
      score, wordCount, wpm, fillerCount,
      keywordCoverage: Math.round(keywordCoverage * 100),
      pauseCount: audioSignal?.pauseCount ?? 0,
      steadinessScore: steadiness,
      tips,
    };
  };

  if (!isSupported) {
    return (
      <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          🎙️ Voice interviewer needs browser speech recognition support — please use Chrome or Edge.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">🎙️ Voice Mock Interviewer</h3>
      <p className="text-xs text-gray-400 mb-3">Communication score blends your transcript (pace, filler words, on-topic coverage) with real vocal steadiness — not a clinical stress reading, just a rough vocal-delivery signal.</p>

      <div className="flex gap-2 mb-3">
        <button onClick={speakQuestion} disabled={status === "asking"} className="btn-secondary">
          {status === "asking" ? "🔊 Speaking..." : "🔊 Ask Question Aloud"}
        </button>
        {status !== "listening" ? (
          <button onClick={startListening} className="btn-primary">🎤 Start Speaking</button>
        ) : (
          <button onClick={stopListening} className="btn-outline">⏹ Stop</button>
        )}
      </div>

      {transcript && (
        <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-200 mb-3">
          <span className="font-semibold">Transcript:</span> {transcript}
        </div>
      )}

      {rating && (
        <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-3">
          <p className="font-bold text-primary-600 mb-1">Communication Score: {rating.score}/100</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {rating.wordCount} words · {rating.wpm} wpm · {rating.fillerCount} filler words · {rating.keywordCoverage}% on-topic · {rating.pauseCount} long pauses
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
            {rating.tips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
