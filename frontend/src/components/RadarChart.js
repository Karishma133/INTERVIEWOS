import React from "react";

/**
 * A dependency-free SVG radar (spider) chart. Takes dimensions like
 * [{ label, value }] with value 0-100, and draws a filled polygon plus
 * axis labels. Used on Scorecard.js for the "Big Five"-style behavioral
 * radar (Problem Solving, Communication, Composure, etc).
 */
export default function RadarChart({ data, size = 320 }) {
  const center = size / 2;
  const radius = size * 0.35;
  const angleStep = (2 * Math.PI) / data.length;

  const pointFor = (value, index) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const labelPointFor = (index) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = radius + 28;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const polygonPoints = data.map((d, i) => pointFor(d.value ?? 0, i)).map((p) => `${p.x},${p.y}`).join(" ");
  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height={size} className="max-w-sm mx-auto">
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={data.map((_, i) => pointFor(level, i)).map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="currentColor"
          className="text-gray-200 dark:text-gray-800"
          strokeWidth="1"
        />
      ))}

      {data.map((_, i) => {
        const p = pointFor(100, i);
        return (
          <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="currentColor" className="text-gray-200 dark:text-gray-800" strokeWidth="1" />
        );
      })}

      <polygon points={polygonPoints} fill="#4f46e5" fillOpacity="0.25" stroke="#4f46e5" strokeWidth="2" />

      {data.map((d, i) => {
        const p = pointFor(d.value ?? 0, i);
        return <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#4f46e5" />;
      })}

      {data.map((d, i) => {
        const p = labelPointFor(i);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-gray-600 dark:fill-gray-300 text-[11px] font-medium"
          >
            {d.label} {d.value != null ? `(${d.value})` : ""}
          </text>
        );
      })}
    </svg>
  );
}
