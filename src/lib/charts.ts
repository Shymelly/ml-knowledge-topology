import type { ChartPreset } from "../types";

export type Point = { x: number; y: number; c?: string };

export type ChartData =
  | { kind: "scatter"; points: Point[]; lines?: Point[][]; bands?: { x: number; lo: number; mid: number; hi: number }[] }
  | { kind: "line"; xs: number[]; series: { name: string; color: string; ys: number[] }[] }
  | { kind: "bars"; items: { name: string; value: number; color: string }[] }
  | { kind: "heat"; matrix: number[][]; xTicks: string[]; yTicks: string[] };

const A = "#d4bc7d";
const B = "#8fbf88";
const C = "#c9897a";
const D = "#6b7fd7";
const E = "#4c8dbe";
const F = "#ce7a3a";

function mulberry(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function linspace(a: number, b: number, n: number) {
  return Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
}

function blobs(seed: number, groups: { cx: number; cy: number; n: number; c: string; s?: number }[]): Point[] {
  const rnd = mulberry(seed);
  const pts: Point[] = [];
  for (const g of groups) {
    const s = g.s ?? 0.35;
    for (let i = 0; i < g.n; i++) {
      pts.push({
        x: g.cx + (rnd() + rnd() + rnd() - 1.5) * s,
        y: g.cy + (rnd() + rnd() + rnd() - 1.5) * s,
        c: g.c,
      });
    }
  }
  return pts;
}

export function buildChart(preset: ChartPreset): ChartData {
  const rnd = mulberry(preset.length * 97 + preset.charCodeAt(0));
  switch (preset) {
    case "paradigm-bars":
      return {
        kind: "bars",
        items: [
          { name: "监督", value: 62, color: A },
          { name: "无监督", value: 18, color: B },
          { name: "强化", value: 8, color: C },
          { name: "生成", value: 12, color: D },
        ],
      };
    case "scatter-labeled":
      return {
        kind: "scatter",
        points: blobs(1, [
          { cx: 1.4, cy: 1.2, n: 18, c: B },
          { cx: 3.4, cy: 3.1, n: 18, c: C },
        ]),
      };
    case "scatter-unlabeled":
      return { kind: "scatter", points: blobs(2, [
        { cx: 1.2, cy: 2.8, n: 14, c: "#9a9384" },
        { cx: 3.1, cy: 1.4, n: 16, c: "#9a9384" },
        { cx: 3.6, cy: 3.3, n: 12, c: "#9a9384" },
      ]) };
    case "reward":
      return {
        kind: "line",
        xs: linspace(0, 80, 40),
        series: [{ name: "累计奖励", color: A, ys: linspace(0, 80, 40).map((x) => 8 * Math.log(1 + x) + Math.sin(x / 6) * 1.2) }],
      };
    case "generate": {
      const real = blobs(3, [{ cx: 2, cy: 2, n: 22, c: B, s: 0.5 }]);
      const fake = blobs(4, [{ cx: 2.15, cy: 1.9, n: 18, c: A, s: 0.55 }]);
      return { kind: "scatter", points: [...real, ...fake] };
    }
    case "xy-table":
      return {
        kind: "scatter",
        points: linspace(1, 5, 12).map((x) => ({ x, y: 0.8 * x + 0.6 + (rnd() - 0.5) * 0.4, c: A })),
      };
    case "loss-bowl":
      return {
        kind: "line",
        xs: linspace(-3, 3, 60),
        series: [{ name: "L(θ)", color: C, ys: linspace(-3, 3, 60).map((x) => 0.35 * x * x + 0.4) }],
      };
    case "gd-path": {
      const xs = linspace(-2.8, 0.2, 18);
      return {
        kind: "scatter",
        points: xs.map((x, i) => ({ x, y: 0.4 * x * x + 0.3, c: i === xs.length - 1 ? B : A })),
        lines: [xs.map((x) => ({ x, y: 0.4 * x * x + 0.3 }))],
      };
    }
    case "sgd-noise":
      return {
        kind: "line",
        xs: linspace(0, 40, 41),
        series: [
          { name: "GD", color: B, ys: linspace(0, 40, 41).map((x) => 2.4 * Math.exp(-x / 10) + 0.25) },
          { name: "SGD", color: A, ys: linspace(0, 40, 41).map((x) => 2.4 * Math.exp(-x / 10) + 0.25 + Math.sin(x) * 0.18) },
        ],
      };
    case "grad-layers":
      return {
        kind: "bars",
        items: [
          { name: "L1", value: 0.9, color: D },
          { name: "L2", value: 0.55, color: D },
          { name: "L3", value: 0.28, color: A },
          { name: "L4", value: 0.12, color: C },
        ],
      };
    case "lr-three":
      return {
        kind: "line",
        xs: linspace(0, 30, 31),
        series: [
          { name: "太大", color: C, ys: linspace(0, 30, 31).map((x) => Math.abs(Math.cos(x / 2)) * 1.6 + 0.4) },
          { name: "太小", color: "#9a9384", ys: linspace(0, 30, 31).map((x) => 2 - x * 0.03) },
          { name: "合适", color: B, ys: linspace(0, 30, 31).map((x) => 2 * Math.exp(-x / 7) + 0.2) },
        ],
      };
    case "l2-shrink":
      return {
        kind: "bars",
        items: [
          { name: "w1", value: 2.4, color: C },
          { name: "w1′", value: 1.1, color: B },
          { name: "w2", value: -1.8, color: C },
          { name: "w2′", value: -0.7, color: B },
        ],
      };
    case "overfit-curves":
      return {
        kind: "line",
        xs: linspace(0, 40, 41),
        series: [
          { name: "训练误差", color: B, ys: linspace(0, 40, 41).map((x) => 1.8 * Math.exp(-x / 8) + 0.08) },
          { name: "验证误差", color: C, ys: linspace(0, 40, 41).map((x) => 1.6 * Math.exp(-x / 9) + 0.02 * Math.max(0, x - 18) + 0.22) },
        ],
      };
    case "bias-var":
      return {
        kind: "bars",
        items: [
          { name: "高偏差", value: 0.72, color: C },
          { name: "高方差", value: 0.68, color: A },
          { name: "折中", value: 0.28, color: B },
        ],
      };
    case "feature-scale":
      return {
        kind: "scatter",
        points: linspace(0, 10, 16).map((x) => ({ x, y: 2 + rnd() * 1.2, c: A })),
      };
    case "zscore":
      return {
        kind: "line",
        xs: linspace(-3.2, 3.2, 50),
        series: [{ name: "标准化后", color: E, ys: linspace(-3.2, 3.2, 50).map((x) => Math.exp(-0.5 * x * x) ) }],
      };
    case "split-bars":
      return {
        kind: "bars",
        items: [
          { name: "训练 70%", value: 70, color: B },
          { name: "验证 15%", value: 15, color: A },
          { name: "测试 15%", value: 15, color: D },
        ],
      };
    case "cv-folds":
      return {
        kind: "heat",
        xTicks: ["折1", "折2", "折3", "折4", "折5"],
        yTicks: ["轮1", "轮2", "轮3", "轮4", "轮5"],
        matrix: [
          [1, 0, 0, 0, 0],
          [0, 1, 0, 0, 0],
          [0, 0, 1, 0, 0],
          [0, 0, 0, 1, 0],
          [0, 0, 0, 0, 1],
        ],
      };
    case "sliding":
      return {
        kind: "line",
        xs: linspace(0, 24, 25),
        series: [
          { name: "序列", color: E, ys: linspace(0, 24, 25).map((x) => Math.sin(x / 3) + 0.15 * x / 8) },
          { name: "窗口均值", color: A, ys: linspace(0, 24, 25).map((x) => Math.sin((x - 1.5) / 3) * 0.7 + 0.15 * x / 8) },
        ],
      };
    case "augment":
      return {
        kind: "scatter",
        points: [
          ...blobs(8, [{ cx: 2, cy: 2, n: 8, c: B, s: 0.18 }]),
          ...blobs(9, [{ cx: 2.2, cy: 2.1, n: 10, c: A, s: 0.42 }]),
        ],
      };
    case "reg-family":
      return {
        kind: "scatter",
        points: linspace(0.5, 5, 20).map((x) => ({ x, y: 1.1 * x + 0.4 + (rnd() - 0.5), c: "#c9a227" })),
        lines: [linspace(0.5, 5, 20).map((x) => ({ x, y: 1.1 * x + 0.4 }))],
      };
    case "linreg":
      return {
        kind: "scatter",
        points: linspace(0.4, 5.2, 18).map((x) => ({ x, y: 0.9 * x + 0.7 + (rnd() - 0.5) * 0.7, c: A })),
        lines: [linspace(0.4, 5.2, 18).map((x) => ({ x, y: 0.9 * x + 0.7 }))],
      };
    case "poly":
      return {
        kind: "scatter",
        points: linspace(0.2, 4.8, 16).map((x) => ({ x, y: 0.18 * (x - 2.4) ** 3 + 0.4 * x + (rnd() - 0.5) * 0.35, c: A })),
        lines: [linspace(0.2, 4.8, 40).map((x) => ({ x, y: 0.18 * (x - 2.4) ** 3 + 0.4 * x }))],
      };
    case "ridge":
      return {
        kind: "line",
        xs: linspace(0, 8, 20),
        series: [
          { name: "OLS 震荡", color: C, ys: linspace(0, 8, 20).map((x, i) => 1.2 + Math.sin(x * 1.3) * (0.8 - i * 0.01)) },
          { name: "Ridge 更稳", color: B, ys: linspace(0, 8, 20).map((x) => 1.2 + Math.sin(x * 1.3) * 0.18) },
        ],
      };
    case "lasso-coef":
      return {
        kind: "bars",
        items: [
          { name: "面积", value: 1.6, color: B },
          { name: "地段", value: 0.9, color: B },
          { name: "朝向", value: 0, color: "#4a4740" },
          { name: "楼龄", value: -0.5, color: C },
          { name: "噪声", value: 0, color: "#4a4740" },
        ],
      };
    case "class-blobs":
      return {
        kind: "scatter",
        points: blobs(11, [
          { cx: 1.3, cy: 1.4, n: 16, c: B },
          { cx: 3.5, cy: 3.2, n: 16, c: C },
        ]),
        lines: [[{ x: 0.4, y: 3.6 }, { x: 4.4, y: 0.8 }]],
      };
    case "sigmoid":
      return {
        kind: "line",
        xs: linspace(-6, 6, 50),
        series: [{ name: "σ(z)", color: A, ys: linspace(-6, 6, 50).map((z) => 1 / (1 + Math.exp(-z))) }],
      };
    case "knn":
      return {
        kind: "scatter",
        points: [
          ...blobs(12, [
            { cx: 1.6, cy: 1.7, n: 10, c: B, s: 0.4 },
            { cx: 3.4, cy: 3.1, n: 10, c: C, s: 0.4 },
          ]),
          { x: 2.4, y: 2.3, c: A },
        ],
      };
    case "svm":
      return {
        kind: "scatter",
        points: blobs(13, [
          { cx: 1.2, cy: 1.3, n: 12, c: B, s: 0.32 },
          { cx: 3.5, cy: 3.3, n: 12, c: C, s: 0.32 },
        ]),
        lines: [
          [{ x: 0.5, y: 3.4 }, { x: 4.2, y: 1.0 }],
          [{ x: 0.3, y: 3.9 }, { x: 4.0, y: 1.5 }],
          [{ x: 0.7, y: 2.9 }, { x: 4.4, y: 0.5 }],
        ],
      };
    case "tree":
      return {
        kind: "scatter",
        points: blobs(14, [
          { cx: 1.2, cy: 1.5, n: 10, c: B },
          { cx: 1.3, cy: 3.4, n: 10, c: D },
          { cx: 3.5, cy: 2.2, n: 12, c: C },
        ]),
        lines: [
          [{ x: 2.4, y: 0.4 }, { x: 2.4, y: 4.2 }],
          [{ x: 0.4, y: 2.5 }, { x: 2.4, y: 2.5 }],
        ],
      };
    case "nb-hist":
      return {
        kind: "line",
        xs: linspace(0, 8, 40),
        series: [
          { name: "正常词频", color: B, ys: linspace(0, 8, 40).map((x) => Math.exp(-((x - 2.2) ** 2) / 1.4)) },
          { name: "垃圾词频", color: C, ys: linspace(0, 8, 40).map((x) => Math.exp(-((x - 5.1) ** 2) / 1.6)) },
        ],
      };
    case "bayes-update":
      return {
        kind: "line",
        xs: linspace(0, 10, 40),
        series: [
          { name: "先验", color: "#9a9384", ys: linspace(0, 10, 40).map((x) => Math.exp(-((x - 3) ** 2) / 4) * 0.7) },
          { name: "后验", color: A, ys: linspace(0, 10, 40).map((x) => Math.exp(-((x - 6.2) ** 2) / 1.6)) },
        ],
      };
    case "bayes-net":
      return {
        kind: "bars",
        items: [
          { name: "P(雨)", value: 0.3, color: E },
          { name: "P(湿|雨)", value: 0.9, color: A },
          { name: "P(摔|湿)", value: 0.4, color: C },
        ],
      };
    case "gmm":
      return {
        kind: "scatter",
        points: blobs(15, [
          { cx: 1.5, cy: 1.6, n: 16, c: B, s: 0.45 },
          { cx: 3.4, cy: 3.0, n: 16, c: D, s: 0.55 },
        ]),
      };
    case "gp-band": {
      const xs = linspace(0, 8, 40);
      return {
        kind: "scatter",
        points: [1, 2.5, 4, 6.5].map((x) => ({ x, y: Math.sin(x) + 1.6, c: A })),
        bands: xs.map((x) => {
          const mid = Math.sin(x) + 1.6;
          const w = 0.15 + 0.55 * Math.min(Math.abs(x - 1), Math.abs(x - 2.5), Math.abs(x - 4), Math.abs(x - 6.5));
          return { x, lo: mid - w, mid, hi: mid + w };
        }),
      };
    }
    case "rf-vote":
      return {
        kind: "bars",
        items: [
          { name: "树A", value: 1, color: B },
          { name: "树B", value: 1, color: B },
          { name: "树C", value: 0, color: C },
          { name: "投票", value: 1, color: A },
        ],
      };
    case "boost":
      return {
        kind: "line",
        xs: linspace(0, 20, 21),
        series: [
          { name: "残差", color: C, ys: linspace(0, 20, 21).map((x) => 1.8 * Math.exp(-x / 5) + 0.08) },
          { name: "集成", color: B, ys: linspace(0, 20, 21).map((x) => 0.2 + 1.6 * (1 - Math.exp(-x / 5))) },
        ],
      };
    case "gbdt":
      return {
        kind: "line",
        xs: linspace(0, 12, 13),
        series: [
          { name: "第1棵", color: "#6e6a60", ys: linspace(0, 12, 13).map((x) => 0.4 * Math.sin(x / 2) + 1) },
          { name: "第4棵", color: A, ys: linspace(0, 12, 13).map((x) => 0.7 * Math.sin(x / 2) + 0.2 * Math.sin(x) + 1) },
          { name: "第12棵", color: B, ys: linspace(0, 12, 13).map((x) => Math.sin(x / 2) + 0.25 * Math.sin(x * 1.4) + 1.05) },
        ],
      };
    case "xgb":
      return {
        kind: "bars",
        items: [
          { name: "特征增益", value: 0.42, color: F },
          { name: "覆盖度", value: 0.31, color: A },
          { name: "频率", value: 0.18, color: E },
        ],
      };
    case "kmeans":
      return {
        kind: "scatter",
        points: [
          ...blobs(16, [
            { cx: 1.2, cy: 1.3, n: 12, c: B },
            { cx: 3.5, cy: 1.5, n: 12, c: C },
            { cx: 2.4, cy: 3.4, n: 12, c: D },
          ]),
          { x: 1.2, y: 1.3, c: A },
          { x: 3.5, y: 1.5, c: A },
          { x: 2.4, y: 3.4, c: A },
        ],
      };
    case "dbscan":
      return {
        kind: "scatter",
        points: [
          ...blobs(17, [
            { cx: 1.4, cy: 1.6, n: 18, c: B, s: 0.38 },
            { cx: 3.5, cy: 3.1, n: 16, c: D, s: 0.32 },
          ]),
          { x: 2.6, y: 0.7, c: "#6e6a60" },
          { x: 4.4, y: 1.2, c: "#6e6a60" },
          { x: 0.5, y: 3.6, c: "#6e6a60" },
        ],
      };
    case "hier":
      return {
        kind: "line",
        xs: [0, 1, 2, 3, 4, 5, 6],
        series: [{ name: "合并距离", color: A, ys: [0.2, 0.4, 0.55, 0.9, 1.4, 2.1, 3.0] }],
      };
    case "pca":
      return {
        kind: "scatter",
        points: linspace(-2, 2, 24).map((t) => ({
          x: t * 1.4 + (rnd() - 0.5) * 0.35,
          y: t * 0.7 + (rnd() - 0.5) * 0.35,
          c: E,
        })),
        lines: [[{ x: -2.6, y: -1.3 }, { x: 2.6, y: 1.3 }]],
      };
    case "tsne":
      return {
        kind: "scatter",
        points: blobs(18, [
          { cx: 1.1, cy: 1.2, n: 14, c: B, s: 0.28 },
          { cx: 3.4, cy: 1.3, n: 14, c: C, s: 0.28 },
          { cx: 2.3, cy: 3.3, n: 14, c: D, s: 0.28 },
        ]),
      };
    case "series":
      return {
        kind: "line",
        xs: linspace(0, 36, 37),
        series: [{ name: "观测", color: E, ys: linspace(0, 36, 37).map((x) => Math.sin(x / 3) + 0.04 * x + (x % 12 === 0 ? 0.4 : 0)) }],
      };
    case "arima":
      return {
        kind: "line",
        xs: linspace(0, 30, 31),
        series: [
          { name: "历史", color: E, ys: linspace(0, 30, 31).map((x, i) => (i < 22 ? Math.sin(x / 4) + 0.05 * x : NaN)).map((v) => (Number.isNaN(v) ? 0 : v)) },
          { name: "预测", color: A, ys: linspace(0, 30, 31).map((x, i) => (i >= 21 ? Math.sin(x / 4) + 0.05 * x : 0.05 * 21 + Math.sin(21 / 4) * (i === 21 ? 1 : 0))) },
        ],
      };
    case "fft":
      return {
        kind: "bars",
        items: [
          { name: "2Hz", value: 1.0, color: E },
          { name: "5Hz", value: 0.45, color: A },
          { name: "9Hz", value: 0.15, color: "#6e6a60" },
          { name: "14Hz", value: 0.08, color: "#6e6a60" },
        ],
      };
    case "wavelet":
      return {
        kind: "line",
        xs: linspace(0, 20, 80),
        series: [
          { name: "原信号", color: "#9a9384", ys: linspace(0, 20, 80).map((x) => Math.sin(x / 2) + (x > 10 && x < 11.2 ? 1.6 : 0)) },
          { name: "细节系数", color: A, ys: linspace(0, 20, 80).map((x) => (x > 10 && x < 11.2 ? 1.2 : 0.05 * Math.sin(x * 3))) },
        ],
      };
    case "hmm":
      return {
        kind: "bars",
        items: [
          { name: "晴→晴", value: 0.7, color: A },
          { name: "晴→雨", value: 0.3, color: C },
          { name: "雨→雨", value: 0.6, color: E },
          { name: "雨→晴", value: 0.4, color: B },
        ],
      };
    case "perceptron":
      return {
        kind: "scatter",
        points: blobs(19, [
          { cx: 1.3, cy: 1.4, n: 12, c: B },
          { cx: 3.3, cy: 3.2, n: 12, c: C },
        ]),
        lines: [[{ x: 0.6, y: 3.5 }, { x: 4.0, y: 1.0 }]],
      };
    case "mlp-xor":
      return {
        kind: "scatter",
        points: [
          { x: 1, y: 1, c: B },
          { x: 3.4, y: 3.4, c: B },
          { x: 1, y: 3.4, c: C },
          { x: 3.4, y: 1, c: C },
        ],
      };
    case "relu":
      return {
        kind: "line",
        xs: linspace(-3, 3, 40),
        series: [
          { name: "ReLU", color: A, ys: linspace(-3, 3, 40).map((x) => Math.max(0, x)) },
          { name: "Sigmoid", color: "#9a9384", ys: linspace(-3, 3, 40).map((x) => 1 / (1 + Math.exp(-x))) },
        ],
      };
    case "cnn":
      return {
        kind: "heat",
        xTicks: ["1", "2", "3", "4", "5"],
        yTicks: ["1", "2", "3", "4", "5"],
        matrix: [
          [0.1, 0.2, 0.9, 0.2, 0.1],
          [0.15, 0.8, 1, 0.75, 0.1],
          [0.1, 0.7, 0.95, 0.65, 0.12],
          [0.08, 0.2, 0.3, 0.15, 0.05],
          [0.05, 0.08, 0.1, 0.06, 0.04],
        ],
      };
    case "rnn":
      return {
        kind: "line",
        xs: linspace(0, 16, 17),
        series: [
          { name: "输入", color: E, ys: linspace(0, 16, 17).map((x) => Math.sin(x / 2)) },
          { name: "隐藏态", color: A, ys: linspace(0, 16, 17).map((x) => 0.7 * Math.sin(x / 2 - 0.6)) },
        ],
      };
    case "lstm":
      return {
        kind: "line",
        xs: linspace(0, 20, 40),
        series: [
          { name: "RNN 遗忘", color: C, ys: linspace(0, 20, 40).map((x) => Math.exp(-x / 6) * Math.sin(x)) },
          { name: "LSTM 记忆", color: B, ys: linspace(0, 20, 40).map((x) => (x < 4 ? 0 : 0.9) * Math.sin(Math.min(x, 8))) },
        ],
      };
    case "attention":
      return {
        kind: "heat",
        xTicks: ["猫", "坐", "垫", "上"],
        yTicks: ["猫", "坐", "垫", "上"],
        matrix: [
          [0.7, 0.1, 0.15, 0.05],
          [0.2, 0.55, 0.15, 0.1],
          [0.15, 0.1, 0.6, 0.15],
          [0.05, 0.1, 0.2, 0.65],
        ],
      };
    case "transformer":
      return {
        kind: "bars",
        items: [
          { name: "注意力", value: 0.9, color: D },
          { name: "残差", value: 0.7, color: A },
          { name: "前馈", value: 0.85, color: E },
          { name: "Norm", value: 0.6, color: B },
        ],
      };
    case "residual":
      return {
        kind: "line",
        xs: linspace(1, 50, 20),
        series: [
          { name: "无残差", color: C, ys: linspace(1, 50, 20).map((x) => 0.9 - 0.012 * x + (x > 30 ? -0.2 : 0)) },
          { name: "ResNet", color: B, ys: linspace(1, 50, 20).map((x) => 0.72 + 0.004 * x) },
        ],
      };
    case "autoencoder":
      return {
        kind: "line",
        xs: linspace(0, 8, 30),
        series: [
          { name: "原信号", color: E, ys: linspace(0, 8, 30).map((x) => Math.sin(x) + 0.15 * Math.sin(4 * x)) },
          { name: "重建", color: A, ys: linspace(0, 8, 30).map((x) => Math.sin(x)) },
        ],
      };
    case "gan":
      return {
        kind: "line",
        xs: linspace(0, 40, 41),
        series: [
          { name: "判别器", color: C, ys: linspace(0, 40, 41).map((x) => 1.2 - 0.4 * (1 - Math.exp(-x / 12)) + Math.sin(x / 3) * 0.08) },
          { name: "生成器", color: B, ys: linspace(0, 40, 41).map((x) => 1.6 * Math.exp(-x / 10) + 0.35) },
        ],
      };
    case "diffusion":
      return {
        kind: "line",
        xs: linspace(0, 20, 21),
        series: [
          { name: "噪声强度", color: "#9a9384", ys: linspace(0, 20, 21).map((x) => x / 20) },
          { name: "可辨认度", color: A, ys: linspace(0, 20, 21).map((x) => 1 - x / 20) },
        ],
      };
    case "gnn":
      return {
        kind: "bars",
        items: [
          { name: "自身", value: 0.4, color: A },
          { name: "邻居1", value: 0.25, color: E },
          { name: "邻居2", value: 0.2, color: D },
          { name: "邻居3", value: 0.15, color: B },
        ],
      };
    case "embed":
      return {
        kind: "scatter",
        points: [
          { x: 1.1, y: 3.2, c: A },
          { x: 1.4, y: 2.9, c: A },
          { x: 3.6, y: 1.2, c: B },
          { x: 3.3, y: 1.5, c: B },
          { x: 2.4, y: 2.2, c: D },
        ],
      };
    case "optim":
      return {
        kind: "line",
        xs: linspace(0, 40, 41),
        series: [
          { name: "SGD", color: "#9a9384", ys: linspace(0, 40, 41).map((x) => 2 * Math.exp(-x / 18) + 0.3) },
          { name: "Adam", color: A, ys: linspace(0, 40, 41).map((x) => 2 * Math.exp(-x / 7) + 0.22) },
        ],
      };
    case "batchnorm":
      return {
        kind: "line",
        xs: linspace(-4, 4, 40),
        series: [
          { name: "激活偏移", color: C, ys: linspace(-4, 4, 40).map((x) => Math.exp(-((x - 1.6) ** 2) / 1.2)) },
          { name: "BN 后", color: B, ys: linspace(-4, 4, 40).map((x) => Math.exp(-((x) ** 2) / 1.1)) },
        ],
      };
    case "dropout":
      return {
        kind: "bars",
        items: [
          { name: "单元1", value: 0.8, color: B },
          { name: "单元2", value: 0, color: "#4a4740" },
          { name: "单元3", value: 0.9, color: B },
          { name: "单元4", value: 0, color: "#4a4740" },
          { name: "单元5", value: 0.7, color: B },
        ],
      };
    case "pretrain":
      return {
        kind: "line",
        xs: linspace(0, 30, 31),
        series: [
          { name: "从零训", color: C, ys: linspace(0, 30, 31).map((x) => 0.35 + 0.5 * (1 - Math.exp(-x / 14))) },
          { name: "预训练+微调", color: B, ys: linspace(0, 30, 31).map((x) => 0.62 + 0.3 * (1 - Math.exp(-x / 6))) },
        ],
      };
    case "transfer":
      return {
        kind: "bars",
        items: [
          { name: "源任务", value: 0.92, color: E },
          { name: "直接搬", value: 0.55, color: A },
          { name: "微调后", value: 0.88, color: B },
        ],
      };
    case "earlystop":
      return {
        kind: "line",
        xs: linspace(0, 40, 41),
        series: [
          { name: "训练", color: B, ys: linspace(0, 40, 41).map((x) => 1.7 * Math.exp(-x / 9) + 0.05) },
          { name: "验证", color: C, ys: linspace(0, 40, 41).map((x) => 1.5 * Math.exp(-x / 10) + 0.018 * Math.max(0, x - 16) + 0.2) },
        ],
      };
    case "tokenize":
      return {
        kind: "bars",
        items: [
          { name: "机器学习", value: 2, color: A },
          { name: "很", value: 1, color: E },
          { name: "有趣", value: 1, color: B },
        ],
      };
    case "context":
      return {
        kind: "bars",
        items: [
          { name: "已用", value: 6.2, color: A },
          { name: "剩余", value: 1.8, color: "#4a4740" },
        ],
      };
    case "sft":
      return {
        kind: "line",
        xs: linspace(0, 20, 21),
        series: [{ name: "指令损失", color: A, ys: linspace(0, 20, 21).map((x) => 2.4 * Math.exp(-x / 6) + 0.35) }],
      };
    case "lora":
      return {
        kind: "bars",
        items: [
          { name: "全量参数", value: 100, color: C },
          { name: "LoRA r=8", value: 0.8, color: B },
          { name: "LoRA r=64", value: 4.2, color: A },
        ],
      };
    case "prompt":
      return {
        kind: "bars",
        items: [
          { name: "零样本", value: 0.48, color: "#6e6a60" },
          { name: "少样本", value: 0.71, color: A },
          { name: "思维链", value: 0.83, color: B },
        ],
      };
    case "rag":
      return {
        kind: "bars",
        items: [
          { name: "只靠记忆", value: 0.41, color: C },
          { name: "检索+生成", value: 0.86, color: B },
        ],
      };
    case "rlhf":
      return {
        kind: "line",
        xs: linspace(0, 24, 25),
        series: [
          { name: "有用性", color: B, ys: linspace(0, 24, 25).map((x) => 0.4 + 0.5 * (1 - Math.exp(-x / 8))) },
          { name: "伤害率", color: C, ys: linspace(0, 24, 25).map((x) => 0.35 * Math.exp(-x / 7) + 0.04) },
        ],
      };
    case "halluc":
      return {
        kind: "bars",
        items: [
          { name: "无检索", value: 0.34, color: C },
          { name: "有检索", value: 0.11, color: A },
          { name: "再加引用", value: 0.05, color: B },
        ],
      };
    case "metrics":
      return {
        kind: "bars",
        items: [
          { name: "准确率", value: 0.96, color: "#6e6a60" },
          { name: "精确率", value: 0.55, color: A },
          { name: "召回率", value: 0.82, color: B },
        ],
      };
    case "confusion":
      return {
        kind: "heat",
        xTicks: ["预测负", "预测正"],
        yTicks: ["真负", "真正"],
        matrix: [
          [85, 10],
          [4, 21],
        ],
      };
    case "roc":
      return {
        kind: "line",
        xs: linspace(0, 1, 20),
        series: [
          { name: "随机", color: "#6e6a60", ys: linspace(0, 1, 20) },
          { name: "模型", color: A, ys: linspace(0, 1, 20).map((x) => Math.min(1, Math.sqrt(x) * 1.15)) },
        ],
      };
    case "drift":
      return {
        kind: "line",
        xs: linspace(0, 24, 25),
        series: [
          { name: "线下 AUC", color: B, ys: linspace(0, 24, 25).map(() => 0.84) },
          { name: "线上 AUC", color: C, ys: linspace(0, 24, 25).map((x) => 0.84 - 0.012 * Math.max(0, x - 8)) },
        ],
      };
  }
}
