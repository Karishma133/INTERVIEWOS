import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InterviewRoom from "./pages/InterviewRoom";
import CollabRoom from "./pages/CollabRoom";
import Analytics from "./pages/Analytics";
import Questions from "./pages/Questions";
import Leaderboard from "./pages/Leaderboard";
import Multiplayer from "./pages/Multiplayer";
import Scorecard from "./pages/Scorecard";
import PublicProfile from "./pages/PublicProfile";
import Roadmap from "./pages/Roadmap";
import AptitudeQuiz from "./pages/AptitudeQuiz";
import SituationalJudgment from "./pages/SituationalJudgment";
import ResumeBuilder from "./pages/ResumeBuilder";
import CompanyPrep from "./pages/CompanyPrep";
import Settings from "./pages/Settings";
import VerifyEmail from "./pages/VerifyEmail";
import NotFound from "./pages/NotFound";
import { getCurrentUser } from "./services/api";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";

function PrivateRoute({ children }) {
  const user = getCurrentUser();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/u/:slug" element={<PublicProfile />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />

            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/interview" element={<PrivateRoute><InterviewRoom /></PrivateRoute>} />
            <Route path="/room" element={<PrivateRoute><CollabRoom /></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
            <Route path="/scorecard" element={<PrivateRoute><Scorecard /></PrivateRoute>} />
            <Route path="/roadmap" element={<PrivateRoute><Roadmap /></PrivateRoute>} />
            <Route path="/aptitude" element={<PrivateRoute><AptitudeQuiz /></PrivateRoute>} />
            <Route path="/situational" element={<PrivateRoute><SituationalJudgment /></PrivateRoute>} />
            <Route path="/resume" element={<PrivateRoute><ResumeBuilder /></PrivateRoute>} />
            <Route path="/companies" element={<PrivateRoute><CompanyPrep /></PrivateRoute>} />
            <Route path="/questions" element={<PrivateRoute><Questions /></PrivateRoute>} />
            <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
            <Route path="/multiplayer" element={<PrivateRoute><Multiplayer /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

            {/* Catch-all — must stay last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}