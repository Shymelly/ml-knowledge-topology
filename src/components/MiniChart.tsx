import { useMemo } from "react";
import { buildChart, type ChartData, type Point } from "../lib/charts";
import type { ChartPreset } from "../types";

interface Props {
  preset: ChartPreset;
  title: string;
  caption: string;
}

const W = 340;
const H = 188;
const P = { l: 36, r: 12, t: 18, b: 28 };

export default function MiniChart({ preset, title, caption }: Props) {
  const data = useMemo(() => buildChart(preset), [preset]);
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
        <text x={P.l} y={14} fill="#9a9384" fontSize="11">
          {title}
        </text>
        {data.kind === "scatter" && <Scatter data={data} />}
        {data.kind === "line" && <Lines data={data} />}
        {data.kind === "bars" && <Bars data={data} />}
        {data.kind === "heat" && <Heat data={data} />}
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

function bounds(pts: { x: number; y: number }[]) {
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const dx = maxX - minX || 1;
  const dy = maxY - minY || 1;
  return { minX: minX - dx * 0.08, maxX: maxX + dx * 0.08, minY: minY - dy * 0.12, maxY: maxY + dy * 0.12 };
}

function sx(x: number, b: ReturnType<typeof bounds>) {
  return P.l + ((x - b.minX) / (b.maxX - b.minX)) * (W - P.l - P.r);
}
function sy(y: number, b: ReturnType<typeof bounds>) {
  return P.t + (1 - (y - b.minY) / (b.maxY - b.minY)) * (H - P.t - P.b);
}

function Scatter({
  data,
}: {
  data: Extract<ChartData, { kind: "scatter" }>;
}) {
  const extra: Point[] = [];
  for (const line of data.lines ?? []) extra.push(...line);
  for (const b of data.bands ?? []) extra.push({ x: b.x, y: b.lo }, { x: b.x, y: b.hi });
  const b = bounds([...data.points, ...extra]);
  const band = data.bands;
  const bandD =
    band &&
    `M ${band.map((p) => `${sx(p.x, b)} ${sy(p.hi, b)}`).join(" L ")} L ${[...band]
      .reverse()
      .map((p) => `${sx(p.x, b)} ${sy(p.lo, b)}`)
      .join(" L ")} Z`;
  return (
    <g>
      {bandD && <path d={bandD} fill="rgba(212,188,125,0.18)" />}
      {band && (
        <path
          d={`M ${band.map((p) => `${sx(p.x, b)} ${sy(p.mid, b)}`).join(" L ")}`}
          fill="none"
          stroke="#d4bc7d"
          strokeWidth="1.4"
        />
      )}
      {(data.lines ?? []).map((line, i) => (
        <path
          key={i}
          d={`M ${line.map((p) => `${sx(p.x, b)} ${sy(p.y, b)}`).join(" L ")}`}
          fill="none"
          stroke="rgba(232,224,204,0.55)"
          strokeWidth="1.2"
        />
      ))}
      {data.points.map((p, i) => (
        <circle key={i} cx={sx(p.x, b)} cy={sy(p.y, b)} r={p.c === "#d4bc7d" ? 4 : 3.2} fill={p.c ?? "#d4bc7d"} />
      ))}
    </g>
  );
}

function Lines({ data }: { data: Extract<ChartData, { kind: "line" }> }) {
  const pts = data.series.flatMap((s) => s.ys.map((y, i) => ({ x: data.xs[i], y })));
  const b = bounds(pts);
  return (
    <g>
      {data.series.map((s) => (
        <g key={s.name}>
          <path
            d={`M ${s.ys.map((y, i) => `${sx(data.xs[i], b)} ${sy(y, b)}`).join(" L ")}`}
            fill="none"
            stroke={s.color}
            strokeWidth="1.6"
          />
        </g>
      ))}
      {data.series.map((s, i) => (
        <text key={s.name} x={W - P.r - 4} y={28 + i * 14} fill={s.color} fontSize="10" textAnchor="end">
          {s.name}
        </text>
      ))}
    </g>
  );
}

function Bars({ data }: { data: Extract<ChartData, { kind: "bars" }> }) {
  const max = Math.max(...data.items.map((it) => Math.abs(it.value)), 0.001);
  const n = data.items.length;
  const gap = 8;
  const usable = W - P.l - P.r;
  const bw = (usable - gap * (n + 1)) / n;
  const base = H - P.b;
  const top = P.t + 8;
  const span = base - top;
  return (
    <g>
      {data.items.map((it, i) => {
        const h = (Math.abs(it.value) / max) * span * 0.92;
        const x = P.l + gap + i * (bw + gap);
        const y = it.value >= 0 ? base - h : base;
        return (
          <g key={it.name}>
            <rect x={x} y={y} width={bw} height={h} fill={it.color} rx="3" />
            <text x={x + bw / 2} y={H - 8} fill="#9a9384" fontSize="9" textAnchor="middle">
              {it.name}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function Heat({ data }: { data: Extract<ChartData, { kind: "heat" }> }) {
  const rows = data.matrix.length;
  const cols = data.matrix[0].length;
  const left = P.l + 18;
  const top = P.t + 8;
  const cw = (W - left - P.r) / cols;
  const ch = (H - top - P.b) / rows;
  const flat = data.matrix.flat();
  const max = Math.max(...flat, 0.001);
  return (
    <g>
      {data.matrix.map((row, r) =>
        row.map((v, c) => {
          const a = 0.18 + 0.82 * (v / max);
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={left + c * cw + 2}
                y={top + r * ch + 2}
                width={cw - 4}
                height={ch - 4}
                fill={`rgba(212,188,125,${a})`}
                rx="3"
              />
              <text
                x={left + c * cw + cw / 2}
                y={top + r * ch + ch / 2 + 4}
                fill="#1a1814"
                fontSize="10"
                textAnchor="middle"
              >
                {Number.isInteger(v) ? v : v.toFixed(2)}
              </text>
            </g>
          );
        }),
      )}
      {data.xTicks.map((t, i) => (
        <text key={t} x={left + i * cw + cw / 2} y={H - 8} fill="#9a9384" fontSize="9" textAnchor="middle">
          {t}
        </text>
      ))}
      {data.yTicks.map((t, i) => (
        <text key={t} x={P.l - 2} y={top + i * ch + ch / 2 + 3} fill="#9a9384" fontSize="9" textAnchor="end">
          {t}
        </text>
      ))}
    </g>
  );
}
