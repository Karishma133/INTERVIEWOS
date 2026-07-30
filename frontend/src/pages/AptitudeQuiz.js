import React, { useRef, useState } from "react";
import { api } from "../services/api";

const CATEGORIES = ["Mixed", "Quantitative", "Logical", "Verbal"];

export default function AptitudeQuiz() {
  const [category, setCategory] = useState("Mixed");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const startTime = useRef(null);

  const startQuiz = async () => {
    setLoading(true);
    setError("");
    try {
      const qs = await api.getAptitudeQuiz(category, 10);
      setQuestions(qs || []);
      setAnswers({});
      setCurrent(0);
      setResult(null);
      setStarted(true);
      startTime.current = Date.now();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionId, index) => {
    setAnswers((prev) => ({ ...prev, [questionId]: index }));
  };

  const submitQuiz = async () => {
    setLoading(true);
    const payload = {
      category,
      timeTakenSec: Math.round((Date.now() - startTime.current) / 1000),
      answers: questions.map((q) => ({ questionId: q._id, selectedIndex: answers[q._id] ?? -1 })),
    };
    const res = await api.submitAptitudeQuiz(payload);
    setResult(res);
    setLoading(false);
  };

  if (!started) {
    return (
      <div className="page-container max-w-xl">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">🧮 Aptitude Practice</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Quantitative, Logical, and Verbal reasoning — the round most platforms skip.</p>

        {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-2 mb-4">{error}</p>}

        <div className="card">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Choose a category</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`badge cursor-pointer !text-sm ${category === c ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}>
                {c}
              </button>
            ))}
          </div>
          <button onClick={startQuiz} disabled={loading} className="btn-primary w-full">
            {loading ? "Loading..." : "Start 10-Question Quiz"}
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="page-container max-w-2xl">
        <div className="card text-center mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Your Score</p>
          <p className="text-5xl font-extrabold text-primary-600 my-2">{result.scorePercent}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{result.correctCount}/{result.totalQuestions} correct</p>
        </div>

        <div className="space-y-3 mb-6">
          {result.results.map((r, i) => (
            <div key={i} className={`card !p-4 ${r.isCorrect ? "border-green-200 dark:border-green-900" : "border-red-200 dark:border-red-900"}`}>
              <p className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">{r.question}</p>
              <p className={`text-xs ${r.isCorrect ? "text-green-600" : "text-red-600"}`}>
                {r.isCorrect ? "✓ Correct" : "✗ Incorrect"}
              </p>
              {r.explanation && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{r.explanation}</p>}
            </div>
          ))}
        </div>

        <button onClick={() => setStarted(false)} className="btn-primary w-full">Try Another Quiz</button>
      </div>
    );
  }

  if (started && questions.length === 0) {
    return (
      <div className="page-container max-w-xl">
        <div className="card text-center py-10">
          <p className="text-4xl mb-3">🗂️</p>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">No aptitude questions found</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            The question bank looks empty. Run <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">node seedAptitude.js</code> in the backend folder, then try again.
          </p>
          <button onClick={() => setStarted(false)} className="btn-primary">Back</button>
        </div>
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
        <p className="font-medium text-gray-900 dark:text-gray-100 mb-4">{q.question}</p>
        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => selectAnswer(q._id, i)}
              className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                answers[q._id] === i
                  ? "border-primary-600 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                  : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0} className="btn-outline flex-1">Previous</button>
        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent((c) => c + 1)} className="btn-primary flex-1">Next</button>
        ) : (
          <button onClick={submitQuiz} disabled={loading} className="btn-primary flex-1">{loading ? "Submitting..." : "Submit Quiz"}</button>
        )}
      </div>
    </div>
  );
}
