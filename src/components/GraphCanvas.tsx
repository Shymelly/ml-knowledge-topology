import { useEffect, useRef } from "react";
import { edges, layerColor, layers, topicMap } from "../data/knowledge";
import { createNodes, layoutSize, type SimNode } from "../lib/sim";
import type { LayerId, ProgressMap } from "../types";

interface Props {
  selectedId: string | null;
  activeLayer: LayerId | "all";
  progress: ProgressMap;
  query: string;
  onSelect: (id: string) => void;
}

export default function GraphCanvas({
  selectedId,
  activeLayer,
  progress,
  query,
  onSelect,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const cam = useRef({ x: 24, y: 16, k: 0.5 });
  const fitted = useRef(false);
  const drag = useRef({
    mode: "none" as "none" | "pending" | "pan",
    lx: 0,
    ly: 0,
    sx: 0,
    sy: 0,
  });
  const hoverRef = useRef<string | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const viewRef = useRef({ selectedId, activeLayer, progress, query });
  viewRef.current = { selectedId, activeLayer, progress, query };
  const fly = useRef<{
    fromX: number;
    fromY: number;
    fromK: number;
    toX: number;
    toY: number;
    toK: number;
    t: number;
  } | null>(null);
  const lastSid = useRef<string | null>(null);
  const lastLayer = useRef<LayerId | "all" | null>(null);
  const skipFirst = useRef(true);
  const cmdRef = useRef<"fit-all" | "fit-now" | null>(null);

  useEffect(() => {
    nodesRef.current = createNodes();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;

    const fitCam = (nodes: SimNode[], rect: DOMRect, pad = 90, maxK = 1.35) => {
      if (!nodes.length) return cam.current;
      const xs = nodes.map((n) => n.x);
      const ys = nodes.map((n) => n.y);
      const minX = Math.min(...xs) - pad;
      const maxX = Math.max(...xs) + pad + 70;
      const minY = Math.min(...ys) - pad;
      const maxY = Math.max(...ys) + pad;
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const k = Math.min(rect.width / (maxX - minX), rect.height / (maxY - minY), maxK) * 0.9;
      return { x: rect.width / 2 - cx * k, y: rect.height / 2 - cy * k, k };
    };

    const startFly = (to: { x: number; y: number; k: number }) => {
      fly.current = {
        fromX: cam.current.x,
        fromY: cam.current.y,
        fromK: cam.current.k,
        toX: to.x,
        toY: to.y,
        toK: to.k,
        t: 0,
      };
    };

    const neighborhood = (id: string) => {
      const ids = new Set<string>([id]);
      for (const e of edges) {
        if (e.source === id) ids.add(e.target);
        if (e.target === id) ids.add(e.source);
      }
      return nodesRef.current.filter((n) => ids.has(n.id));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!fitted.current && rect.width > 40 && rect.height > 40) {
        const size = layoutSize();
        const k = Math.min(rect.width / size.width, rect.height / size.height) * 0.92;
        cam.current.k = Math.min(Math.max(k, 0.32), 1.1);
        cam.current.x = (rect.width - size.width * cam.current.k) / 2;
        cam.current.y = 18;
        fitted.current = true;
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const toWorld = (px: number, py: number) => {
      const { x, y, k } = cam.current;
      return { x: (px - x) / k, y: (py - y) / k };
    };

    const hit = (px: number, py: number) => {
      const w = toWorld(px, py);
      const worldR = 16 / cam.current.k;
      let best: SimNode | null = null;
      let bestD = worldR;
      for (const n of nodesRef.current) {
        const d = Math.hypot(n.x - w.x, n.y - w.y);
        if (d < bestD) {
          bestD = d;
          best = n;
        }
      }
      return best;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      fly.current = null;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const old = cam.current.k;
      const next = Math.min(2.4, Math.max(0.28, old * (e.deltaY > 0 ? 0.9 : 1.1)));
      const w = toWorld(px, py);
      cam.current.k = next;
      cam.current.x = px - w.x * next;
      cam.current.y = py - w.y * next;
    };

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      drag.current = { mode: "pending", lx: e.clientX, ly: e.clientY, sx: e.clientX, sy: e.clientY };
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const node = hit(e.clientX - rect.left, e.clientY - rect.top);
      hoverRef.current = node?.id ?? null;
      const moved = Math.hypot(e.clientX - drag.current.sx, e.clientY - drag.current.sy);
      if (drag.current.mode === "pending" && moved > 8) {
        drag.current.mode = "pan";
        fly.current = null;
      }
      canvas.style.cursor = node ? "pointer" : drag.current.mode === "pan" ? "grabbing" : "grab";
      if (drag.current.mode === "pan") {
        cam.current.x += e.clientX - drag.current.lx;
        cam.current.y += e.clientY - drag.current.ly;
        drag.current.lx = e.clientX;
        drag.current.ly = e.clientY;
      }
    };
    const onUp = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const node = hit(e.clientX - rect.left, e.clientY - rect.top);
      const wasPan = drag.current.mode === "pan";
      drag.current.mode = "none";
      if (!wasPan && node) onSelectRef.current(node.id);
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);

    const draw = () => {
      if (!running) return;
      const { selectedId: sid, activeLayer: layerFilter, progress: prog, query: qRaw } =
        viewRef.current;
      const rect = canvas.getBoundingClientRect();

      const cmd = cmdRef.current;
      if (fitted.current && (cmd || sid !== lastSid.current || layerFilter !== lastLayer.current)) {
        if (skipFirst.current) {
          skipFirst.current = false;
          lastSid.current = sid;
          lastLayer.current = layerFilter;
        } else if (cmd === "fit-all") {
          cmdRef.current = null;
          startFly(fitCam(nodesRef.current, rect, 70, 1.0));
          lastSid.current = sid;
          lastLayer.current = layerFilter;
        } else if (cmd === "fit-now" && sid) {
          cmdRef.current = null;
          startFly(fitCam(neighborhood(sid), rect, 110, 1.45));
          lastSid.current = sid;
          lastLayer.current = layerFilter;
        } else if (layerFilter !== lastLayer.current) {
          lastLayer.current = layerFilter;
          lastSid.current = sid;
          if (layerFilter === "all") startFly(fitCam(nodesRef.current, rect, 70, 1.0));
          else startFly(fitCam(nodesRef.current.filter((n) => n.layer === layerFilter), rect, 80, 1.4));
        } else if (sid && sid !== lastSid.current) {
          lastSid.current = sid;
          startFly(fitCam(neighborhood(sid), rect, 120, 1.5));
        }
      }

      if (fly.current) {
        fly.current.t = Math.min(1, fly.current.t + 0.07);
        const e = 1 - (1 - fly.current.t) ** 3;
        cam.current.x = fly.current.fromX + (fly.current.toX - fly.current.fromX) * e;
        cam.current.y = fly.current.fromY + (fly.current.toY - fly.current.fromY) * e;
        cam.current.k = fly.current.fromK + (fly.current.toK - fly.current.fromK) * e;
        if (fly.current.t >= 1) fly.current = null;
      }

      const q = qRaw.trim().toLowerCase();
      let neighborSet: Set<string> | null = null;
      if (sid) {
        neighborSet = new Set<string>([sid]);
        for (const e of edges) {
          if (e.source === sid) neighborSet.add(e.target);
          if (e.target === sid) neighborSet.add(e.source);
        }
      }

      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.save();
      ctx.translate(cam.current.x, cam.current.y);
      ctx.scale(cam.current.k, cam.current.k);

      const nodeById = new Map(nodesRef.current.map((n) => [n.id, n]));

      for (const layer of layers) {
        const xs = nodesRef.current.filter((n) => n.layer === layer.id).map((n) => n.x);
        const ys = nodesRef.current.filter((n) => n.layer === layer.id).map((n) => n.y);
        if (!xs.length) continue;
        const minX = Math.min(...xs) - 70;
        const maxX = Math.max(...xs) + 70;
        const minY = Math.min(...ys) - 36;
        const maxY = Math.max(...ys) + 28;
        ctx.fillStyle = "rgba(255,255,255,0.015)";
        ctx.strokeStyle = "rgba(232,224,204,0.06)";
        ctx.lineWidth = 1;
        roundRect(ctx, minX, minY, maxX - minX, maxY - minY, 18);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(154,147,132,0.7)";
        ctx.font = "11px IBM Plex Sans, Noto Sans SC, sans-serif";
        ctx.fillText(layer.name, minX + 10, minY + 16);
      }

      for (const e of edges) {
        const a = nodeById.get(e.source);
        const b = nodeById.get(e.target);
        if (!a || !b) continue;
        const hot = !!sid && (e.source === sid || e.target === sid);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = hot ? "rgba(212,188,125,0.82)" : "rgba(232,224,204,0.06)";
        ctx.lineWidth = hot ? 2.1 : 0.7;
        ctx.stroke();
      }

      for (const n of nodesRef.current) {
        const topic = topicMap[n.id];
        const inLayer = layerFilter === "all" || n.layer === layerFilter;
        const match =
          !q ||
          topic.name.toLowerCase().includes(q) ||
          topic.en.toLowerCase().includes(q) ||
          topic.tags.some((t) => t.toLowerCase().includes(q));
        const related = !neighborSet || neighborSet.has(n.id);
        const dim = !inLayer || !match;
        const selected = n.id === sid;
        const hover = n.id === hoverRef.current;
        const learned = !!prog[n.id];
        const color = layerColor[n.layer];
        const r = Math.max(n.r, 8 / cam.current.k * 0.35);

        ctx.beginPath();
        ctx.arc(n.x, n.y, selected || hover ? r + 3 : r, 0, Math.PI * 2);
        ctx.fillStyle = learned ? color : "#1c221e";
        ctx.globalAlpha = dim ? 0.22 : related ? 1 : 0.55;
        ctx.fill();
        ctx.lineWidth = selected ? 2.6 : 1.4;
        ctx.strokeStyle = color;
        ctx.stroke();

        ctx.fillStyle = learned ? "#0f1210" : "#ece6d8";
        ctx.font = `${selected ? 13 : 12}px IBM Plex Sans, Noto Sans SC, sans-serif`;
        ctx.fillText(topic.name, n.x + 12, n.y + 4);
        ctx.globalAlpha = 1;
      }

      ctx.restore();
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div className="graph-wrap">
      <canvas ref={canvasRef} />
      <div className="graph-tools">
        <button
          className="ghost"
          onClick={() => {
            cmdRef.current = "fit-all";
          }}
        >
          看全图
        </button>
        <button
          className="ghost"
          onClick={() => {
            cmdRef.current = "fit-now";
          }}
        >
          聚焦当前
        </button>
      </div>
      <div className="legend">
        {layers.map((l) => (
          <span key={l.id}>
            <i className="dot" style={{ background: layerColor[l.id] }} />
            {l.name}
          </span>
        ))}
      </div>
      <div className="graph-hint">点击节点弹出学习窗口 · 滚轮缩放 · 拖拽平移</div>
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
