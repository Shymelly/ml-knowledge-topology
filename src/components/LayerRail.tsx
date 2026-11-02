import { useAtlas } from "../atlasContext";
import type { LayerId, ProgressMap, Topic } from "../types";

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
  const { layers, layerColor, topics } = useAtlas();
  const q = query.trim().toLowerCase();
  const needle = query.trim();

  const matchTopic = (topic: Topic) => {
    if (!q) return true;
    return (
      topic.name.toLowerCase().includes(q) ||
      topic.en.toLowerCase().includes(q) ||
      topic.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      topic.summary.includes(needle) ||
      topic.compare?.liquid.includes(needle) ||
      topic.compare?.solid.includes(needle)
    );
  };

  const visible = topics.filter((topic) => {
    const inLayer = activeLayer === "all" || topic.layer === activeLayer;
    const learned = !!progress[topic.id];
    const status = filter === "all" || (filter === "done" ? learned : !learned);
    return inLayer && status && matchTopic(topic);
  });

  const sections =
    activeLayer === "all"
      ? layers
          .map((layer) => ({
            layer,
            items: visible.filter((topic) => topic.layer === layer.id),
          }))
          .filter((section) => section.items.length > 0)
      : layers
          .filter((layer) => layer.id === activeLayer)
          .map((layer) => ({ layer, items: visible }));

  return (
    <main className="catalog">
      <div className="catalog-inner">
      <div className="dir-bar" role="tablist" aria-label="目录">
        <button
          className={`dir-btn ${activeLayer === "all" ? "active" : ""}`}
          onClick={() => onLayer("all")}
          role="tab"
          aria-selected={activeLayer === "all"}
        >
          <i className="dot" style={{ background: "var(--accent)" }} />
          全部
          <small>
            {topics.filter((topic) => progress[topic.id]).length}/{topics.length}
          </small>
        </button>
        {layers.map((layer) => {
          const group = topics.filter((topic) => topic.layer === layer.id);
          const done = group.filter((topic) => progress[topic.id]).length;
          return (
            <button
              key={layer.id}
              className={`dir-btn ${activeLayer === layer.id ? "active" : ""}`}
              onClick={() => onLayer(layer.id)}
              role="tab"
              aria-selected={activeLayer === layer.id}
            >
              <i className="dot" style={{ background: layerColor[layer.id] }} />
              {layer.name}
              <small>
                {done}/{group.length}
              </small>
            </button>
          );
        })}
      </div>
      <div className="filters">
        {(
          [
            ["all", "全部"],
            ["todo", "未学习"],
            ["done", "已完成"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} className={`chip ${filter === id ? "on" : ""}`} onClick={() => onFilter(id)}>
            {label}
          </button>
        ))}
      </div>
      {sections.length === 0 && <p className="empty">没有匹配的条目。</p>}
      {sections.map(({ layer, items }) => (
        <section className="dir-section" key={layer.id}>
          <h2>
            <i className="dot" style={{ background: layerColor[layer.id] }} />
            {layer.name}
            <span>{layer.subtitle}</span>
          </h2>
          <div className="card-grid">
            {items.map((topic) => (
              <button
                key={topic.id}
                className={`card ${selectedId === topic.id ? "selected" : ""} ${progress[topic.id] ? "learned" : ""}`}
                onClick={() => onSelect(topic.id)}
              >
                <h3>{topic.name}</h3>
                <div className="en">{topic.en}</div>
                <p>{topic.summary}</p>
              </button>
            ))}
          </div>
        </section>
      ))}
      </div>
    </main>
  );
}
