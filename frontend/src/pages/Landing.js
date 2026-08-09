import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowRight, Code2, Network, MessageSquare, Brain, Mic2,
  Swords, PenTool, FileText, Trophy, Flame, ShieldCheck,
} from "lucide-react";
import { getCurrentUser } from "../services/api";

// Readiness axes — mirrors the product's real Elo / radar-chart categories
const AXES = [
  { key: "dsa", label: "DSA", value: 0.88, icon: Code2 },
  { key: "system", label: "System Design", value: 0.64, icon: Network },
  { key: "behavioral", label: "Behavioral", value: 0.72, icon: MessageSquare },
  { key: "communication", label: "Communication", value: 0.58, icon: Mic2 },
  { key: "aptitude", label: "Aptitude", value: 0.91, icon: Brain },
];

// Precomputed pentagon geometry, viewBox 0 0 320 320, center (160,160), r=100
const OUTER = [[160, 60], [255, 129], [219, 241], [101, 241], [65, 129]];
const RING_66 = [[160, 94], [223, 140], [199, 213], [121, 213], [97, 140]];
const RING_33 = [[160, 127], [191, 150], [179, 187], [141, 187], [129, 150]];
const CENTER = [160, 160];

function dataPoint(i, value) {
  const [ox, oy] = OUTER[i];
  return [CENTER[0] + (ox - CENTER[0]) * value, CENTER[1] + (oy - CENTER[1]) * value];
}
const DATA_POINTS = AXES.map((a, i) => dataPoint(i, a.value));
const poly = (pts) => pts.map((p) => p.join(",")).join(" ");

const LABEL_POS = [
  { x: 160, y: 38, anchor: "middle" },
  { x: 282, y: 122, anchor: "start" },
  { x: 236, y: 268, anchor: "start" },
  { x: 84, y: 268, anchor: "end" },
  { x: 38, y: 122, anchor: "end" },
];

const SCORECARD = [
  { icon: Code2, title: "DSA & Trees", desc: "Adaptive difficulty that moves with your real pass rate, not a fixed track.", to: "/questions" },
  { icon: Network, title: "System Design", desc: "Freehand whiteboard, reviewed for SPOFs and missing load balancers.", to: "/room" },
  { icon: MessageSquare, title: "Behavioral & HR", desc: "Situational-judgment rounds scored against a rubric, not a vibe.", to: "/situational" },
  { icon: Brain, title: "Aptitude", desc: "Quant, logical & verbal reasoning — the round most platforms skip.", to: "/aptitude" },
];

const FEATURES = [
  { icon: Swords, title: "AI Logic Debater", desc: "After your code passes, it challenges your reasoning out loud — proof you understand it, not just that it ran." },
  { icon: Mic2, title: "Voice Mock Interviewer", desc: "Explain your approach out loud and get feedback on pace, filler words, and clarity." },
  { icon: Trophy, title: "Elo-Matched Multiplayer", desc: "Paired with a candidate near your rating — one interviews, one solves." },
  { icon: PenTool, title: "System Design Review", desc: "Rule-based checks flag single points of failure the moment you draw them." },
  { icon: FileText, title: "Resume Builder", desc: "Turns your projects and stack into a clean, ATS-parseable PDF." },
  { icon: ShieldCheck, title: "Explainable scoring", desc: "Every number on your scorecard traces back to a formula you can quote in the room." },
];

