import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createTransportCleanup } from "../utils/cleanupHelpers";
import { shutdownManager } from "../utils/shutdownManager";

export async function startStdioMcpServer(server: Server): Promise<void> {
  const transport = new StdioServerTransport();

  // Register transport cleanup
  shutdownManager.registerCleanup(createTransportCleanup(transport));

  await server.connect(transport);
}
