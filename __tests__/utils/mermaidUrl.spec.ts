import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { createMermaidInkUrl } from "../../src/utils/mermaidUrl";

function decodePayload(url: string): {
  code: string;
  mermaid: { theme: string; look: string };
} {
  const encoded = url.split("pako:")[1];
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const buffer = Buffer.from(padded, "base64");
  return JSON.parse(inflateSync(buffer).toString("utf-8"));
}

describe("createMermaidInkUrl", () => {
  const sample = "graph TD;A-->B;";

  it("defaults to classic look when not specified", () => {
    const url = createMermaidInkUrl(sample, "img");
    expect(url.startsWith("https://mermaid.ink/img/pako:")).toBe(true);
    const payload = decodePayload(url);
    expect(payload.mermaid.theme).toBe("default");
    expect(payload.mermaid.look).toBe("classic");
    expect(payload.code).toBe(sample);
  });

  it("propagates handDrawn look into the mermaid.ink payload", () => {
    const url = createMermaidInkUrl(sample, "svg", "forest", "handDrawn");
    expect(url.startsWith("https://mermaid.ink/svg/pako:")).toBe(true);
    const payload = decodePayload(url);
    expect(payload.mermaid.theme).toBe("forest");
    expect(payload.mermaid.look).toBe("handDrawn");
  });

  it("uses the requested variant in the URL path", () => {
    const svgUrl = createMermaidInkUrl(sample, "svg");
    const imgUrl = createMermaidInkUrl(sample, "img");
    expect(svgUrl).toMatch(/^https:\/\/mermaid\.ink\/svg\//);
    expect(imgUrl).toMatch(/^https:\/\/mermaid\.ink\/img\//);
  });
});
