import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { createMermaidInkUrl } from "../../src/utils/mermaidUrl";

describe("mermaidUrl", () => {
  describe("createMermaidInkUrl", () => {
    it("should generate SVG URL for simple mermaid diagram", () => {
      const mermaid = "graph TD;\\nA-->B;";
      const url = createMermaidInkUrl(mermaid, "svg");
      expect(url).toContain("https://mermaid.ink/svg/pako:");
      expect(url).toBeTruthy();
      expect(typeof url).toBe("string");
    });

    it("should generate IMG URL for simple mermaid diagram", () => {
      const mermaid = "graph TD;\\nA-->B;";
      const url = createMermaidInkUrl(mermaid, "img");
      expect(url).toContain("https://mermaid.ink/img/pako:");
      expect(url).toBeTruthy();
    });

    it("should encode complex mermaid diagrams", () => {
      const complexMermaid = `graph TB
        A[Start] --> B{Decision}
        B -->|Yes| C[Process 1]
        B -->|No| D[Process 2]
        C --> E[End]
        D --> E`;

      const url = createMermaidInkUrl(complexMermaid, "svg");

      expect(url).toBeDefined();
      expect(url).toContain("https://mermaid.ink/svg/pako:");
    });

    it("should handle special characters in mermaid code", () => {
      const mermaid =
        'graph TD; A["Special & Characters"]-->B["More + Signs"];';
      const url = createMermaidInkUrl(mermaid, "svg");

      expect(url).toBeDefined();
      expect(url).toContain("https://mermaid.ink/svg/pako:");
    });

    it("should produce different URLs for different variants", () => {
      const mermaid = "graph TD; A-->B;";
      const svgUrl = createMermaidInkUrl(mermaid, "svg");
      const imgUrl = createMermaidInkUrl(mermaid, "img");

      expect(svgUrl).not.toBe(imgUrl);
      expect(svgUrl).toContain("/svg/");
      expect(imgUrl).toContain("/img/");
    });

    it("should encode sequence diagrams", () => {
      const mermaid = `sequenceDiagram
        Alice->>John: Hello John, how are you?
        John-->>Alice: Great!`;

      const url = createMermaidInkUrl(mermaid, "svg");

      expect(url).toBeDefined();
      expect(url).toContain("https://mermaid.ink/svg/pako:");
    });

    it("should encode class diagrams", () => {
      const mermaid = `classDiagram
        Animal <|-- Duck
        Animal <|-- Fish
        Animal : +int age
        Animal : +String gender`;

      const url = createMermaidInkUrl(mermaid, "img");

      expect(url).toBeDefined();
      expect(url).toContain("https://mermaid.ink/img/pako:");
    });

    it("should handle empty mermaid code", () => {
      const mermaid = "";
      const url = createMermaidInkUrl(mermaid, "svg");

      expect(url).toBeDefined();
      expect(url).toContain("https://mermaid.ink/svg/pako:");
    });

    it("should produce base64url-safe encoding", () => {
      const mermaid = "graph TD; A-->B;";
      const url = createMermaidInkUrl(mermaid, "svg");

      // Extract the encoded part
      const encodedPart = url.split("pako:")[1];

      // Should not contain +, /, or = (base64url encoding)
      expect(encodedPart).not.toContain("+");
      expect(encodedPart).not.toContain("/");
      expect(encodedPart).not.toMatch(/=+$/);
    });

    it("should embed theme and background color into payload", () => {
      const mermaid = "graph TD; A-->B;";
      const url = createMermaidInkUrl(mermaid, "svg", {
        theme: "default",
        backgroundColor: "white",
      });

      const encodedPart = url.split("pako:")[1];
      const buffer = Buffer.from(
        encodedPart.replace(/-/g, "+").replace(/_/g, "/"),
        "base64",
      );

      const inflated = inflateSync(buffer).toString("utf-8");
      const payload = JSON.parse(inflated);

      expect(payload.code).toBe(mermaid);
      expect(payload.mermaid.theme).toBe("default");
      expect(payload.mermaid.backgroundColor).toBe("white");
      expect(payload.mermaid.themeVariables.background).toBe("white");
    });

    it("should handle flowcharts", () => {
      const mermaid = `flowchart LR
        A[Hard edge] -->|Link text| B(Round edge)
        B --> C{Decision}
        C -->|One| D[Result one]
        C -->|Two| E[Result two]`;

      const url = createMermaidInkUrl(mermaid, "svg");

      expect(url).toBeDefined();
      expect(url).toContain("https://mermaid.ink/svg/pako:");
    });

    it("should handle pie charts", () => {
      const mermaid = `pie title Pets adopted by volunteers
        "Dogs" : 386
        "Cats" : 85
        "Rats" : 15`;

      const url = createMermaidInkUrl(mermaid, "img");

      expect(url).toBeDefined();
      expect(url).toContain("https://mermaid.ink/img/pako:");
    });

    it("should handle gantt charts", () => {
      const mermaid = `gantt
        title A Gantt Diagram
        dateFormat YYYY-MM-DD
        section Section
        A task :a1, 2024-01-01, 30d`;

      const url = createMermaidInkUrl(mermaid, "svg");

      expect(url).toBeDefined();
      expect(url).toContain("https://mermaid.ink/svg/pako:");
    });
  });
});
