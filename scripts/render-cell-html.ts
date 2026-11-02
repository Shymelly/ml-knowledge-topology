import { writeFileSync } from "node:fs";
import { cellAtlas } from "../src/data/cellMaterials";

const topics = cellAtlas.topics.map((topic) => {
  const explain = cellAtlas.explains[topic.id];
  return {
    id: topic.id,
    name: topic.name,
    en: topic.en,
    layer: topic.layer,
    tags: topic.tags,
    summary: topic.summary,
    analogy: topic.analogy,
    purpose: topic.purpose,
    useWhen: topic.useWhen,
    note: topic.note,
    compare: topic.compare ?? null,
    formula: topic.formula ?? null,
    formulaNote: topic.formulaNote ?? null,
    professional: explain?.professional ?? "",
    lecture: explain?.lecture ?? [],
    points: explain?.points ?? [],
    links: cellAtlas.linksOf(topic.id).map((link) => ({
      id: link.id,
      name: cellAtlas.topicMap[link.id]?.name ?? link.id,
      rel: link.rel,
      dir: link.dir,
    })),
  };
});

const layers = cellAtlas.layers.map((layer) => ({
  id: layer.id,
  name: layer.name,
  subtitle: layer.subtitle,
  color: cellAtlas.layerColor[layer.id] ?? "#8a6a2f",
  count: topics.filter((topic) => topic.layer === layer.id).length,
}));

