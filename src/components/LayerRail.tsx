import { useAtlas } from "../atlasContext";
import type { LayerId, ProgressMap } from "../types";

interface Props {
  activeLayer: LayerId | "all";
  onLayer: (id: LayerId | "all") => void;
  progress: ProgressMap;
  filter: "all" | "todo" | "done";
  onFilter: (f: "all" | "todo" | "done") => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  query: string;
}

export default function LayerRail({
  activeLayer,
  onLayer,
  progress,
  filter,
  onFilter,
  selectedId,
  onSelect,
  query,
}: Props) {
  const { layers, layerColor, topics, railAllHint } = useAtlas();
  const q = query.trim().toLowerCase();
  const visible = topics.filter((t) => {
    const inLayer = activeLayer === "all" || t.layer === activeLayer;
    const learned = !!progress[t.id];
    const status = filter === "all" || (filter === "done" ? learned : !learned);
    const match =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.en.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      t.summary.includes(query.trim()) ||
      t.compare?.liquid.includes(query.trim()) ||
      t.compare?.solid.includes(query.trim());
    return inLayer && status && match;
  });

  return (
    <aside className="rail">
      <div className="section-label">分层地图</div>
      <button
        className={`layer-btn ${activeLayer === "all" ? "active" : ""}`}
        onClick={() => onLayer("all")}
      >
        <i className="dot" style={{ background: "var(--accent)" }} />
        <span>
          全部层级
          <small>{railAllHint}</small>
        </span>
        <b className="frac">
          {topics.filter((t) => progress[t.id]).length}/{topics.length}
        </b>
      </button>
      {layers.map((layer) => {
        const group = topics.filter((t) => t.layer === layer.id);
        const done = group.filter((t) => progress[t.id]).length;
        return (
          <button
            key={layer.id}
            className={`layer-btn ${activeLayer === layer.id ? "active" : ""}`}
            onClick={() => onLayer(layer.id)}
          >
            <i className="dot" style={{ background: layerColor[layer.id] }} />
            <span>
              {layer.name}
              <small>{layer.subtitle}</small>
            </span>
            <b className="frac">
              {done}/{group.length}
            </b>
          </button>
        );
      })}

      <div className="section-label" style={{ marginTop: 18 }}>
        本层卡片
      </div>
      <div className="filters">
        {(
          [
            ["all", "全部"],
            ["todo", "未学习"],
            ["done", "已完成"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            className={`chip ${filter === id ? "on" : ""}`}
            onClick={() => onFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="cards">
        {visible.map((t) => (
          <button
            key={t.id}
            className={`card ${selectedId === t.id ? "selected" : ""} ${progress[t.id] ? "learned" : ""}`}
            onClick={() => onSelect(t.id)}
          >
            <h3>{t.name}</h3>
            <div className="en">{t.en}</div>
            <p>{t.summary}</p>
          </button>
        ))}
      </div>
    </aside>
  );
}
