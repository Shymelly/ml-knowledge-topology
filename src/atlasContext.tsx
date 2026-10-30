import { createContext, useContext, type ReactNode } from "react";
import type { Atlas } from "./data/atlas";
import { mlAtlas } from "./data/mlAtlas";

const AtlasContext = createContext<Atlas>(mlAtlas);

export function AtlasProvider({ atlas, children }: { atlas: Atlas; children: ReactNode }) {
  return <AtlasContext.Provider value={atlas}>{children}</AtlasContext.Provider>;
}

export function useAtlas() {
  return useContext(AtlasContext);
}
