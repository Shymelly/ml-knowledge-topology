import type { Edge, Explain, Layer, Lesson, Relation, Topic } from "../types";

export interface AtlasLink {
  id: string;
  rel: Relation;
  dir: "out" | "in";
}

export interface Atlas {
  id: "ml" | "cell";
  title: string;
  blurb: string;
  searchPlaceholder: string;
  progressKey: string;
  railAllHint: string;
  graphHint: string;
  layers: Layer[];
  topics: Topic[];
  edges: Edge[];
  layerColor: Record<string, string>;
  topicMap: Record<string, Topic>;
  explains: Record<string, Explain>;
  lessons: Record<string, Lesson>;
  linksOf: (id: string) => AtlasLink[];
}

export function buildAtlas(input: {
  id: Atlas["id"];
  title: string;
  blurb: string;
  searchPlaceholder: string;
  progressKey: string;
  railAllHint: string;
  graphHint: string;
  layers: Layer[];
  topics: Topic[];
  edges: Edge[];
  layerColor: Record<string, string>;
  explains: Record<string, Explain>;
  lessons?: Record<string, Lesson>;
}): Atlas {
  const topicMap = Object.fromEntries(input.topics.map((t) => [t.id, t]));
  for (const edge of input.edges) {
    if (!topicMap[edge.source] || !topicMap[edge.target]) {
      console.warn("悬空连线", edge);
    }
  }
  const linksOf = (id: string): AtlasLink[] => {
    const links: AtlasLink[] = [];
    for (const edge of input.edges) {
      if (edge.source === id) links.push({ id: edge.target, rel: edge.rel, dir: "out" });
      else if (edge.target === id) links.push({ id: edge.source, rel: edge.rel, dir: "in" });
    }
    return links;
  };
  return {
    ...input,
    lessons: input.lessons ?? {},
    topicMap,
    linksOf,
  };
}
