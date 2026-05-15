import { deflateSync } from "node:zlib";

/**
 * Encodes mermaid text into the Base64URL deflated format used by mermaid.ink.
 */

function encodeMermaidToBase64Url(mermaid: string): string {
  const compressed = deflateSync(mermaid, { level: 9 });
  return compressed
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

/**
 * Creates a public mermaid.ink URL for the given mermaid definition.
 * The payload is a JSON object `{ code, mermaid: { theme, look } }` as expected by mermaid.ink.
 * `look` defaults to `"classic"`; pass `"handDrawn"` for a sketch-style rendering.
 */
export function createMermaidInkUrl(
  mermaid: string,
  variant: "svg" | "img",
  theme = "default",
  look: "classic" | "handDrawn" = "classic",
): string {
  const payload = JSON.stringify({
    code: mermaid,
    mermaid: { theme, look },
  });
  const encoded = encodeMermaidToBase64Url(payload);
  return `https://mermaid.ink/${variant}/pako:${encoded}`;
}
