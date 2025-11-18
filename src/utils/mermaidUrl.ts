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
 */
export function createMermaidInkUrl(
  mermaid: string,
  variant: "svg" | "img",
): string {
  const encoded = encodeMermaidToBase64Url(mermaid);
  return `https://mermaid.ink/${variant}/pako:${encoded}`;
}
