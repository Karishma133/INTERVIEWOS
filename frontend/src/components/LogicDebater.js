import React, { useRef, useState } from "react";
import { api } from "../services/api";

/**
 * AI Voice "Logic Debater" — Challenge Without Changing Code.
 */
export default function LogicDebater({ code, functionName = "solve" }) {
  const [challenges, setChallenges] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);
  const isSupported = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;

  const startDebate = async () => {
    setLoading(true);
    try {
      const res = await api.getDebateChallenges({ code, functionName });
      setChallenges(res.challenges);
      setActiveIndex(0);
      setResults({});
    } finally { setLoading(false); }
  };

  const speakChallenge = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
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
    setTranscript("");
    setStatus("listening");

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
    recognition.onend = () => submitDefense(finalText);

    recognition.start();
  };

  const stopListening = () => recognitionRef.current?.stop();

  const submitDefense = async (responseText) => {
    setStatus("evaluating");
    const challenge = challenges[activeIndex];
    const result = await api.submitDefense({ challengeType: challenge.type, responseText });
    setResults((prev) => ({ ...prev, [challenge.type]: result }));
    setStatus("idle");

    // Persist for the Scorecard radar chart's "Composure" dimension —
    // defending your logic under follow-up questioning, unrelated to
    // whether the original code passed.
    try {
      await api.recordAssessment({
        type: "logic_debate",
        score: result.score,
        meta: { challengeType: challenge.type, wordCount: result.wordCount },
      });
    } catch (e) { /* non-critical, ignore */ }
  };

  const submitTypedDefense = () => {
    if (!transcript.trim()) return;
    submitDefense(transcript);
  };

  if (!isSupported) {
    return (
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🗣️ Logic Debater</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Requires Chrome or Edge for voice mode — you can still type your defense below.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">🗣️ Logic Debater — Defend Your Solution</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        No need to change your code — just explain your reasoning out loud, like a real interviewer follow-up.
      </p>

      {!challenges ? (
        <button onClick={startDebate} disabled={loading} className="btn-primary w-full">
          {loading ? "Analyzing your solution..." : "🎯 Start the Challenge"}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-1.5">
            {challenges.map((c, i) => (
              <button key={c.type} onClick={() => setActiveIndex(i)}
                className={`badge cursor-pointer !text-xs ${i === activeIndex ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600"}`}>
                Challenge {i + 1} {results[c.type] && "✓"}
              </button>
            ))}
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 text-sm text-gray-800 dark:text-gray-100">
            "{challenges[activeIndex].question}"
          </div>

          <div className="flex gap-2">
            <button onClick={() => speakChallenge(challenges[activeIndex].question)} className="btn-secondary flex-1">🔊 Hear it</button>
            {status !== "listening" ? (
              <button onClick={startListening} className="btn-primary flex-1">🎤 Defend Out Loud</button>
            ) : (
              <button onClick={stopListening} className="btn-outline flex-1">⏹ Stop & Submit</button>
            )}
          </div>

          {status === "listening" && transcript && (
            <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{transcript}"</p>
          )}

          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="...or type your defense here instead"
              value={status === "listening" ? "" : transcript}
              onChange={(e) => setTranscript(e.target.value)}
              disabled={status === "listening"}
            />
            <button onClick={submitTypedDefense} disabled={status !== "idle"} className="btn-secondary">Submit</button>
          </div>

          {status === "evaluating" && <p className="text-sm text-gray-400">Evaluating your defense...</p>}

          {results[challenges[activeIndex].type] && (
            <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-3">
              <p className="font-bold text-primary-600 mb-1">Defense Score: {results[challenges[activeIndex].type].score}/100</p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                {results[challenges[activeIndex].type].feedback.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