const payload = JSON.stringify({ layers, topics }).replace(/</g, "\\u003c");

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>电芯材料知识库</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f3f0e8;
      --paper: #fffcf7;
      --ink: #1d1a16;
      --muted: #5e584e;
      --faint: #8a8376;
      --line: #e4ddd0;
      --accent: #8d6430;
      --accent-soft: #f3e7d4;
      --liquid: #1d4f86;
      --solid: #8a3d2f;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; height: 100%; }
    body {
      font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif;
      color: var(--ink);
      background: var(--bg);
    }
    button, input { font-family: inherit; }
    button { cursor: pointer; }
    .app {
      height: 100vh;
      display: grid;
      grid-template-rows: auto 1fr;
    }
    header {
      background: var(--paper);
      border-bottom: 1px solid var(--line);
      padding: 16px 28px 14px;
    }
    .head-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 24px;
    }
    h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 650;
      letter-spacing: 0.01em;
    }
    .sub {
      margin: 6px 0 0;
      color: var(--muted);
      font-size: 14px;
      line-height: 1.55;
    }
    .search {
      width: min(360px, 32vw);
      border: 1px solid var(--line);
      background: #fff;
      border-radius: 999px;
      padding: 10px 16px;
      font-size: 14px;
      outline: none;
    }
    .search:focus { border-color: var(--accent); }
    .workspace {
      min-height: 0;
      display: grid;
      grid-template-columns: 440px 1fr;
    }
    .list {
      min-height: 0;
      overflow: auto;
      background: #efeae1;
      border-right: 1px solid var(--line);
      padding: 16px 16px 32px;
    }
    .dirs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 14px;
    }
    .dir {
      border: 1px solid transparent;
      background: var(--paper);
      color: var(--ink);
      border-radius: 999px;
      padding: 7px 11px;
      font-size: 13px;
    }
    .dir.on {
      background: var(--accent);
      color: #fff;
    }
    .dir i {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 6px;
    }
    .group { margin: 0 0 18px; }
    .group h2 {
      margin: 0 0 8px;
      font-size: 15px;
    }
    .group h2 small {
      display: block;
      margin-top: 2px;
      color: var(--muted);
      font-size: 12px;
      font-weight: 400;
    }
    .card {
      display: block;
      width: 100%;
      text-align: left;
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 12px 14px 13px;
      margin: 0 0 8px;
      color: inherit;
    }
    .card:hover, .card.on { border-color: var(--accent); }
    .card h3 { margin: 0; font-size: 16px; }
    .card .en { color: var(--faint); font-size: 12px; margin-top: 2px; }
    .card p {
      margin: 6px 0 0;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.55;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .reader {
      min-height: 0;
      overflow: auto;
      background: var(--paper);
    }
    .article {
      max-width: 760px;
      padding: 36px 48px 72px;
    }
    .kicker {
      font-size: 13px;
      letter-spacing: 0.04em;
      margin-bottom: 8px;
    }
    .article h2 {
      margin: 0;
      font-size: 34px;
      line-height: 1.25;
    }
    .article .en { color: var(--muted); margin-top: 6px; }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 14px 0 8px; }
    .tag {
      font-size: 12px;
      color: var(--muted);
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 3px 8px;
    }
    .block { margin: 22px 0; }
    .block h3 {
      margin: 0 0 8px;
      font-size: 13px;
      color: var(--faint);
      font-weight: 650;
    }
    .block p, .lecture p, li {
      font-size: 16.5px;
      line-height: 1.85;
      margin: 0 0 12px;
    }
    .pro {
      padding: 12px 14px;
      background: #f7f3ea;
      border-left: 3px solid var(--accent);
      border-radius: 0 10px 10px 0;
    }
    .compare {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .compare div {
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 12px 14px;
      background: #fff;
    }
    .compare b { display: block; margin-bottom: 6px; font-size: 13px; }
    .compare .liquid b { color: var(--liquid); }
    .compare .solid b { color: var(--solid); }
    ul { margin: 0; padding-left: 1.2em; }
    .tex {
      margin: 0;
      padding: 12px 14px;
      background: #f7f3ea;
      border-radius: 10px;
      overflow-x: auto;
      font-family: "Cascadia Code", "Sarasa Mono SC", Consolas, monospace;
      font-size: 14px;
    }
    .links { display: flex; flex-wrap: wrap; gap: 8px; }
    .links button {
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 8px 10px;
      text-align: left;
      font-size: 13px;
      color: var(--ink);
    }
    .links button:hover { border-color: var(--accent); }
    .welcome h2 { font-size: 28px; margin-bottom: 8px; }
    .welcome p { color: var(--muted); font-size: 16px; line-height: 1.75; }
    .empty { color: var(--muted); padding: 12px 4px; }
    @media (max-width: 1080px) {
      .workspace { grid-template-columns: 1fr; }
      .list { max-height: 42vh; }
      .article { padding: 24px 20px 48px; }
      .compare { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="app">
    <header>
      <div class="head-row">
        <div>
          <h1>电芯材料知识库</h1>
          <p class="sub">只含材料部分。先按目录看卡片，点开后在右侧阅读。理化、模电、加工和电芯性能不是同一层证据。</p>
        </div>
        <input id="q" class="search" placeholder="搜索粒度、首效、压实、产气…" />
      </div>
    </header>
    <div class="workspace">
      <aside class="list">
        <div id="dirs" class="dirs"></div>
        <div id="groups"></div>
      </aside>
      <main id="reader" class="reader"></main>
    </div>
  </div>
  <script>
    const DATA = ${payload};
    const byId = Object.fromEntries(DATA.topics.map((topic) => [topic.id, topic]));
    const state = { layer: "all", q: "", id: null };

    const dirs = document.getElementById("dirs");
    const groups = document.getElementById("groups");
    const reader = document.getElementById("reader");
    const search = document.getElementById("q");

    function matches(topic) {
      if (state.layer !== "all" && topic.layer !== state.layer) return false;
      const q = state.q.trim().toLowerCase();
      if (!q) return true;
      const blob = [
        topic.name, topic.en, topic.summary, topic.tags.join(" "),
        topic.compare?.liquid || "", topic.compare?.solid || "",
        topic.professional, topic.purpose, topic.note
      ].join("\\n").toLowerCase();
      return blob.includes(q);
    }

    function renderDirs() {
      const all = document.createElement("button");
      all.className = "dir" + (state.layer === "all" ? " on" : "");
      all.textContent = "全部 " + DATA.topics.length;
      all.onclick = () => { state.layer = "all"; render(); };
      dirs.replaceChildren(all);
      for (const layer of DATA.layers) {
        const button = document.createElement("button");
        button.className = "dir" + (state.layer === layer.id ? " on" : "");
        button.innerHTML = '<i style="background:' + layer.color + '"></i>' + layer.name + " " + layer.count;
        button.onclick = () => { state.layer = layer.id; render(); };
        dirs.appendChild(button);
      }
    }

    function renderList() {
      groups.replaceChildren();
      const visible = DATA.topics.filter(matches);
      const sections = state.layer === "all"
        ? DATA.layers.map((layer) => ({ layer, items: visible.filter((topic) => topic.layer === layer.id) })).filter((section) => section.items.length)
        : DATA.layers.filter((layer) => layer.id === state.layer).map((layer) => ({ layer, items: visible }));
      if (!sections.length) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = "没有匹配的条目。";
        groups.appendChild(empty);
        return;
      }
      for (const section of sections) {
        const wrap = document.createElement("section");
        wrap.className = "group";
        const title = document.createElement("h2");
        title.append(section.layer.name);
        const small = document.createElement("small");
        small.textContent = section.layer.subtitle;
        title.appendChild(small);
        wrap.appendChild(title);
        for (const topic of section.items) {
          const card = document.createElement("button");
          card.className = "card" + (state.id === topic.id ? " on" : "");
          const h3 = document.createElement("h3");
          h3.textContent = topic.name;
          const en = document.createElement("div");
          en.className = "en";
          en.textContent = topic.en;
          const p = document.createElement("p");
          p.textContent = topic.summary;
          card.append(h3, en, p);
          card.onclick = () => openTopic(topic.id);
          wrap.appendChild(card);
        }
        groups.appendChild(wrap);
      }
    }

    function addBlock(parent, heading, nodes) {
      const block = document.createElement("section");
      block.className = "block";
      const h3 = document.createElement("h3");
      h3.textContent = heading;
      block.appendChild(h3);
      for (const node of nodes) block.appendChild(node);
      parent.appendChild(block);
    }

    function paragraph(text) {
      const p = document.createElement("p");
      p.textContent = text;
      return p;
    }

    function renderArticle() {
      const topic = state.id ? byId[state.id] : null;
      reader.replaceChildren();
      const article = document.createElement("article");
      article.className = "article" + (topic ? "" : " welcome");
      if (!topic) {
        article.innerHTML = "<h2>从左侧挑一张卡片</h2><p>这份页面只有电芯材料。目录按评价顺序排列：理化数据、模电、加工性能、电芯性能。模电用来看方向，不能代替正式电芯的产气、膨胀和功率。</p><p>点开卡片后，右侧会写出它和谁有关，以及液态和固态差在哪里。</p>";
        reader.appendChild(article);
        return;
      }
      const layer = DATA.layers.find((item) => item.id === topic.layer);
      const kicker = document.createElement("div");
      kicker.className = "kicker";
      kicker.style.color = layer?.color || "var(--accent)";
      kicker.textContent = layer ? layer.name : "";
      const h2 = document.createElement("h2");
      h2.textContent = topic.name;
      const en = document.createElement("div");
      en.className = "en";
      en.textContent = topic.en;
      const tags = document.createElement("div");
      tags.className = "tags";
      for (const tag of topic.tags) {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = tag;
        tags.appendChild(span);
      }
      article.append(kicker, h2, en, tags);
      addBlock(article, "通俗介绍", [paragraph(topic.summary)]);
      addBlock(article, "一个类比", [paragraph(topic.analogy)]);
      if (topic.compare) {
        const grid = document.createElement("div");
        grid.className = "compare";
        for (const [key, label] of [["liquid", "液态"], ["solid", "固态"]]) {
          const cell = document.createElement("div");
          cell.className = key;
          const b = document.createElement("b");
          b.textContent = label;
          const p = document.createElement("p");
          p.textContent = topic.compare[key];
          cell.append(b, p);
          grid.appendChild(cell);
        }
        addBlock(article, "液态和固态差在哪", [grid]);
      }
      if (topic.professional) addBlock(article, "专业定义", [paragraph(topic.professional)]);
      if (topic.lecture.length) addBlock(article, "展开讲解", topic.lecture.map(paragraph));
      if (topic.points.length) {
        const ul = document.createElement("ul");
        for (const point of topic.points) {
          const li = document.createElement("li");
          li.textContent = point;
          ul.appendChild(li);
        }
        addBlock(article, "记住这几点", [ul]);
      }
      if (topic.formula) {
        const pre = document.createElement("pre");
        pre.className = "tex";
        pre.textContent = topic.formula;
        const nodes = [pre];
        if (topic.formulaNote) nodes.push(paragraph(topic.formulaNote));
        addBlock(article, "核心关系", nodes);
      }
      addBlock(article, "用来干什么", [paragraph(topic.purpose)]);
      addBlock(article, "什么时候会用到", [paragraph(topic.useWhen)]);
      addBlock(article, "别搞混", [paragraph(topic.note)]);
      if (topic.links.length) {
        const box = document.createElement("div");
        box.className = "links";
        for (const link of topic.links) {
          const button = document.createElement("button");
          button.textContent = link.dir === "out" ? link.rel + " → " + link.name : link.name + " → " + link.rel;
          button.onclick = () => openTopic(link.id);
          box.appendChild(button);
        }
        addBlock(article, "相关条目", [box]);
      }
      reader.appendChild(article);
      reader.scrollTop = 0;
    }

    function openTopic(id) {
      state.id = id;
      const topic = byId[id];
      if (topic && state.layer !== "all" && topic.layer !== state.layer) state.layer = "all";
      render();
      const card = [...groups.querySelectorAll(".card")].find((node) => node.querySelector("h3")?.textContent === topic.name);
      card?.scrollIntoView({ block: "nearest" });
    }

    function render() {
      renderDirs();
      renderList();
      renderArticle();
    }

    search.addEventListener("input", () => {
      state.q = search.value;
      render();
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "/" && document.activeElement !== search) {
        event.preventDefault();
        search.focus();
      }
    });
    render();
  </script>
</body>
</html>
`;

writeFileSync("public/cell-materials.html", html);
console.log("wrote public/cell-materials.html", html.length, "topics", topics.length);
