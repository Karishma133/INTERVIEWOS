import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { api } from "../services/api";
import { ProblemCard } from "../components/Cards";
import { useToast } from "../context/ToastContext";

const TOPICS = [
  "Array", "String", "LinkedList", "Stack", "Queue", "Tree", "Graph",
  "DynamicProgramming", "Recursion", "Sorting", "Searching", "HashMap", "Greedy",
];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export default function Questions() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [questions, setQuestions] = useState([]);
  const [topic, setTopic] = useState(searchParams.get("topic") || "");
  const [company, setCompany] = useState(searchParams.get("company") || "");
  const [difficulty, setDifficulty] = useState("");
  const [search, setSearch] = useState("");
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Debounce the free-text search so we're not firing a request on every
  // keystroke — 350ms feels responsive without hammering the API.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = () => {
    setLoading(true);
    const filters = {};
    if (topic) filters.topic = topic;
    if (difficulty) filters.difficulty = difficulty;
    if (company) filters.company = company;
    if (debouncedSearch) filters.search = debouncedSearch;
    api.listQuestions(filters).then(setQuestions).finally(() => setLoading(false));
  };

  useEffect(load, [topic, difficulty, company, debouncedSearch]);

  // Load the user's bookmarked question ids once, up front, so the star
  // icons render correctly without a round trip per card.
  useEffect(() => {
    api.listBookmarked()
      .then((list) => setBookmarkedIds(new Set(list.map((q) => q._id))))
      .catch(() => {}); // non-fatal — bookmarks just won't be pre-filled
  }, []);

  const toggleBookmark = async (question) => {
    // optimistic update — flip the star immediately, revert on failure
    const wasBookmarked = bookmarkedIds.has(question._id);
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      wasBookmarked ? next.delete(question._id) : next.add(question._id);
      return next;
    });
    try {
      await api.toggleBookmark(question._id);
    } catch (err) {
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        wasBookmarked ? next.add(question._id) : next.delete(question._id);
        return next;
      });
      toast.error(err.message);
    }
  };

  const hasFilters = topic || difficulty || company || debouncedSearch || showBookmarkedOnly;
  const clearFilters = () => {
    setTopic(""); setDifficulty(""); setCompany(""); setSearch(""); setShowBookmarkedOnly(false);
  };

  const visibleQuestions = showBookmarkedOnly
    ? questions.filter((q) => bookmarkedIds.has(q._id))
    : questions;

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

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search problems by title..."
          className="input !pl-10"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <select className="input !w-auto" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">All Difficulties</option>
          {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="input !w-auto" value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="">All Topics</option>
          {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button
          onClick={() => setShowBookmarkedOnly((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${
            showBookmarkedOnly
              ? "bg-garnet-500 border-garnet-500 text-white"
              : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
        >
          ★ Bookmarked{bookmarkedIds.size > 0 ? ` (${bookmarkedIds.size})` : ""}
        </button>
        {hasFilters && (
          <button onClick={clearFilters} className="text-sm text-gray-400 hover:text-primary-600 font-medium">Clear all</button>
        )}
        <span className="ml-auto text-sm text-gray-400">{visibleQuestions.length} problem{visibleQuestions.length !== 1 ? "s" : ""}</span>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading problems...</p>
      ) : visibleQuestions.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-gray-400">
            {showBookmarkedOnly ? "You haven't bookmarked any problems yet." : "No problems match these filters."}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleQuestions.map((q) => (
            <ProblemCard
              key={q._id}
              question={q}
              bookmarked={bookmarkedIds.has(q._id)}
              onToggleBookmark={toggleBookmark}
              onSolve={(question) => navigate(`/interview?questionId=${question._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}