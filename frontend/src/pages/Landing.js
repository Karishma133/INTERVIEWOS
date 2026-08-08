
import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowRight, Code2, Network, MessageSquare, Brain, Mic2,
  Swords, PenTool, FileText, Trophy, Flame, ShieldCheck,
} from "lucide-react";
import { getCurrentUser } from "../services/api";

const AXES = [
  { key: "dsa", label: "DSA", value: 0.88, icon: Code2 },
  { key: "system", label: "System Design", value: 0.64, icon: Network },
  { key: "behavioral", label: "Behavioral", value: 0.72, icon: MessageSquare },
  { key: "communication", label: "Communication", value: 0.58, icon: Mic2 },
  { key: "aptitude", label: "Aptitude", value: 0.91, icon: Brain },
];

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
    <div className="bg-navy-900 text-white min-h-screen">
      {/* ---------------- HERO (FITS IN 1 FULL SCREEN VIEW) ---------------- */}
      <section className="relative overflow-hidden min-h-[calc(100vh-64px)] flex items-center justify-center py-4 lg:py-6">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Side: Thesis & Actions */}
          <div className="lg:col-span-6 animate-risein flex flex-col justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-300 mb-3.5 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
              Free · No AI subscription required
            </span>

            <h1 className="font-display text-2xl sm:text-3xl xl:text-4xl font-bold tracking-tight leading-tight text-white">
              Your interview readiness,
              <br />
              <span className="text-primary-400">read like an instrument.</span>
            </h1>

            <p className="mt-3.5 text-sm sm:text-base text-navy-200 leading-relaxed max-w-lg">
              Five rounds a real hiring process runs you through — DSA, system design,
              behavioral, communication, aptitude — scored live on one panel, by rules
              you can defend in the room instead of a model you can't.
            </p>

            <div className="mt-5 flex items-center gap-3 flex-wrap">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 hover:bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-glow transition-all active:scale-[0.98]"
              >
                Start Practicing <ArrowRight size={15} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-navy-700 bg-navy-800/60 px-5 py-2.5 text-sm font-medium text-navy-200 hover:text-white hover:bg-navy-800 transition-colors"
              >
                See how scoring works
              </Link>
            </div>

            {/* Quick Round Icons */}
            <div className="mt-6 flex items-center gap-5">
              {SCORECARD.slice(0, 4).map((s) => (
                <Link key={s.title} to={s.to} className="group flex flex-col items-center gap-1">
                  <span className="w-8 h-8 rounded-lg bg-navy-800 border border-navy-700/60 flex items-center justify-center group-hover:bg-primary-500 group-hover:border-primary-500 transition-colors">
                    <s.icon size={15} className="text-navy-200 group-hover:text-white" />
                  </span>
                  <span className="text-[10px] text-navy-400 group-hover:text-primary-300 transition-colors">
                    {s.title.split(" ")[0]}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side: Signature Instrument Panel */}
          <div className="lg:col-span-6 animate-risein flex justify-center" style={{ animationDelay: "0.12s" }}>
            <div className="relative w-full max-w-[440px] rounded-2xl bg-navy-800 border border-navy-700/80 shadow-panel p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-navy-400 font-semibold">Candidate Readiness</p>
                  <p className="font-display text-lg font-semibold text-white">Panel — Live Scorecard</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xl font-bold text-gold-400">1642</p>
                  <p className="text-[10px] text-mint-400 font-medium">Elo · +18 this week</p>
                </div>
              </div>

              {/* Radar Svg Box */}
              <div className="relative max-w-[270px] mx-auto">
                <svg viewBox="0 0 320 320" className="w-full h-auto overflow-visible">
                  <defs>
                    <filter id="neonGlow" x="-60%" y="-60%" width="220%" height="220%">
                      <feGaussianBlur stdDeviation="5" result="blur1" />
                      <feFlood floodColor="#6366F1" floodOpacity="0.9" result="color" />
                      <feComposite in="color" in2="blur1" operator="in" result="glow" />
                      <feMerge>
                        <feMergeNode in="glow" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {[OUTER, RING_66, RING_33].map((ring, i) => (
                    <polygon key={i} points={poly(ring)} fill="none" stroke="#334155" strokeWidth="1" opacity={0.6} />
                  ))}
                  {OUTER.map((v, i) => (
                    <line key={i} x1={CENTER[0]} y1={CENTER[1]} x2={v[0]} y2={v[1]} stroke="#334155" strokeWidth="1" opacity={0.6} />
                  ))}

                  <polygon
                    points={poly(DATA_POINTS)}
                    fill="rgba(99,102,241,0.22)"
                    stroke="#6366F1"
                    strokeWidth="2"
                    strokeDasharray="700"
                    filter="url(#neonGlow)"
                    className="animate-drawin"
                  />
                  <polygon
                    points={poly(DATA_POINTS)}
                    fill="none"
                    stroke="#6366F1"
                    strokeWidth="1.5"
                    filter="url(#neonGlow)"
                    className="animate-neonpulse"
                    opacity={0.7}
                  />

                  {DATA_POINTS.map((p, i) => (
                    <g key={i}>
                      <circle
                        cx={p[0]} cy={p[1]} r="12" fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoverAxis(i)}
                        onMouseLeave={() => setHoverAxis((cur) => (cur === i ? null : cur))}
                      />
                      <circle
                        cx={p[0]} cy={p[1]}
                        r={hoverAxis === i ? 5 : 3.5}
                        fill="#6366F1"
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
                      className={`transition-colors duration-150 ${hoverAxis === i ? "fill-primary-300 font-bold" : "fill-navy-400"}`}
                      style={{ font: "600 9.5px Inter, sans-serif", letterSpacing: "0.04em", textTransform: "uppercase" }}
                    >
                      {AXES[i].label}
                    </text>
                  ))}
                </svg>

                {/* Tooltip */}
                {hoverAxis !== null && (
                  <div
                    className="absolute z-10 pointer-events-none rounded-lg bg-navy-900 border border-navy-700 px-2.5 py-1.5 text-xs shadow-panel animate-risein"
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

              <div className="mt-3 pt-3 border-t border-navy-700/80 flex items-center justify-between">
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
      <section className="bg-navy-950/60 border-y border-navy-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-400 mb-2">What the panel measures</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-8 max-w-2xl">
            Four categories, one readiness score — mapped straight from the radar above.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SCORECARD.map((s) => (
              <Link key={s.title} to={s.to} className="group rounded-xl bg-navy-800 border border-navy-700 p-4 hover:border-primary-500 hover:shadow-glow transition-all">
                <span className="w-9 h-9 rounded-lg bg-navy-900 border border-navy-700/80 flex items-center justify-center mb-3 group-hover:bg-primary-500 group-hover:border-primary-500 transition-colors">
                  <s.icon size={16} className="text-navy-200 group-hover:text-white" />
                </span>
                <h3 className="font-display font-semibold text-white mb-1">{s.title}</h3>
                <p className="text-xs text-navy-400 leading-relaxed">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FEATURES ---------------- */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-400 mb-2">Under the panel</p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-8 max-w-2xl">
          Every reading on the instrument traces back to a rule you can name.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative rounded-xl bg-navy-800 border border-navy-700 p-4 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary-500/50 hover:shadow-glow"
            >
              <div className="relative w-9 h-9 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-3 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                <f.icon size={17} className="text-primary-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-display font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-xs text-navy-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section className="relative overflow-hidden bg-navy-950 border-t border-navy-800 py-16">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
            Put your readiness on the panel.
          </h2> 
          <p className="text-sm text-navy-400 mb-6 max-w-xl mx-auto">
            Register, take your first adaptive round, and watch the radar fill in from there.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 hover:bg-primary-600 px-6 py-3 text-sm font-medium text-white shadow-glow transition-all active:scale-[0.98]"
          >
            Create free account <ArrowRight size={15} />
          </Link>
          <p className="mt-3 text-xs text-navy-500">No credit card. No external AI subscription. Runs on your own database.</p>
        </div>
      </section>
    </div>
  );
}
