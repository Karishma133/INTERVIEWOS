import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import VideoCall from "../components/VideoCall";
import VoiceInterviewer from "../components/VoiceInterviewer";
import GitHubSync from "../components/GitHubSync";
import LogicDebater from "../components/LogicDebater";
import { api, refreshUser, getCurrentUser } from "../services/api";
import { DifficultyBadge, StatusBadge } from "../components/Cards";

const STARTER_CODE = {
  javascript: "function solve() {\n  // your code here\n}",
  python: "def solve():\n    # your code here\n    pass",
};

export default function InterviewRoom() {
  const [searchParams] = useSearchParams();
  const questionIdParam = searchParams.get("questionId");
  const roomParam = searchParams.get("room");
  const user = getCurrentUser();

  const [question, setQuestion] = useState(null);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adaptive, setAdaptive] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(!!roomParam);
  const [callRoomId, setCallRoomId] = useState(roomParam || "");
  const [showVoiceInterviewer, setShowVoiceInterviewer] = useState(false);
  const questionLoadTime = useRef(null);

  // Smart Proctoring — pure browser JS, no ML/camera required for this part
  const [proctoringOn, setProctoringOn] = useState(false);
  const tabSwitchCount = useRef(0);
  const pasteAttempts = useRef(0);
  const [proctoringAlert, setProctoringAlert] = useState("");

  useEffect(() => {
    if (!proctoringOn) return;

    const handleVisibility = () => {
      if (document.hidden) {
        tabSwitchCount.current += 1;
        setProctoringAlert(`⚠️ Tab switch detected (${tabSwitchCount.current} total). This is logged with your submission.`);
      }
    };
    const handlePaste = (e) => {
      pasteAttempts.current += 1;
      e.preventDefault();
      setProctoringAlert(`⚠️ Paste blocked (${pasteAttempts.current} attempt(s)). Type your solution manually during proctored practice.`);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("paste", handlePaste, true);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("paste", handlePaste, true);
    };
  }, [proctoringOn]);

  const loadQuestion = async (targetWeak = false) => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const q = questionIdParam ? await api.getQuestion(questionIdParam) : await api.nextQuestion(null, targetWeak);
      setQuestion(q);
      setCode(q.starterCode || STARTER_CODE[language]);
      setLanguage("javascript");
      questionLoadTime.current = Date.now();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestion(adaptive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionIdParam]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    // Only reset to a fresh starter if the editor still has the previous language's starter
    if (code === STARTER_CODE[language] || code === question?.starterCode) {
      setCode(lang === "javascript" ? (question?.starterCode || STARTER_CODE.javascript) : STARTER_CODE.python);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.submitCode({
        questionId: question._id, code, language,
        tabSwitchCount: tabSwitchCount.current,
        pasteAttempts: pasteAttempts.current,
        timeTakenSec: questionLoadTime.current ? Math.round((Date.now() - questionLoadTime.current) / 1000) : 0,
      });
      setResult(res);
      await refreshUser(); // sync streak/level/badges shown in Navbar
      tabSwitchCount.current = 0;
      pasteAttempts.current = 0;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !question) return <div className="page-container"><p className="text-gray-400">Loading question...</p></div>;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500 dark:text-gray-400">Target:</label>
          <button
            onClick={() => { setAdaptive(!adaptive); loadQuestion(!adaptive); }}
            className={`badge cursor-pointer ${adaptive ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}
          >
            🎯 {adaptive ? "Weakest Topic (on)" : "Random"}
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setProctoringOn(!proctoringOn)}
            className={`badge cursor-pointer ${proctoringOn ? "bg-red-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}
          >
            🛡️ Proctoring {proctoringOn ? "ON" : "OFF"}
          </button>
          <button onClick={() => setShowVoiceInterviewer(!showVoiceInterviewer)} className="btn-outline !py-1.5 !px-3">
            {showVoiceInterviewer ? "Hide" : "🎙️"} Voice Interviewer
          </button>
          <button
            onClick={() => { setCallRoomId(`interview-${user._id}`); setShowVideoCall(!showVideoCall); }}
            className="btn-outline !py-1.5 !px-3"
          >
            {showVideoCall ? "Hide" : "📹"} Video Call
          </button>
        </div>
      </div>

      {proctoringOn && proctoringAlert && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-lg px-4 py-2 text-sm text-red-700 dark:text-red-300">
          {proctoringAlert}
        </div>
      )}

      {showVoiceInterviewer && (
        <div className="mb-4">
          <VoiceInterviewer question={question} />
        </div>
      )}

      {showVideoCall && (
        <div className="mb-4">
          <VideoCall roomId={callRoomId} userName={user?.name || "Guest"} onClose={() => setShowVideoCall(false)} />
          <p className="text-xs text-gray-400 mt-1">Share room ID <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{callRoomId}</code> with a friend/interviewer to connect (they need to open a video call with the same ID).</p>
        </div>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-2 mb-4">{error}</p>}

      {question && (
        <div className="card">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">{question.title}</h2>
            <DifficultyBadge difficulty={question.difficulty} />
            <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">{question.topic}</span>
            {question.companyTags?.map((c) => (
              <span key={c} className="badge bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 !text-[11px]">🏢 {c}</span>
            ))}
          </div>
          {question.targetedWeakTopic && (
            <p className="text-xs text-primary-600 mb-2">🎯 Targeting your weakest topic: {question.targetedWeakTopic}</p>
          )}
          <p className="text-gray-600 dark:text-gray-300 mb-4">{question.description}</p>

          {question.examples?.map((ex, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-800/60 rounded-lg px-4 py-3 mb-2 text-sm">
              <p className="text-gray-700 dark:text-gray-200"><span className="font-semibold">Input:</span> {ex.input}</p>
              <p className="text-gray-700 dark:text-gray-200"><span className="font-semibold">Output:</span> {ex.output}</p>
              {ex.explanation && <p className="text-gray-500 dark:text-gray-400"><span className="font-semibold">Explanation:</span> {ex.explanation}</p>}
            </div>
          ))}

          <div className="flex items-center gap-2 mt-4 mb-2">
            <label className="text-sm text-gray-500 dark:text-gray-400">Language:</label>
            <select className="input !w-auto !py-1.5" value={language} onChange={(e) => handleLanguageChange(e.target.value)}>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>
          </div>
          <CodeEditor value={code} onChange={setCode} />

          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmit} disabled={loading} className="btn-primary">
              {loading ? "Running..." : "Submit Solution"}
            </button>
            <button onClick={() => loadQuestion(adaptive)} disabled={loading} className="btn-secondary">
              Skip / New Question
            </button>
          </div>

          {result && (
            <div className="mt-6 rounded-xl border border-gray-100 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/40">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <StatusBadge status={result.status} />
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  {result.testCasesPassed}/{result.totalTestCases} test cases
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                ⏱ {result.executionTimeMs}ms &nbsp; 💾 {result.memoryUsedKB}KB
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                {result.feedback.map((f, i) => <li key={i}>{f}</li>)}
              </ul>

              {result.codeReview && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    🔍 Code Review — Estimated: {result.codeReview.estimatedTimeComplexity}
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                    {result.codeReview.hints.map((h, i) => <li key={i}>{h}</li>)}
                  </ul>
                </div>
              )}

              {result.codeReview?.securityIssues?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">🔒 Security Scan</p>
                  <ul className="text-sm space-y-1">
                    {result.codeReview.securityIssues.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className={`badge !text-[10px] shrink-0 ${
                          s.severity === "High" ? "bg-red-100 text-red-700" : s.severity === "Medium" ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"
                        }`}>{s.severity}</span>
                        <span className="text-gray-600 dark:text-gray-300">{s.message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.leveledUp && (
                <p className="mt-3 font-bold text-primary-600">🎉 Level updated to {result.updatedLevel}!</p>
              )}
              {result.newBadges?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.newBadges.map((b) => (
                    <span key={b.id} className="badge bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 !text-sm">
                      New badge: {b.label}
                    </span>
                  ))}
                </div>
              )}
              {result.currentStreak > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">🔥 Streak: {result.currentStreak} days · Total solved: {result.totalSolved}</p>
              )}
              {typeof result.eloChange === "number" && result.eloChange !== 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  📈 Elo: {result.eloRating} ({result.eloChange > 0 ? "+" : ""}{result.eloChange}) · {result.eloTier} Tier
                </p>
              )}

              {result.status === "Passed" && (
                <div className="mt-4 space-y-4">
                  <LogicDebater code={code} functionName={question.functionName} />
                  <GitHubSync question={question} code={code} language={language} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
