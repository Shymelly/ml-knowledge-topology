import type { ChartPreset, Lesson } from "../types";

export function lesson(
  formula: string,
  formulaNote: string,
  code: string,
  example: string,
  chartTitle: string,
  chartCaption: string,
  preset: ChartPreset,
): Lesson {
  return { formula, formulaNote, code, example, chartTitle, chartCaption, preset };
}
