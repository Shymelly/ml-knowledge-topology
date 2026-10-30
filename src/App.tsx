import { useEffect, useMemo, useState } from "react";
import { AtlasProvider } from "./atlasContext";
import GraphCanvas from "./components/GraphCanvas";
import LayerRail from "./components/LayerRail";
import TopicPanel from "./components/TopicPanel";
import type { Atlas } from "./data/atlas";
import { cellAtlas } from "./data/cellMaterials";
import { mlAtlas } from "./data/mlAtlas";
import { useProgress } from "./hooks/useProgress";
import type { LayerId } from "./types";

const atlases: Record<Atlas["id"], Atlas> = {
  ml: mlAtlas,
  cell: cellAtlas,
};

const ATLAS_KEY = "topology-atlas-v1";

function readAtlasId(): Atlas["id"] {
  const saved = localStorage.getItem(ATLAS_KEY);
  return saved === "cell" || saved === "ml" ? saved : "ml";
}

export default function App() {
  const [atlasId, setAtlasId] = useState<Atlas["id"]>(readAtlasId);
  const atlas = atlases[atlasId];
  const { progress, toggle, reset, learnedCount, total } = useProgress(
    atlas.progressKey,
    atlas.topics.map((topic) => topic.id),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [activeLayer, setActiveLayer] = useState<LayerId | "all">("all");
  const [filter, setFilter] = useState<"all" | "todo" | "done">("all");
  const [query, setQuery] = useState("");

  const openLesson = (id: string) => {
    setSelectedId(id);
    setLessonOpen(true);
  };

  const switchAtlas = (id: Atlas["id"]) => {
    if (id === atlasId) return;
    localStorage.setItem(ATLAS_KEY, id);
    setAtlasId(id);
    setSelectedId(null);
    setLessonOpen(false);
    setActiveLayer("all");
    setFilter("all");
    setQuery("");
  };

  useEffect(() => {
    document.title = atlas.title;
  }, [atlas.title]);

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
    <AtlasProvider atlas={atlas}>
      <div className="app">
        <header className="topbar">
          <div className="brand">
            <h1>{atlas.title}</h1>
            <p>
              {atlas.blurb} · {atlas.topics.length} 个节点 · 进度只存在这台设备
            </p>
          </div>
          <div className="atlas-switch" role="tablist" aria-label="知识库">
            <button
              className={atlasId === "cell" ? "on" : ""}
              onClick={() => switchAtlas("cell")}
              role="tab"
              aria-selected={atlasId === "cell"}
            >
              电芯材料
            </button>
            <button
              className={atlasId === "ml" ? "on" : ""}
              onClick={() => switchAtlas("ml")}
              role="tab"
              aria-selected={atlasId === "ml"}
            >
              机器学习
            </button>
          </div>
          <input
            id="q"
            className="search"
            placeholder={atlas.searchPlaceholder}
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
                if (confirm("清空当前知识库的学习标记？")) reset();
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
    </AtlasProvider>
  );
}
