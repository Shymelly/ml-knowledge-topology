import { explains } from "./explains";
import { edges, layerColor, layers, topics } from "./knowledge";
import { lessons } from "./lessons";
import { buildAtlas } from "./atlas";

export const mlAtlas = buildAtlas({
  id: "ml",
  title: "机器学习知识拓扑",
  blurb: "广度优先 · 已学/未学可标记",
  searchPlaceholder: "搜索算法、模型、用途，按 / 聚焦",
  progressKey: "ml-topology-progress-v1",
  railAllHint: "从问题类型一路看到大模型",
  graphHint: "点击节点弹出学习窗口 · 滚轮缩放 · 拖拽平移",
  layers,
  topics,
  edges,
  layerColor,
  explains,
  lessons,
});
