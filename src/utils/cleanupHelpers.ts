import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { Logger } from "./logger";

/**
 * Create a server cleanup handler
 */
export function createServerCleanup(server: Server): () => void {
  return () => {
    try {
      server.close();
    } catch (error) {
      Logger.error("Error closing server", error);
    }
  };
}

/**
 * Create a transport cleanup handler
 */
export function createTransportCleanup(transport: {
  close: () => void;
}): () => void {
  return () => {
    try {
      transport.close();
    } catch (error) {
      Logger.error("Error closing transport", error);
    }
  };
}

/**
 * Create a combined cleanup handler for server and transport
 */
export function createCombinedCleanup(
  server: Server,
  transport: { close: () => void },
): () => void {
  return () => {
    try {
      transport.close();
      server.close();
    } catch (error) {
      Logger.error("Error during combined cleanup", error);
    }
  };
}
