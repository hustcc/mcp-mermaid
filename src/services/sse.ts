import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import type { Request, Response } from "express";
import express from "express";

export const startSSEMcpServer = async (
  server: Server,
  endpoint = "/sse",
  port = 3033,
  host?: string,
): Promise<void> => {
  const app = express();
  app.use(express.json());

  const transports: Record<string, SSEServerTransport> = {};

  app.get(endpoint, async (req: Request, res: Response) => {
    try {
      const transport = new SSEServerTransport("/messages", res);
      transports[transport.sessionId] = transport;
      transport.onclose = () => delete transports[transport.sessionId];
      await server.connect(transport);
    } catch (error) {
      if (!res.headersSent)
        res.status(500).send("Error establishing SSE stream");
    }
  });

  app.post("/messages", async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string;
    if (!sessionId) return res.status(400).send("Missing sessionId parameter");

    const transport = transports[sessionId];
    if (!transport) return res.status(404).send("Session not found");

    try {
      await transport.handlePostMessage(req, res, req.body);
    } catch (error) {
      if (!res.headersSent) res.status(500).send("Error handling request");
    }
  });

  const cb = () => {
    const shownHost = host || "localhost";
    console.log(
      `SSE Server listening on http://${shownHost}:${port}${endpoint}`,
    );
  };
  if (host) app.listen(port, host, cb);
  else app.listen(port, cb);
};
