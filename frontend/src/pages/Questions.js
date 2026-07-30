import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { ProblemCard } from "../components/Cards";

const TOPICS = [
  "Array", "String", "LinkedList", "Stack", "Queue", "Tree", "Graph",
  "DynamicProgramming", "Recursion", "Sorting", "Searching", "HashMap", "Greedy",
];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export default function Questions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [questions, setQuestions] = useState([]);
  const [topic, setTopic] = useState(searchParams.get("topic") || "");
  const [company, setCompany] = useState(searchParams.get("company") || "");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const filters = {};
    if (topic) filters.topic = topic;
    if (difficulty) filters.difficulty = difficulty;
    if (company) filters.company = company;
    api.listQuestions(filters).then(setQuestions).finally(() => setLoading(false));
  };

  useEffect(load, [topic, difficulty, company]);

  const hasFilters = topic || difficulty || company;
  const clearFilters = () => { setTopic(""); setDifficulty(""); setCompany(""); };

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">Problem Bank</h1>
        <p className="text-gray-500 dark:text-gray-400">Browse all DSA problems by topic, difficulty, or company.</p>
      </div>

      {company && (
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 pl-3 pr-1.5 py-1 text-sm font-medium">
            🏢 {company} prep set
            <button onClick={() => setCompany("")} className="w-5 h-5 rounded-full hover:bg-primary-100 dark:hover:bg-primary-800 flex items-center justify-center">✕</button>
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <select className="input !w-auto" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">All Difficulties</option>
          {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="input !w-auto" value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="">All Topics</option>
          {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        {hasFilters && (
          <button onClick={clearFilters} className="text-sm text-gray-400 hover:text-primary-600 font-medium">Clear all</button>
        )}
        <span className="ml-auto text-sm text-gray-400">{questions.length} problem{questions.length !== 1 ? "s" : ""}</span>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading problems...</p>
      ) : questions.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-gray-400">No problems match these filters.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {questions.map((q) => (
            <ProblemCard key={q._id} question={q} onSolve={(question) => navigate(`/interview?questionId=${question._id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
