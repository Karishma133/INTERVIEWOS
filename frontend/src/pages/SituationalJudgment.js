import React, { useState } from "react";
import { api } from "../services/api";

export default function SituationalJudgment() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startQuiz = async () => {
    setLoading(true);
    setError("");
    try {
      const qs = await api.getSituationalQuiz(5);
      setQuestions(qs || []);
      setAnswers({});
      setCurrent(0);
      setResult(null);
      setStarted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const speakScenario = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  const selectAnswer = (questionId, index) => setAnswers((prev) => ({ ...prev, [questionId]: index }));

  const submitQuiz = async () => {
    setLoading(true);
    const res = await api.submitSituationalQuiz(
      questions.map((q) => ({ questionId: q._id, selectedIndex: answers[q._id] ?? -1 }))
    );
    setResult(res);
    setLoading(false);
  };

  if (!started) {
    return (
      <div className="page-container max-w-xl">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">🧭 Situational Judgment</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Real-world workplace scenarios — crisis handling, leadership, teamwork, and ethics. There's no single "correct"
          answer, but some responses are more effective than others, just like a real assessment center.
        </p>

        {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-2 mb-4">{error}</p>}

        <div className="card">
          <button onClick={startQuiz} disabled={loading} className="btn-primary w-full">
            {loading ? "Loading..." : "Start 5-Scenario Assessment"}
          </button>
        </div>
      </div>
    );
  }

  if (started && questions.length === 0) {
    return (
      <div className="page-container max-w-xl">
        <div className="card text-center py-10">
          <p className="text-4xl mb-3">🗂️</p>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">No scenarios found</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Run <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">node seedSituational.js</code> in the backend folder, then try again.
          </p>
          <button onClick={() => setStarted(false)} className="btn-primary">Back</button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="page-container max-w-2xl">
        <div className="card text-center mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Judgment Effectiveness Score</p>
          <p className="text-5xl font-extrabold text-primary-600 my-2">{result.scorePercent}%</p>
        </div>

        <div className="space-y-3 mb-6">
          {result.results.map((r, i) => (
            <div key={i} className={`card !p-4 ${r.wasOptimal ? "border-green-200 dark:border-green-900" : "border-yellow-200 dark:border-yellow-900"}`}>
              <p className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2">{r.scenario}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Your choice: <span className="italic">"{r.chosenText}"</span> — effectiveness {r.effectiveness}/{r.bestPossible}
              </p>
              {!r.wasOptimal && r.explanation && (
                <p className="text-xs text-primary-600 mt-2">💡 {r.explanation}</p>
              )}
            </div>
          ))}
        </div>

        <button onClick={() => setStarted(false)} className="btn-primary w-full">Try Another Set</button>
      </div>
    );
  }

  const q = questions[current];
  return (
    <div className="page-container max-w-xl">
      <div className="flex items-center justify-between mb-4">
        <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">{q.category}</span>
        <span className="text-sm text-gray-400">{current + 1} / {questions.length}</span>
      </div>

      <div className="card mb-4">
        <div className="flex items-start justify-between gap-2 mb-4">
          <p className="font-medium text-gray-900 dark:text-gray-100">{q.scenario}</p>
          <button onClick={() => speakScenario(q.scenario)} className="btn-secondary !py-1 !px-2 !text-xs shrink-0">🔊</button>
        </div>
        <div className="space-y-2">
          {q.options.map((opt) => (
            <button
              key={opt.index}
              onClick={() => selectAnswer(q._id, opt.index)}
              className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                answers[q._id] === opt.index
                  ? "border-primary-600 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                  : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
              }`}
            >
              {opt.text}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0} className="btn-outline flex-1">Previous</button>
        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent((c) => c + 1)} className="btn-primary flex-1">Next</button>
        ) : (
          <button onClick={submitQuiz} disabled={loading} className="btn-primary flex-1">{loading ? "Submitting..." : "Submit"}</button>
        )}
      </div>
    </div>
  );
}
