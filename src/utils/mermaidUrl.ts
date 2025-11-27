import { deflateSync } from "node:zlib";

type MermaidConfig = {
  theme?: string;
  backgroundColor?: string;
  // Allow future config additions without changing the encoding logic.
  themeVariables?: {
    background?: string;
  };
};

type MermaidInkPayload = {
  code: string;
  mermaid?: MermaidConfig;
};

/**
 * Encodes mermaid text into the Base64URL deflated format used by mermaid.ink.
 */

function encodeMermaidToBase64Url(payload: MermaidInkPayload): string {
  // mermaid.ink expects a JSON payload that contains the code and optional
  // mermaid config (theme, background color, etc.).
  const serialized = JSON.stringify(payload);
  const compressed = deflateSync(serialized, { level: 9 });
  return compressed
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

/**
 * Creates a public mermaid.ink URL for the given mermaid definition.
 */
export function createMermaidInkUrl(
  mermaid: string,
  variant: "svg" | "img",
  options?: {
    theme?: string;
    backgroundColor?: string;
  },
): string {
  const mermaidConfig: MermaidConfig = {};

  if (options?.theme) {
    mermaidConfig.theme = options.theme;
  }

  if (options?.backgroundColor) {
    // mermaid.ink forwards this to the renderer; themeVariables.background gives
    // the same visual result for background fills.
    mermaidConfig.backgroundColor = options.backgroundColor;
    mermaidConfig.themeVariables = {
      background: options.backgroundColor,
    };
  }

  const payload: MermaidInkPayload = {
    code: mermaid,
    ...(Object.keys(mermaidConfig).length ? { mermaid: mermaidConfig } : {}),
  };

  const encoded = encodeMermaidToBase64Url(payload);
  return `https://mermaid.ink/${variant}/pako:${encoded}`;
}
