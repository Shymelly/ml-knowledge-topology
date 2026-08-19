import { useCallback, useEffect, useState } from "react";
import { topics } from "../data/knowledge";
import type { ProgressMap } from "../types";

const KEY = "ml-topology-progress-v1";

function load(): ProgressMap {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProgressMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    setProgress(load());
  }, []);

  const persist = useCallback((next: ProgressMap) => {
    setProgress(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const toggle = useCallback(
    (id: string) => {
      const next = { ...load(), ...progress, [id]: !progress[id] };
      persist(next);
    },
    [persist, progress],
  );

  const mark = useCallback(
    (id: string, learned: boolean) => {
      const next = { ...load(), ...progress, [id]: learned };
      persist(next);
    },
    [persist, progress],
  );

  const reset = useCallback(() => {
    persist({});
  }, [persist]);

  const learnedCount = topics.filter((t) => progress[t.id]).length;
  const total = topics.length;

  return { progress, toggle, mark, reset, learnedCount, total };
}
