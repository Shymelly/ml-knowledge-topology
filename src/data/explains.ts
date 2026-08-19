import { explainA } from "./explainA";
import { explainB } from "./explainB";
import { explainC } from "./explainC";
import { topics } from "./knowledge";
import type { Explain } from "../types";

export const explains: Record<string, Explain> = {
  ...explainA,
  ...explainB,
  ...explainC,
};

const missing = topics.filter((t) => !explains[t.id]).map((t) => t.id);
if (missing.length) {
  console.warn("缺少专业讲解：", missing);
}
