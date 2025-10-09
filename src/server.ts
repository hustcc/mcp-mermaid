import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import {
  startHTTPStreamableServer,
  startSSEMcpServer,
  startStdioMcpServer,
} from "./services";
import { schema, tool } from "./tools";
import { renderMermaid } from "./utils";
import { Logger } from "./utils/logger";

/**
 * Creates and configures an MCP server for mermaid generation.
 */
export function createServer(): Server {
  const server = new Server(
    {
      name: "mcp-mermaid",
      version: "0.1.3",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  setupToolHandlers(server);

  server.onerror = (error) => Logger.error("MCP Error", error);

  return server;
}

/**
 * Sets up tool handlers for the MCP server.
 */
function setupToolHandlers(server: Server): void {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [tool],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === tool.name) {
      try {
        const args = request.params.arguments || {};
        // Use safeParse instead of parse and try-catch.
        const result = schema.safeParse(args);
        if (!result.success) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Invalid parameters: ${result.error.message}`,
          );
        }

        const { mermaid, theme, backgroundColor, outputType = "png" } = args;
        const { id, svg, screenshot } = await renderMermaid(
          mermaid as string,
          theme as string,
          backgroundColor as string,
        );

        if (outputType === "mermaid") {
          return {
            content: [
              {
                type: "text",
                text: mermaid,
              },
            ],
          };
        }
        if (outputType === "svg") {
          return {
            content: [
              {
                type: "text",
                text: svg,
              },
            ],
          };
        }
        if (outputType === "file") {
          if (!screenshot) {
            throw new McpError(
              ErrorCode.InternalError,
              "Failed to generate screenshot for file output.",
            );
          }

          // Create a unique filename with timestamp and random suffix
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          const randomSuffix = Math.random().toString(36).substring(2, 8);
          const filename = `mermaid-${timestamp}-${randomSuffix}.png`;

          // Use current working directory to save the file
          const filePath = path.resolve(process.cwd(), filename);

          try {
            fs.writeFileSync(filePath, screenshot);
            return {
              content: [
                {
                  type: "text",
                  text: `Mermaid diagram saved to file: ${filePath}`,
                },
              ],
            };
          } catch (fileError) {
            throw new McpError(
              ErrorCode.InternalError,
              `Failed to save file: ${fileError instanceof Error ? fileError.message : "Unknown file error"}`,
            );
          }
        }
        return {
          content: [
            {
              type: "image",
              data: screenshot?.toString("base64"),
              mimeType: "image/png",
            },
          ],
        };
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      } catch (error: any) {
        if (error instanceof McpError) throw error;
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to generate mermaid: ${error?.message || "Unknown error."}`,
        );
      }
    } else {
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${request.params.name}.`,
      );
    }
  });
}

/**
 * Runs the server with stdio transport.
 */
export async function runStdioServer(): Promise<void> {
  const server = createServer();
  await startStdioMcpServer(server);
}

/**
 * Runs the server with SSE transport.
 */
export async function runSSEServer(
  endpoint = "/sse",
  port = 3033,
  host?: string,
): Promise<void> {
  const server = createServer();
  await startSSEMcpServer(server, endpoint, port, host);
}

/**
 * Runs the server with HTTP streamable transport.
 */
export async function runHTTPStreamableServer(
  endpoint = "/mcp",
  port = 3033,
  host?: string,
): Promise<void> {
  await startHTTPStreamableServer(createServer, endpoint, port, host);
}
