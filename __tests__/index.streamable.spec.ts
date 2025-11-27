import { spawn } from "node:child_process";
import net from "node:net";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { describe, expect, it } from "vitest";

// CI runners occasionally hang booting Playwright/Chromium; opt in with RUN_E2E=1.
const isCI = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";
const shouldRunE2E = !isCI || process.env.RUN_E2E === "1";
const describeE2E = shouldRunE2E ? describe.sequential : describe.skip;

// Helpers mirror the SSE e2e: pick a free port, wait for readiness, and avoid
// racing the server startup on CI. This keeps the real render path stable.
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

function waitForPort(port: number, timeoutMs = 30000): Promise<void> {
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

// Serial to avoid contention; this uses the real tool (Playwright render).
describeE2E("MCP Mermaid Server (Streamable)", () => {
  it("streamable end-to-end", async () => {
    const port = await getFreePort();
    const child = await spawnAsync(
      "node",
      ["./build/index.js", "-t", "streamable", "-p", String(port)],
      /Streamable HTTP Server listening on/,
    );

    await waitForPort(port, 30000);

    const url = `http://localhost:${port}/mcp`;
    const transport = new StreamableHTTPClientTransport(new URL(url));
    const client = new Client({
      name: "streamable-http-client",
      version: "1.0.0",
    });

    try {
      await client.connect(transport);

      // On slower runners the first accept/handshake can take a moment.
      // Retry a couple times before giving up so we don't flake on CI.
      const listTools = await (async () => {
        let lastError: unknown;
        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            return await client.listTools();
          } catch (error) {
            lastError = error;
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
        throw lastError;
      })();

      expect(listTools.tools.length).toBe(1);
      expect(listTools.tools[0].name).toBe("generate_mermaid_diagram");

      const mermaidCode = `flowchart TD
  A[User] -->|Uses| B[Web App]
  B -->|Reads/Writes| C[(Database)]`;

      const res = await client.callTool({
        name: "generate_mermaid_diagram",
        arguments: {
          mermaid: mermaidCode,
          theme: "default",
          outputType: "png_url",
        },
      });

      // @ts-expect-error ignore
      expect(res.content[0].text).toContain("https://mermaid.ink/img/pako:");
    } finally {
      await killAsync(child);
    }
  }, 120000); // Allow extra time for Playwright render on CI.
});