export default function Landing() {
  const user = getCurrentUser();
  const [hoverAxis, setHoverAxis] = useState(null);
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="bg-[#F5F6F8] dark:bg-navy-950">
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden lg:h-[calc(100vh-4rem)] lg:min-h-[600px] flex items-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-6 grid lg:grid-cols-12 gap-8 lg:gap-10 items-center w-full">
          {/* Left: thesis */}
          <div className="lg:col-span-6 animate-risein">
            <span className="inline-flex items-center gap-2 rounded-full border border-garnet-500/25 bg-garnet-500/[0.06] px-3.5 py-1.5 text-xs font-semibold text-garnet-600 dark:text-garnet-400 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-garnet-500" />
              Free · No AI subscription required
            </span>

            <h1 className="font-display text-3xl sm:text-4xl xl:text-[3rem] font-bold tracking-tight leading-[1.08] text-navy-900 dark:text-white">
              Your interview readiness,
              <br />
              read like an instrument.
            </h1>

            <p className="mt-4 text-base sm:text-lg text-navy-600/90 dark:text-navy-200 leading-relaxed max-w-lg">
              Five rounds a real hiring process runs you through — DSA, system design,
              behavioral, communication, aptitude — scored live on one panel, by rules
              you can defend in the room instead of a model you can't.
            </p>

            <div className="mt-6 flex items-center gap-3 flex-wrap">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-cta-gradient hover:bg-cta-gradient-hover px-6 py-3 text-sm font-semibold text-white shadow-glow-garnet hover:shadow-glow-garnet-lg hover:-translate-y-0.5 transition-all duration-200">
                Start Practicing <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 rounded-xl border border-navy-200 dark:border-navy-700 px-6 py-3 text-sm font-semibold text-navy-700 dark:text-navy-200 hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors">
                See how scoring works
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-6">
              {SCORECARD.slice(0, 4).map((s) => (
                <Link key={s.title} to={s.to} className="group flex flex-col items-center gap-1.5">
                  <span className="w-9 h-9 rounded-lg bg-navy-900 dark:bg-navy-800 flex items-center justify-center group-hover:bg-garnet-600 transition-colors">
                    <s.icon size={16} className="text-white" />
                  </span>
                  <span className="text-[11px] text-navy-500 dark:text-navy-400 group-hover:text-garnet-500 transition-colors">{s.title.split(" ")[0]}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right: signature — the instrument panel */}
          <div className="lg:col-span-6 animate-risein" style={{ animationDelay: "0.12s" }}>
            <div className="relative rounded-[28px] bg-navy-950 shadow-panel p-5 sm:p-6 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-navy-400 font-semibold">Candidate Readiness</p>
                  <p className="font-display text-xl font-semibold text-white mt-0.5">Panel — Live Scorecard</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-2xl font-semibold text-gold-400">1642</p>
                  <p className="text-[11px] text-mint-400 font-medium">Elo · +18 this week</p>
                </div>
              </div>

              {/* Radar */}
              <div className="relative max-w-[280px] mx-auto lg:max-w-[260px]">
                <svg viewBox="0 0 320 320" className="w-full h-auto overflow-visible">
                  <defs>
                    <filter id="neonGlow" x="-60%" y="-60%" width="220%" height="220%">
                      <feGaussianBlur stdDeviation="5" result="blur1" />
                      <feFlood floodColor="#8B5CF6" floodOpacity="0.9" result="color" />
                      <feComposite in="color" in2="blur1" operator="in" result="glow" />
                      <feMerge>
                        <feMergeNode in="glow" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {[OUTER, RING_66, RING_33].map((ring, i) => (
                    <polygon key={i} points={poly(ring)} fill="none" stroke="#2A4470" strokeWidth="1" opacity={0.6} />
                  ))}
                  {OUTER.map((v, i) => (
                    <line key={i} x1={CENTER[0]} y1={CENTER[1]} x2={v[0]} y2={v[1]} stroke="#2A4470" strokeWidth="1" opacity={0.6} />
                  ))}

                  <polygon
                    points={poly(DATA_POINTS)}
                    fill="rgba(196,41,63,0.22)"
                    stroke="#8B5CF6"
                    strokeWidth="2"
                    strokeDasharray="700"
                    filter="url(#neonGlow)"
                    className="animate-drawin"
                  />
                  {/* soft ambient pulse once the draw-in settles */}
                  <polygon
                    points={poly(DATA_POINTS)}
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="1.5"
                    filter="url(#neonGlow)"
                    className="animate-neonpulse"
                    opacity={0.7}
                  />

                  {DATA_POINTS.map((p, i) => (
                    <g key={i}>
                      {/* invisible larger hit-area for easier hover */}
                      <circle
                        cx={p[0]} cy={p[1]} r="14" fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoverAxis(i)}
                        onMouseLeave={() => setHoverAxis((cur) => (cur === i ? null : cur))}
                      />
                      <circle
                        cx={p[0]} cy={p[1]}
                        r={hoverAxis === i ? 6 : 4}
                        fill="#8B5CF6"
                        stroke="#fff" strokeWidth={hoverAxis === i ? 1.5 : 0}
                        filter={hoverAxis === i ? "url(#neonGlow)" : undefined}
                        className="transition-all duration-150 pointer-events-none"
                      />
                    </g>
                  ))}

                  {LABEL_POS.map((l, i) => (
                    <text
                      key={i}
                      x={l.x} y={l.y} textAnchor={l.anchor}
                      className={`transition-colors duration-150 ${hoverAxis === i ? "fill-garnet-400" : "fill-navy-300"}`}
                      style={{ font: "600 10px Inter, sans-serif", letterSpacing: "0.04em", textTransform: "uppercase" }}
                    >
                      {AXES[i].label}
                    </text>
                  ))}
                </svg>

                {/* Tooltip */}
                {hoverAxis !== null && (
                  <div
                    className="absolute z-10 pointer-events-none rounded-lg bg-navy-800 border border-navy-600 px-2.5 py-1.5 text-xs shadow-lg animate-risein"
                    style={{
                      left: `${(DATA_POINTS[hoverAxis][0] / 320) * 100}%`,
                      top: `${(DATA_POINTS[hoverAxis][1] / 320) * 100}%`,
                      transform: "translate(-50%, -135%)",
                    }}
                  >
                    <p className="font-semibold text-white">{AXES[hoverAxis].label}</p>
                    <p className="font-mono text-gold-400">{Math.round(AXES[hoverAxis].value * 100)}<span className="text-navy-400">/100</span></p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-navy-800 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-mint-400">
                  <Flame size={13} /> 12-day streak
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-400">
                  <Trophy size={13} /> Top 5% this month
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- SCORECARD / ROUNDS ---------------- */}
      <section className="bg-white dark:bg-navy-900 border-y border-navy-100 dark:border-navy-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-garnet-500 mb-3">What the panel measures</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white mb-10 max-w-2xl">
            Four categories, one readiness score — mapped straight from the radar above.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SCORECARD.map((s) => (
              <Link key={s.title} to={s.to} className="group rounded-2xl border border-navy-100 dark:border-navy-800 p-5 hover:border-garnet-400 hover:shadow-card-hover transition-all">
                <span className="w-10 h-10 rounded-lg bg-navy-900 dark:bg-navy-800 flex items-center justify-center mb-4 group-hover:bg-garnet-600 transition-colors">
                  <s.icon size={17} className="text-white" />
                </span>
                <h3 className="font-display font-semibold text-navy-900 dark:text-gray-100 mb-1.5">{s.title}</h3>
                <p className="text-sm text-navy-500 dark:text-navy-400 leading-relaxed">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FEATURES ---------------- */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-xs font-semibold uppercase tracking-wider text-garnet-500 mb-3">Under the panel</p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white mb-10 max-w-2xl">
          Every reading on the instrument traces back to a rule you can name.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative rounded-2xl bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover hover:border-transparent"
            >
              {/* gradient wash that fades in on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-garnet-500/[0.07] via-transparent to-gold-400/[0.06]" />
              {/* gradient border glow */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: "inset 0 0 0 1px rgba(196,41,63,0.35)" }} />

              <div className="relative w-10 h-10 rounded-lg bg-garnet-500/10 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:bg-garnet-500/15">
                <f.icon size={18} className="text-garnet-500" />
              </div>
              <h3 className="relative font-display font-semibold text-navy-900 dark:text-gray-100 mb-1">{f.title}</h3>
              <p className="relative text-sm text-navy-500 dark:text-navy-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section className="relative overflow-hidden bg-navy-950">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
            Put your readiness on the panel.
          </h2>
          <p className="text-navy-300 mb-8 max-w-xl mx-auto">
            Register, take your first adaptive round, and watch the radar fill in from there.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-cta-gradient hover:bg-cta-gradient-hover px-7 py-3.5 text-base font-semibold text-white shadow-glow-garnet hover:shadow-glow-garnet-lg hover:-translate-y-0.5 transition-all duration-200">
            Create free account <ArrowRight size={16} />
          </Link>
          <p className="mt-4 text-xs text-navy-500">No credit card. No external AI subscription. Runs on your own database.</p>
        </div>
      </section>
    </div>
  );
}
