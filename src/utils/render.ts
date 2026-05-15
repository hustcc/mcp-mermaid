import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  type MermaidRenderer,
  type RenderResult,
  createMermaidRenderer,
} from "mermaid-isomorphic";

// Cache the renderer to avoid creating a new one every time.
let renderer: MermaidRenderer;

/**
 * Ref:
 * - https://github.com/mermaid-js/mermaid-cli/blob/master/src/index.js
 * - https://github.com/remcohaszing/mermaid-isomorphic
 * @returns
 */
export async function renderMermaid(
  mermaid: string,
  theme = "default",
  backgroundColor = "white",
  look: "classic" | "handDrawn" = "classic",
): Promise<RenderResult> {
  if (!renderer) renderer = createMermaidRenderer();
  const cssContent = `svg { background: ${backgroundColor}; }`;
  const cssTmpPath = path.join(os.tmpdir(), "mermaid-tmp-css.css");
  fs.writeFileSync(cssTmpPath, cssContent);

  const r = await renderer([mermaid], {
    // Image is needed.
    screenshot: true,
    css: cssTmpPath,
    mermaidConfig: {
      // biome-ignore lint/suspicious/noExplicitAny: Mermaid accepts string theme values here, but the renderer boundary does not expose a precise type for this config property.
      theme: theme as any,
      // biome-ignore lint/suspicious/noExplicitAny: Mermaid accepts "classic" | "handDrawn" for `look`, but the renderer boundary does not expose a precise type for this config property.
      look: look as any,
    },
  });
  const r0 = r[0] as PromiseSettledResult<RenderResult>;
  return r0.status === "fulfilled" ? r0.value : Promise.reject(r0.reason);
}
