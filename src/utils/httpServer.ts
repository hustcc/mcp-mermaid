import http from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { Logger } from "./logger";
import { shutdownManager } from "./shutdownManager";

/**
 * Interface for request handlers that will be passed to the server factory
 */
export interface RequestHandlers {
  /**
   * Main handler for HTTP requests
   */
  handleRequest: (req: IncomingMessage, res: ServerResponse) => Promise<void>;

  /**
   * Custom cleanup function to be called when the server is shutting down
   */
  cleanup?: () => void;

  /**
   * Server type name for logging purposes
   */
  serverType: string;
}

/**
 * Handles CORS headers for incoming requests
 */
function handleCORS(req: IncomingMessage, res: ServerResponse): void {
  if (req.headers.origin) {
    try {
      const origin = new URL(req.headers.origin as string);
      res.setHeader("Access-Control-Allow-Origin", origin.origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "*");
    } catch (error) {
      Logger.error("Error parsing origin", error);
    }
  }
}

/**
 * Handles common endpoints like health check and ping
 * @returns true if the request was handled, false otherwise
 */
function handleCommonEndpoints(
  req: IncomingMessage,
  res: ServerResponse,
): boolean {
  if (!req.url) {
    res.writeHead(400).end("No URL");
    return true;
  }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain" }).end("OK");
    return true;
  }

  if (req.method === "GET" && req.url === "/ping") {
    res.writeHead(200).end("pong");
    return true;
  }

  return false;
}

/**
 * Sets up cleanup handlers for the HTTP server
 */
function setupCleanupHandlers(
  httpServer: http.Server,
  customCleanup?: () => void,
): void {
  // Register HTTP server cleanup
  shutdownManager.registerCleanup(() => {
    return new Promise<void>((resolve) => {
      httpServer.close(() => {
        Logger.cleanup("HTTP server closed");
        resolve();
      });
    });
  });

  // Register custom cleanup if provided
  if (customCleanup) {
    shutdownManager.registerCleanup(customCleanup);
  }

  // Setup signal handlers only once
  shutdownManager.setupSignalHandlers();

  httpServer.once("close", () => {
    process.removeAllListeners("SIGINT");
    process.removeAllListeners("SIGTERM");
  });
}

/**
 * Logs server startup information with formatted URLs
 */
function logServerStartup(
  serverType: string,
  port: number,
  endpoint: string,
): void {
  Logger.serverStartup(serverType, port, endpoint);
}

/**
 * Creates a base HTTP server with common functionality
 */
export function createBaseHttpServer(
  port: number,
  endpoint: string,
  handlers: RequestHandlers,
): http.Server {
  const httpServer = http.createServer(async (req, res) => {
    // Handle CORS for all requests
    handleCORS(req, res);

    // Handle OPTIONS requests
    if (req.method === "OPTIONS") {
      res.writeHead(204).end();
      return;
    }

    // Handle common endpoints like health and ping
    if (handleCommonEndpoints(req, res)) return;

    // Pass remaining requests to the specific handler
    try {
      await handlers.handleRequest(req, res);
    } catch (error) {
      Logger.error(`Error in ${handlers.serverType} request handler`, error);
      res.writeHead(500).end("Internal Server Error");
    }
  });

  // Set up cleanup handlers
  setupCleanupHandlers(httpServer, handlers.cleanup);

  // Start listening and log server info
  httpServer.listen(port, () => {
    logServerStartup(handlers.serverType, port, endpoint);
  });

  return httpServer;
}
