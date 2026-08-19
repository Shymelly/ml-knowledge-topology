import Formula from "./Formula";
import MiniChart from "./MiniChart";
import { neighborsOf, topicMap, layers, layerColor } from "../data/knowledge";
import { lessons } from "../data/lessons";
import type { ProgressMap } from "../types";

interface Props {
  selectedId: string | null;
  progress: ProgressMap;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}

export default function TopicPanel({ selectedId, progress, onToggle, onSelect }: Props) {
  if (!selectedId) {
    return (
      <aside className="panel">
        <div className="empty">
          从中间的拓扑图点一个节点，或从左侧卡片挑一个主题。点击后图会自动飞到该节点和它的邻居，不用来回拖。
        </div>
      </aside>
    );
  }

  const t = topicMap[selectedId];
  const layer = layers.find((l) => l.id === t.layer)!;
  const learned = !!progress[t.id];
  const related = neighborsOf(t.id);
  const lesson = lessons[t.id];

  return (
    <aside className="panel">
      <div className="panel-inner">
        <div className="kicker" style={{ color: layerColor[t.layer] }}>
          {layer.name} · {learned ? "已完成" : "未学习"}
        </div>
        <h2>{t.name}</h2>
        <div className="en-title">{t.en}</div>
        <div className="tags">
          {t.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <div className="actions">
          <button className={`primary ${learned ? "done" : ""}`} onClick={() => onToggle(t.id)}>
            {learned ? "标记为未学习" : "标记为已完成"}
          </button>
        </div>
        <div className="block">
          <h4>它是什么</h4>
          <p>{t.summary}</p>
        </div>
        <div className="block">
          <h4>一个类比</h4>
          <p>{t.analogy}</p>
        </div>
        {lesson && (
          <>
            <div className="block">
              <h4>核心公式</h4>
              <Formula tex={lesson.formula} />
              <p>{lesson.formulaNote}</p>
            </div>
            <div className="block">
              <h4>代码怎么写</h4>
              <pre className="code">
                <code>{lesson.code}</code>
              </pre>
            </div>
            <div className="block">
              <h4>一个样例</h4>
              <p>{lesson.example}</p>
              <MiniChart
                preset={lesson.preset}
                title={lesson.chartTitle}
                caption={lesson.chartCaption}
              />
            </div>
          </>
        )}
        <div className="block">
          <h4>用来干什么</h4>
          <p>{t.purpose}</p>
        </div>
        <div className="block">
          <h4>什么时候会用到</h4>
          <p>{t.useWhen}</p>
        </div>
        <div className="block">
          <h4>别搞混</h4>
          <p>{t.note}</p>
        </div>
        {related.length > 0 && (
          <div className="block">
            <h4>拓扑邻居</h4>
            <div className="related">
              {related.map((id) => (
                <button key={id} onClick={() => onSelect(id)}>
                  {topicMap[id].name}
                  {progress[id] ? " · 已完成" : ""}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
