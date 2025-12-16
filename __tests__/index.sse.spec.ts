import { spawn } from "node:child_process";
import net from "node:net";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { describe, expect, it } from "vitest";

// CI runners occasionally hang booting Playwright/Chromium; opt in with RUN_E2E=1.
const isCI = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";
const shouldRunE2E = !isCI || process.env.RUN_E2E === "1";
const describeE2E = shouldRunE2E ? describe.sequential : describe.skip;

// These helpers keep the SSE integration test stable on slower CI runners by
// waiting for the server to actually bind and advertise readiness before the
// client begins connecting. This avoids the 30s timeout we saw when the client
// raced the server startup.
function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const address = srv.address();
      if (address && typeof address === "object") {
        const { port } = address;
        srv.close(() => resolve(port));
      } else {
        srv.close();
        reject(new Error("Failed to acquire a free port"));
      }
    });
    srv.on("error", reject);
  });
}

function waitForPort(port: number, timeoutMs = 15000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const tryConnect = () => {
      const socket = net.connect({ port }, () => {
        socket.destroy();
        resolve();
      });

      socket.on("error", () => {
        socket.destroy();
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Port ${port} did not open within ${timeoutMs}ms`));
          return;
        }
        setTimeout(tryConnect, 200);
      });
    };

    tryConnect();
  });
}

function spawnAsync(
  command: string,
  args: string[],
  readyPattern?: RegExp,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);
    let settled = false;

    const cleanup = () => {
      child.stdout?.removeListener("data", onData);
      child.stderr?.removeListener("data", onData);
    };

    const onData = (data: Buffer) => {
      const text = data.toString();
      if (readyPattern?.test(text) && !settled) {
        settled = true;
        cleanup();
        clearTimeout(timer);
        resolve(child);
      }
    };

    child.stdout?.on("data", onData);
    child.stderr?.on("data", onData);

    child.on("error", (err) => {
      if (!settled) {
        settled = true;
        cleanup();
        clearTimeout(timer);
        reject(err);
      }
    });

    child.on("exit", (code) => {
      if (!settled) {
        settled = true;
        cleanup();
        clearTimeout(timer);
        reject(new Error(`Process exited with code ${code}`));
      }
    });

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanup();
        // Fallback: proceed even if we never saw the startup log; readiness
        // will still be verified by waitForPort.
        resolve(child);
      }
    }, 5000);
  });
}

function killAsync(child: any): Promise<void> {
  return new Promise((resolve) => {
    child.on("exit", () => {
      resolve();
    });
    child.kill();
  });
}

// Keep this suite serial so nothing else contends for the child process/port.
describeE2E("MCP Mermaid Server (SSE)", () => {
  it("sse end-to-end", async () => {
    const port = await getFreePort();
    const child = await spawnAsync(
      "node",
      ["./build/index.js", "-t", "sse", "-p", String(port)],
      /SSE Server listening on/,
    );

    // Actively poll for the port to open; avoids racing the server startup on CI.
    await waitForPort(port, 15000);

    const url = `http://localhost:${port}/sse`;
    const transport = new SSEClientTransport(new URL(url), {});

    const client = new Client(
      { name: "sse-client", version: "1.0.0" },
      { capabilities: {} },
    );

    try {
      // Exercise the real tool end-to-end (per maintainer ask); this triggers
      // Playwright/Chromium under the hood, so keep the generous timeout and
      // readiness checks to avoid flakes on CI.
      await client.connect(transport);
      const listTools = await client.listTools();

      expect(listTools.tools.length).toBe(1);
      expect(listTools.tools[0].name).toBe("generate_mermaid_diagram");

      const mermaidCode = `sequenceDiagram
  Alice->>John: Hello John
  John-->>Alice: Hi Alice`;

      const res = await client.callTool({
        name: "generate_mermaid_diagram",
        arguments: {
          mermaid: mermaidCode,
          theme: "dark",
          outputType: "png_url",
        },
      });

      // @ts-expect-error ignore
      expect(res.content[0].text).toContain("https://mermaid.ink/img/pako:");
    } finally {
      await killAsync(child);
    }
  }, 120000); // Allow extra time on CI runners; readiness + Playwright render can be slow.
});
