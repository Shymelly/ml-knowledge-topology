import { lessonsA } from "./lessonsA";
import { lessonsB } from "./lessonsB";
import { lessonsC } from "./lessonsC";
import { topics } from "./knowledge";
import type { Lesson } from "../types";

export const lessons: Record<string, Lesson> = {
  ...lessonsA,
  ...lessonsB,
  ...lessonsC,
};

const missing = topics.filter((t) => !lessons[t.id]).map((t) => t.id);
if (missing.length) {
  console.warn("缺少课时内容：", missing);
}
