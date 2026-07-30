import React, { useEffect, useRef, useState } from "react";
import { api } from "../services/api";

// A freehand + shape + arrow-connector canvas whiteboard for system
// design sketches. Synced in real time via `whiteboard-*` socket events.
// Custom, dependency-free implementation.

const SHAPE_TEMPLATES = [
  { type: "ec2", label: "EC2 / VM", icon: "🖥️", color: "#fef3c7", border: "#d97706" },
  { type: "s3", label: "S3 / Storage", icon: "🪣", color: "#dbeafe", border: "#2563eb" },
  { type: "lambda", label: "Lambda / Function", icon: "λ", color: "#fce7f3", border: "#db2777" },
  { type: "db", label: "Database", icon: "🗄️", color: "#dcfce7", border: "#16a34a" },
  { type: "lb", label: "Load Balancer", icon: "⚖️", color: "#ede9fe", border: "#7c3aed" },
  { type: "queue", label: "Queue / Broker", icon: "📨", color: "#ffe4e6", border: "#e11d48" },
  { type: "vpc", label: "VPC / Network", icon: "🌐", color: "#e0f2fe", border: "#0284c7" },
  { type: "client", label: "Client / User", icon: "👤", color: "#f3f4f6", border: "#4b5563" },
];

const SHAPE_W = 130;
const SHAPE_H = 68;
const CANVAS_W = 1100;
const CANVAS_H = 620;

