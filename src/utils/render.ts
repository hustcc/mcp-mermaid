/**
 * @description Render mermaid with puppeteer.
 */
import { type RenderResult, createMermaidRenderer } from "mermaid-isomorphic";

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
): Promise<RenderResult> {
  const renderer = createMermaidRenderer();
  const r = await renderer([mermaid.replace(/\\n/g, "\n")], {
    // Image is needed.
    screenshot: true,
    containerStyle: {
      background: backgroundColor,
    },
    mermaidConfig: {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      theme: theme as any,
    },
  });
  const r0 = r[0] as PromiseSettledResult<RenderResult>;
  return r0.status === "fulfilled" ? r0.value : Promise.reject(r0.reason);
}
