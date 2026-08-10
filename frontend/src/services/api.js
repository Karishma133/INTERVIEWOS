const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("io_token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload, auth: false }),
  me: () => request("/auth/me"),
  forgotPassword: (email) => request("/auth/forgot-password", { method: "POST", body: { email }, auth: false }),
  resetPassword: (token, password) => request(`/auth/reset-password/${token}`, { method: "POST", body: { password }, auth: false }),
  verifyEmail: (token) => request(`/auth/verify-email/${token}`, { auth: false }),
  resendVerification: () => request("/auth/resend-verification", { method: "POST" }),

  nextQuestion: (topic, adaptive) => {
    const params = new URLSearchParams();
    if (topic) params.set("topic", topic);
    if (adaptive) params.set("adaptive", "true");
    const qs = params.toString();
    return request(`/questions/next${qs ? `?${qs}` : ""}`);
  },
  listQuestions: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return request(`/questions${params ? `?${params}` : ""}`);
  },
  listCompanies: () => request("/questions/companies/list"),
  getQuestion: (id) => request(`/questions/${id}`),
  listBookmarked: () => request("/questions/bookmarked/list"),
  toggleBookmark: (id) => request(`/questions/${id}/bookmark`, { method: "POST" }),

  submitCode: (payload) => request("/judge/submit", { method: "POST", body: payload }),

  analyticsOverview: () => request("/analytics/overview"),
  scorecard: () => request("/analytics/scorecard"),
  roadmap: () => request("/analytics/roadmap"),

  // aptitude
  getAptitudeQuiz: (category, count) => request(`/aptitude/quiz?category=${category || "Mixed"}&count=${count || 10}`),
  submitAptitudeQuiz: (payload) => request("/aptitude/submit", { method: "POST", body: payload }),
  aptitudeHistory: () => request("/aptitude/history"),

  // resume
  getResume: () => request("/resume"),
  saveResume: (payload) => request("/resume", { method: "PUT", body: payload }),
  suggestSummary: (payload) => request("/resume/suggest-summary", { method: "POST", body: payload }),
  suggestBullets: (techUsed) => request("/resume/suggest-bullets", { method: "POST", body: { techUsed } }),

  // logic debater
  getDebateChallenges: (payload) => request("/debate/challenge", { method: "POST", body: payload }),
  submitDefense: (payload) => request("/debate/evaluate", { method: "POST", body: payload }),

  publicProfile: (slug) => request(`/public/${slug}`, { auth: false }),

  leaderboard: (sortBy) => request(`/leaderboard${sortBy ? `?sortBy=${sortBy}` : ""}`),

  // behavioral (voice sentiment, debate composure, situational judgment radar)
  recordAssessment: (payload) => request("/behavioral/record", { method: "POST", body: payload }),
  getRadarData: () => request("/behavioral/radar"),

  // situational judgment
  getSituationalQuiz: (count) => request(`/situational/quiz?count=${count || 5}`),
  submitSituationalQuiz: (answers) => request("/situational/submit", { method: "POST", body: { answers } }),

  // system design architecture review
  reviewArchitecture: (shapes, connectors) => request("/architecture/review", { method: "POST", body: { shapes, connectors } }),

  scheduleInterview: (payload) => request("/scheduled-interviews", { method: "POST", body: payload }),
  myScheduledInterviews: () => request("/scheduled-interviews/mine"),
  cancelScheduledInterview: (id) => request(`/scheduled-interviews/${id}/cancel`, { method: "PUT" }),
};

/** Re-fetches the current user from the server and updates localStorage
 * (used after code submissions to refresh streak/badges/level in the UI). */
export async function refreshUser() {
  const user = await api.me();
  const token = getToken();
  saveSession({ token, user });
  return user;
}

export async function downloadResumePdf() {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/resume/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Could not generate resume PDF");
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resume.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export function saveSession({ token, user }) {
  localStorage.setItem("io_token", token);
  localStorage.setItem("io_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("io_token");
  localStorage.removeItem("io_user");
}

export function getCurrentUser() {
  const raw = localStorage.getItem("io_user");
  return raw ? JSON.parse(raw) : null;
}
