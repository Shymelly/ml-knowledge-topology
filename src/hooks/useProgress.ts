import { useCallback, useEffect, useRef, useState } from "react";
import type { ProgressMap } from "../types";

function load(key: string): ProgressMap {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProgressMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function useProgress(storageKey: string, topicIds: string[]) {
  const [progress, setProgress] = useState<ProgressMap>({});
  const keyRef = useRef(storageKey);
  keyRef.current = storageKey;

  useEffect(() => {
    setProgress(load(storageKey));
  }, [storageKey]);

  const persist = useCallback((next: ProgressMap) => {
    setProgress(next);
    localStorage.setItem(keyRef.current, JSON.stringify(next));
  }, []);

  const toggle = useCallback(
    (id: string) => {
      const next = { ...load(keyRef.current), ...progress, [id]: !progress[id] };
      persist(next);
    },
    [persist, progress],
  );

  const mark = useCallback(
    (id: string, learned: boolean) => {
      const next = { ...load(keyRef.current), ...progress, [id]: learned };
      persist(next);
    },
    [persist, progress],
  );

  const reset = useCallback(() => {
    persist({});
  }, [persist]);

  const learnedCount = topicIds.filter((id) => progress[id]).length;
  const total = topicIds.length;

  return { progress, toggle, mark, reset, learnedCount, total };
}
