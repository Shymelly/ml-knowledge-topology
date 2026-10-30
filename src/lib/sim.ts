import type { Layer, LayerId, Topic } from "../types";

export interface SimNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  layer: LayerId;
  r: number;
}

export const COL_W = 250;
export const ROW_H = 54;
export const BAND_GAP = 78;
export const ORIGIN_X = 130;
export const ORIGIN_Y = 86;

export function layoutSize(layers: Layer[], topics: Topic[]): { width: number; height: number } {
  const maxCol = Math.max(...layers.map((l) => l.column));
  const colHeights = new Map<number, number>();
  for (const layer of layers) {
    const n = topics.filter((t) => t.layer === layer.id).length;
    colHeights.set(layer.column, (colHeights.get(layer.column) ?? ORIGIN_Y) + n * ROW_H + BAND_GAP);
  }
  let height = 400;
  for (const h of colHeights.values()) height = Math.max(height, h);
  return { width: ORIGIN_X + (maxCol + 1) * COL_W, height };
}

export function createNodes(layers: Layer[], topics: Topic[]): SimNode[] {
  const buckets = new Map<LayerId, Topic[]>();
  for (const t of topics) {
    const list = buckets.get(t.layer) ?? [];
    list.push(t);
    buckets.set(t.layer, list);
  }

  const byCol = new Map<number, Layer[]>();
  for (const layer of layers) {
    const list = byCol.get(layer.column) ?? [];
    list.push(layer);
    byCol.set(layer.column, list);
  }

  const nodes: SimNode[] = [];
  for (const [col, colLayers] of byCol) {
    colLayers.sort((a, b) => a.band - b.band);
    let yCursor = ORIGIN_Y;
    for (const layer of colLayers) {
      const list = buckets.get(layer.id) ?? [];
      list.forEach((t, i) => {
        const tx = ORIGIN_X + col * COL_W;
        const ty = yCursor + i * ROW_H;
        nodes.push({
          id: t.id,
          x: tx,
          y: ty,
          vx: 0,
          vy: 0,
          tx,
          ty,
          layer: t.layer,
          r: 7,
        });
      });
      yCursor += list.length * ROW_H + BAND_GAP;
    }
  }
  return nodes;
}

export function tick(nodes: SimNode[], dt = 1) {
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    a.vx += (a.tx - a.x) * 0.045;
    a.vy += (a.ty - a.y) * 0.045;

    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist2 = dx * dx + dy * dy || 1;
      const min = 34;
      if (dist2 < min * min) {
        const dist = Math.sqrt(dist2);
        const f = ((min - dist) / dist) * 0.08;
        a.vx += dx * f;
        a.vy += dy * f;
        b.vx -= dx * f;
        b.vy -= dy * f;
      }
    }

    a.vx *= 0.8;
    a.vy *= 0.8;
    a.x += a.vx * dt;
    a.y += a.vy * dt;
  }
}
