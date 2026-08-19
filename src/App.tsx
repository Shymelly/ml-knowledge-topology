import { useEffect, useMemo, useState } from "react";
import GraphCanvas from "./components/GraphCanvas";
import LayerRail from "./components/LayerRail";
import TopicPanel from "./components/TopicPanel";
import { topics } from "./data/knowledge";
import { useProgress } from "./hooks/useProgress";
import type { LayerId } from "./types";

export default function App() {
  const { progress, toggle, reset, learnedCount, total } = useProgress();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [activeLayer, setActiveLayer] = useState<LayerId | "all">("all");
  const [filter, setFilter] = useState<"all" | "todo" | "done">("all");
  const [query, setQuery] = useState("");

  const openLesson = (id: string) => {
    setSelectedId(id);
    setLessonOpen(true);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLessonOpen(false);
      if (e.key === "/" && (e.target as HTMLElement).tagName !== "INPUT") {
        e.preventDefault();
        document.getElementById("q")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pct = useMemo(
    () => (total ? Math.round((learnedCount / total) * 100) : 0),
    [learnedCount, total],
  );

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <h1>机器学习知识拓扑</h1>
          <p>广度优先 · {topics.length} 个节点 · 已学/未学可标记</p>
        </div>
        <input
          id="q"
          className="search"
          placeholder="搜索算法、模型、用途，按 / 聚焦"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="stats">
          <span>
            {learnedCount} / {total} · {pct}%
          </span>
          <div className="meter" aria-label="学习进度">
            <span style={{ width: `${pct}%` }} />
          </div>
          <button
            className="ghost"
            onClick={() => {
              if (confirm("清空全部学习标记？")) reset();
            }}
          >
            重置进度
          </button>
        </div>
      </header>
      <div className="workspace">
        <LayerRail
          activeLayer={activeLayer}
          onLayer={setActiveLayer}
          progress={progress}
          filter={filter}
          onFilter={setFilter}
          selectedId={selectedId}
          onSelect={openLesson}
          query={query}
        />
        <GraphCanvas
          selectedId={selectedId}
          activeLayer={activeLayer}
          progress={progress}
          query={query}
          onSelect={openLesson}
        />
      </div>
      <TopicPanel
        selectedId={selectedId}
        open={lessonOpen}
        progress={progress}
        onToggle={toggle}
        onSelect={openLesson}
        onClose={() => setLessonOpen(false)}
      />
    </div>
  );
}
