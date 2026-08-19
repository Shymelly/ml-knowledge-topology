# 机器学习知识拓扑

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111)](https://react.dev/)

一张给自己用的**机器学习广度地图**：不求一次挖很深，而是先把回归、分类、贝叶斯、树模型、神经网络、大模型微调这些词放进同一张拓扑里，搞清楚「它是干什么的、什么时候用、别和什么搞混」。

![首页：分层目录 + 可缩放拓扑图](docs/home.png)

点任意节点会弹出近全屏学习窗口，里面同时有通俗介绍、专业定义、展开讲解、公式、示例代码和示意图。看懂一块就点「已完成」，进度存在浏览器本地。

仓库地址：[github.com/Shymelly/ml-knowledge-topology](https://github.com/Shymelly/ml-knowledge-topology)

## 里面有什么

- **13 层、81 个节点**：从问题地图（监督 / 无监督 / 强化 / 生成）一直走到大模型与评估落地
- **可缩放拓扑图**：默认连线较暗，点中节点后只高亮与它相连的边；滚轮缩放、拖拽平移
- **学习窗口**：通俗介绍 + 专业定义 + 展开讲解 + 要点 + LaTeX 公式 + 代码 + 样例图
- **学习进度**：每个节点可标记已完成 / 未学习，进度条按整体统计
- **搜索**：顶栏搜索，或按 `/` 聚焦搜索框

覆盖范围包括：线性/逻辑回归、SVM、决策树、随机森林、GBDT/XGBoost、朴素贝叶斯、K-Means、PCA、小波与傅里叶、梯度下降、滑动窗口、CNN/RNN/Transformer、LoRA 微调、RAG、RLHF 等。

## 建议怎么逛

1. 从左侧「问题地图」建立大局：监督学习、无监督、强化学习、生成式模型。
2. 再看「学习与优化」：损失、梯度下降、过拟合。这是后面几乎所有模型共用的语言。
3. 按任务走进回归 / 分类 / 树与集成；有图像或序列再进神经网络；要用 ChatGPT 一类系统再看大模型。
4. 每个节点先读通俗介绍和类比，再读专业定义与展开讲解。只求先建立地图，不必一次记住公式推导。
5. 看懂就点「标记为已完成」。可以用顶部筛选只看「未学习」。

## 运行

需要先安装 [Node.js LTS](https://nodejs.org/)。在项目目录执行：

```bash
npm install
npm run dev
```

浏览器会打开 [http://localhost:5173/](http://localhost:5173/)。
机器学习首页.png
| 操作 | 说明 |
| --- | --- |
| 点击节点或左侧卡片 | 弹出学习窗口 |
| `Esc` / 点遮罩 / 关闭 | 收起窗口，拓扑图恢复全宽 |
| 滚轮 / 拖拽 | 缩放、平移拓扑图（按住拖过一小段才会平移） |
| `/` | 聚焦搜索 |
| 看全图 / 聚焦当前 | 图左上角，复位或缩放到当前节点邻域 |

进度保存在浏览器 `localStorage` 键 `ml-topology-progress-v1`。清除站点数据或点击「重置进度」会丢失标记，不会上传到服务器。

## 截图怎么更新

首页图在 [`docs/home.png`](docs/home.png)。以后界面改了，可以：

1. 运行 `npm run dev`，打开首页。
2. 用系统截图（Windows：`Win + Shift + S`）或浏览器全页截图。
3. 把新图覆盖保存为 `docs/home.png`（建议宽度 1400px 以上，PNG）。
4. 提交并推送：

```bash
git add docs/home.png README.md
git commit -m "Update README screenshot"
git push
```

GitHub 仓库页面会自动渲染 README 里的相对路径图片，无需外链图床。

## 技术

Vite + React + TypeScript。拓扑图用 Canvas 自绘，公式用 [KaTeX](https://katex.org/)，进度只存在本地。
