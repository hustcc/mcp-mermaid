/**
 * @description Render mermaid with puppeteer.
 */
import {
  type CreateMermaidRendererOptions,
  type RenderResult,
  createMermaidRenderer,
} from "mermaid-isomorphic";

/**
 * Ref:
 * - https://github.com/mermaid-js/mermaid-cli/blob/master/src/index.js
 * - https://github.com/remcohaszing/mermaid-isomorphic
 * @returns
 */
export async function renderMermaid(
  mermaid: string,
  options: CreateMermaidRendererOptions = {},
): Promise<RenderResult> {
  const renderer = createMermaidRenderer(options);
  const r = await renderer([mermaid]);
  const r0 = r[0] as PromiseSettledResult<RenderResult>;
  return r0.status === "fulfilled" ? r0.value : Promise.reject(r0.reason);
}
