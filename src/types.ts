export type LayerId = string;

export type Relation =
  | "属于"
  | "用于"
  | "改进"
  | "组成"
  | "对比"
  | "依赖"
  | "促进"
  | "抑制"
  | "制约"
  | "权衡"
  | "决定";

export interface Layer {
  id: LayerId;
  name: string;
  subtitle: string;
  column: number;
  band: number;
}

export interface Topic {
  id: string;
  name: string;
  en: string;
  layer: LayerId;
  tags: string[];
  summary: string;
  analogy: string;
  purpose: string;
  useWhen: string;
  note: string;
  /** 只在需要对照两种体系时填写。 */
  compare?: { liquid: string; solid: string };
  formula?: string;
  formulaNote?: string;
}

export interface Edge {
  source: string;
  target: string;
  rel: Relation;
}

export type ProgressMap = Record<string, boolean>;

export type ChartPreset =
  | "paradigm-bars"
  | "scatter-labeled"
  | "scatter-unlabeled"
  | "reward"
  | "generate"
  | "xy-table"
  | "loss-bowl"
  | "gd-path"
  | "sgd-noise"
  | "grad-layers"
  | "lr-three"
  | "l2-shrink"
  | "overfit-curves"
  | "bias-var"
  | "feature-scale"
  | "zscore"
  | "split-bars"
  | "cv-folds"
  | "sliding"
  | "augment"
  | "reg-family"
  | "linreg"
  | "poly"
  | "ridge"
  | "lasso-coef"
  | "class-blobs"
  | "sigmoid"
  | "knn"
  | "svm"
  | "tree"
  | "nb-hist"
  | "bayes-update"
  | "bayes-net"
  | "gmm"
  | "gp-band"
  | "rf-vote"
  | "boost"
  | "gbdt"
  | "xgb"
  | "kmeans"
  | "dbscan"
  | "hier"
  | "pca"
  | "tsne"
  | "series"
  | "arima"
  | "fft"
  | "wavelet"
  | "hmm"
  | "perceptron"
  | "mlp-xor"
  | "relu"
  | "cnn"
  | "rnn"
  | "lstm"
  | "attention"
  | "transformer"
  | "residual"
  | "autoencoder"
  | "gan"
  | "diffusion"
  | "gnn"
  | "embed"
  | "optim"
  | "batchnorm"
  | "dropout"
  | "pretrain"
  | "transfer"
  | "earlystop"
  | "tokenize"
  | "context"
  | "sft"
  | "lora"
  | "prompt"
  | "rag"
  | "rlhf"
  | "halluc"
  | "metrics"
  | "confusion"
  | "roc"
  | "drift";

export interface Lesson {
  formula: string;
  formulaNote: string;
  code: string;
  example: string;
  chartTitle: string;
  chartCaption: string;
  preset: ChartPreset;
}

export interface Explain {
  professional: string;
  lecture: string[];
  points: string[];
}