export default function Whiteboard({ socket, roomId, initialStrokes = [], initialShapes = [], initialConnectors = [] }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);
  const draggingShape = useRef(null);
  const currentStroke = useRef(null);
  const shapesRef = useRef([...initialShapes]);
  const connectorsRef = useRef([...initialConnectors]);
  const connectFromRef = useRef(null); // shape id currently selected as arrow start
  const [color, setColor] = useState("#4f46e5");
  const [lineWidth, setLineWidth] = useState(2);
  const [mode, setMode] = useState("draw"); // "draw" | "move" | "connect"
  const [connectHint, setConnectHint] = useState("");
  const [review, setReview] = useState(null);
  const [reviewing, setReviewing] = useState(false);

  const drawStrokeOnly = (ctx, stroke) => {
    if (!stroke || stroke.points.length < 2) return;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (const p of stroke.points.slice(1)) ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const roundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const drawShape = (ctx, shape) => {
    const tpl = SHAPE_TEMPLATES.find((t) => t.type === shape.type) || SHAPE_TEMPLATES[0];
    ctx.fillStyle = tpl.color;
    ctx.strokeStyle = connectFromRef.current === shape.id ? "#4f46e5" : tpl.border;
    ctx.lineWidth = connectFromRef.current === shape.id ? 3 : 2;
    roundRect(ctx, shape.x, shape.y, SHAPE_W, SHAPE_H, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#1f2937";
    ctx.font = "22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(tpl.icon, shape.x + SHAPE_W / 2, shape.y + 28);
    ctx.font = "12px sans-serif";
    ctx.fillText(shape.label || tpl.label, shape.x + SHAPE_W / 2, shape.y + 50);
  };

  const shapeCenter = (s) => ({ x: s.x + SHAPE_W / 2, y: s.y + SHAPE_H / 2 });

  // Computes where a line from shape A's center to shape B's center
  // crosses shape A's rectangular border — so arrows start/end at the
  // edge of each box, not inside them.
  const edgePoint = (shape, towards) => {
    const c = shapeCenter(shape);
    const dx = towards.x - c.x;
    const dy = towards.y - c.y;
    if (dx === 0 && dy === 0) return c;
    const halfW = SHAPE_W / 2;
    const halfH = SHAPE_H / 2;
    const scale = 1 / Math.max(Math.abs(dx) / halfW, Math.abs(dy) / halfH);
    return { x: c.x + dx * scale, y: c.y + dy * scale };
  };

  const drawArrowhead = (ctx, from, to) => {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const size = 10;
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - size * Math.cos(angle - Math.PI / 6), to.y - size * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(to.x - size * Math.cos(angle + Math.PI / 6), to.y - size * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  };

  const drawConnector = (ctx, connector) => {
    const from = shapesRef.current.find((s) => s.id === connector.fromShapeId);
    const to = shapesRef.current.find((s) => s.id === connector.toShapeId);
    if (!from || !to) return;
    const toCenter = shapeCenter(to);
    const fromCenter = shapeCenter(from);
    const start = edgePoint(from, toCenter);
    const end = edgePoint(to, fromCenter);

    ctx.strokeStyle = connector.color || "#4b5563";
    ctx.fillStyle = connector.color || "#4b5563";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    drawArrowhead(ctx, start, end);
  };

  const redrawAll = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    initialStrokes.forEach((s) => drawStrokeOnly(ctx, s));
    connectorsRef.current.forEach((c) => drawConnector(ctx, c));
    shapesRef.current.forEach((s) => drawShape(ctx, s));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;
    redrawAll();

    const handleRemoteStroke = (stroke) => drawStrokeOnly(ctxRef.current, stroke);
    const handleClear = () => { shapesRef.current = []; connectorsRef.current = []; redrawAll(); };
    const handleShapeAdd = (shape) => { shapesRef.current.push(shape); redrawAll(); };
    const handleShapeMove = ({ id, x, y }) => {
      const s = shapesRef.current.find((sh) => sh.id === id);
      if (s) { s.x = x; s.y = y; redrawAll(); }
    };
    const handleConnector = (connector) => { connectorsRef.current.push(connector); redrawAll(); };

    socket?.on("whiteboard-draw", handleRemoteStroke);
    socket?.on("whiteboard-clear", handleClear);
    socket?.on("whiteboard-shape", handleShapeAdd);
    socket?.on("whiteboard-shape-move", handleShapeMove);
    socket?.on("whiteboard-connector", handleConnector);
    return () => {
      socket?.off("whiteboard-draw", handleRemoteStroke);
      socket?.off("whiteboard-clear", handleClear);
      socket?.off("whiteboard-shape", handleShapeAdd);
      socket?.off("whiteboard-shape-move", handleShapeMove);
      socket?.off("whiteboard-connector", handleConnector);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    // Scale from displayed (CSS) size back to canvas coordinate space,
    // since the canvas renders larger than its CSS width on most screens.
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const shapeAtPos = (pos) =>
    shapesRef.current.find((s) => pos.x >= s.x && pos.x <= s.x + SHAPE_W && pos.y >= s.y && pos.y <= s.y + SHAPE_H);

  const handleDown = (e) => {
    const pos = getPos(e);
    const hit = shapeAtPos(pos);

    if (mode === "connect") {
      if (!hit) return;
      if (!connectFromRef.current) {
        connectFromRef.current = hit.id;
        setConnectHint(`Selected "${hit.label}" — now click the shape to connect it to.`);
        redrawAll();
      } else if (connectFromRef.current !== hit.id) {
        const connector = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          fromShapeId: connectFromRef.current,
          toShapeId: hit.id,
          color: "#4b5563",
        };
        connectorsRef.current.push(connector);
        socket?.emit("whiteboard-connector", { roomId, connector });
        connectFromRef.current = null;
        setConnectHint("Connected! Click a shape to start another arrow.");
        redrawAll();
      }
      return;
    }

    if (hit && mode === "move") {
      draggingShape.current = { id: hit.id, offsetX: pos.x - hit.x, offsetY: pos.y - hit.y };
      return;
    }
    if (mode !== "draw") return;
    drawing.current = true;
    currentStroke.current = { color, width: lineWidth, points: [pos] };
  };

  const handleMove = (e) => {
    const pos = getPos(e);
    if (draggingShape.current) {
      const s = shapesRef.current.find((sh) => sh.id === draggingShape.current.id);
      if (s) {
        s.x = pos.x - draggingShape.current.offsetX;
        s.y = pos.y - draggingShape.current.offsetY;
        redrawAll();
      }
      return;
    }
    if (!drawing.current) return;
    currentStroke.current.points.push(pos);
    const pts = currentStroke.current.points;
    if (pts.length >= 2) {
      const ctx = ctxRef.current;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
    }
  };

  const handleUp = () => {
    if (draggingShape.current) {
      const s = shapesRef.current.find((sh) => sh.id === draggingShape.current.id);
      if (s) socket?.emit("whiteboard-shape-move", { roomId, id: s.id, x: s.x, y: s.y });
      draggingShape.current = null;
      return;
    }
    if (!drawing.current) return;
    drawing.current = false;
    if (currentStroke.current && currentStroke.current.points.length > 1) {
      socket?.emit("whiteboard-draw", { roomId, stroke: currentStroke.current });
    }
    currentStroke.current = null;
  };

  const addShape = (type) => {
    const tpl = SHAPE_TEMPLATES.find((t) => t.type === type);
    const shape = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type, label: tpl.label,
      x: 40 + Math.random() * (CANVAS_W - SHAPE_W - 80),
      y: 40 + Math.random() * (CANVAS_H - SHAPE_H - 80),
    };
    shapesRef.current.push(shape);
    redrawAll();
    socket?.emit("whiteboard-shape", { roomId, shape });
  };

  const clearBoard = () => {
    shapesRef.current = [];
    connectorsRef.current = [];
    connectFromRef.current = null;
    redrawAll();
    socket?.emit("whiteboard-clear", { roomId });
  };

  const setModeAndResetConnect = (m) => {
    connectFromRef.current = null;
    setConnectHint(m === "connect" ? "Click a shape to start an arrow, then click another shape to connect it." : "");
    setMode(m);
    redrawAll();
  };

  const runReview = async () => {
    setReviewing(true);
    try {
      const result = await api.reviewArchitecture(shapesRef.current, connectorsRef.current);
      setReview(result);
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        {SHAPE_TEMPLATES.map((t) => (
          <button
            key={t.type}
            onClick={() => addShape(t.type)}
            title={`Add ${t.label}`}
            className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-primary-500 flex items-center gap-1"
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-2">
        <button
          onClick={() => setModeAndResetConnect("draw")}
          className={`badge cursor-pointer !text-xs ${mode === "draw" ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600"}`}
        >
          ✏️ Draw
        </button>
        <button
          onClick={() => setModeAndResetConnect("move")}
          className={`badge cursor-pointer !text-xs ${mode === "move" ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600"}`}
        >
          🖱️ Move
        </button>
        <button
          onClick={() => setModeAndResetConnect("connect")}
          className={`badge cursor-pointer !text-xs ${mode === "connect" ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600"}`}
        >
          ➡️ Connect
        </button>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
        <input type="range" min="1" max="10" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} />
        <button onClick={runReview} disabled={reviewing} className="btn-secondary !py-1 !px-3 !text-xs ml-auto">
          {reviewing ? "Reviewing..." : "🔍 AI Architecture Review"}
        </button>
        <button onClick={clearBoard} className="btn-outline !py-1 !px-3 !text-xs">Clear Board</button>
      </div>

      {connectHint && mode === "connect" && (
        <p className="text-xs text-primary-600 mb-2">{connectHint}</p>
      )}

      {review && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-3 mb-2 bg-gray-50 dark:bg-gray-800/60">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">Architecture Score: {review.score}/100</p>
            <button onClick={() => setReview(null)} className="text-gray-400 hover:text-gray-600 text-xs">✕ Close</button>
          </div>
          <ul className="text-sm space-y-1.5">
            {review.findings.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={`badge !text-[10px] shrink-0 ${
                  f.severity === "High" ? "bg-red-100 text-red-700" :
                  f.severity === "Medium" ? "bg-orange-100 text-orange-700" :
                  f.severity === "Low" ? "bg-yellow-100 text-yellow-700" :
                  f.severity === "Good" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}>{f.severity}</span>
                <span className="text-gray-600 dark:text-gray-300">{f.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white w-full h-auto cursor-crosshair touch-none"
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={handleUp}
        onTouchStart={handleDown}
        onTouchMove={handleMove}
        onTouchEnd={handleUp}
      />
      <p className="text-xs text-gray-400 mt-1">
        Click a component above to drop it on the board. <strong>Move</strong> mode drags shapes; <strong>Connect</strong> mode draws an arrow between two shapes (click one, then the other); <strong>Draw</strong> mode is freehand.
      </p>
    </div>
  );
}
