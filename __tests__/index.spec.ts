import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { describe, expect, it } from "vitest";

describe("MCP Mermaid Server", () => {
  it("stdio", async () => {
    const transport = new StdioClientTransport({
      command: "node",
      args: ["./build/index.js"],
    });
    const client = new Client({
      name: "stdio-client",
      version: "1.0.0",
    });
    await client.connect(transport);
    const listTools = await client.listTools();

    expect(listTools.tools.length).toBe(1);
    expect(listTools.tools[0].name).toBe("generate_mermaid_diagram");

    const mermaidCode = `flowchart TD
  A[Start] --> B[Process]
  B --> C[End]`;

    const res = await client.callTool({
      name: "generate_mermaid_diagram",
      arguments: {
        mermaid: mermaidCode,
        theme: "default",
        backgroundColor: "white",
        outputType: "svg_url",
      },
    });

    // @ts-expect-error ignore
    expect(res.content[0].text).toContain("https://mermaid.ink/svg/pako:");
  }, 30000);
});
