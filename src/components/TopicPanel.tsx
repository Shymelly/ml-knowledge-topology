import { useEffect, useState } from "react";
import Formula from "./Formula";
import MiniChart from "./MiniChart";
import { neighborsOf, topicMap, layers, layerColor } from "../data/knowledge";
import { lessons } from "../data/lessons";
import { explains } from "../data/explains";
import type { ProgressMap } from "../types";

interface Props {
  selectedId: string | null;
  open: boolean;
  progress: ProgressMap;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export default function TopicPanel({
  selectedId,
  open,
  progress,
  onToggle,
  onSelect,
  onClose,
}: Props) {
  const [phase, setPhase] = useState<"closed" | "in" | "out">("closed");
  const [shownId, setShownId] = useState<string | null>(null);

  useEffect(() => {
    if (open && selectedId) {
      setShownId(selectedId);
      setPhase("in");
    } else if (!open) {
      setPhase((p) => (p === "in" ? "out" : p));
    }
  }, [open, selectedId]);

  if (phase === "closed" || !shownId) return null;

  const t = topicMap[shownId];
  const layer = layers.find((l) => l.id === t.layer)!;
  const learned = !!progress[t.id];
  const related = neighborsOf(t.id);
  const lesson = lessons[t.id];
  const explain = explains[t.id];

  return (
    <div
      className={`lesson-overlay ${phase === "out" ? "is-out" : "is-in"}`}
      onClick={onClose}
      onAnimationEnd={() => {
        if (phase === "out") setPhase("closed");
      }}
      role="presentation"
    >
      <aside
        className={`lesson-window ${phase === "out" ? "is-out" : "is-in"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lesson-bar">
          <div className="kicker" style={{ color: layerColor[t.layer] }}>
            {layer.name} · {learned ? "已完成" : "未学习"}
          </div>
          <button className="ghost" onClick={onClose} aria-label="关闭">
            关闭
          </button>
        </div>
        <div className="panel-inner" key={shownId}>
          <h2 id="lesson-title">{t.name}</h2>
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
          <div className="lesson-grid">
            <div>
              <div className="block">
                <h4>通俗介绍</h4>
                <p>{t.summary}</p>
              </div>
              <div className="block">
                <h4>一个类比</h4>
                <p>{t.analogy}</p>
              </div>
              {explain && (
                <>
                  <div className="block">
                    <h4>专业定义</h4>
                    <p className="prose-pro">{explain.professional}</p>
                  </div>
                  <div className="block">
                    <h4>展开讲解</h4>
                    {explain.lecture.map((p, i) => (
                      <p key={i} className="prose">
                        {p}
                      </p>
                    ))}
                  </div>
                  <div className="block">
                    <h4>记住这几点</h4>
                    <ul className="points">
                      {explain.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
              {lesson && (
                <div className="block">
                  <h4>核心公式</h4>
                  <Formula tex={lesson.formula} />
                  <p>{lesson.formulaNote}</p>
                </div>
              )}
            </div>
            <div>
              {lesson && (
                <>
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
          </div>
        </div>
      </aside>
    </div>
  );
}
