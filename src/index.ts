#!/usr/bin/env node
import { parseArgs } from "node:util";
import {
  runHTTPStreamableServer,
  runSSEServer,
  runStdioServer,
} from "./server";

// Parse command line arguments
const { values } = parseArgs({
  options: {
    transport: {
      type: "string",
      short: "t",
      default: "stdio",
    },
    port: {
      type: "string",
      short: "p",
      default: "3033",
    },
    host: {
      type: "string",
      short: "H",
      default: "",
    },
    endpoint: {
      type: "string",
      short: "e",
      default: "", // We'll handle defaults per transport type
    },
    help: {
      type: "boolean",
      short: "h",
    },
  },
});

// Display help information if requested
if (values.help) {
  console.log(`
MCP Mermaid CLI

Options:
  --transport, -t  Specify the transport protocol: "stdio", "sse", or "streamable" (default: "stdio")
  --port, -p       Specify the port for SSE or streamable transport (default: 3033)
  --host, -H       Specify the host to bind (e.g., 0.0.0.0)
  --endpoint, -e   Specify the endpoint for the transport:
                   - For SSE: default is "/sse"
                   - For streamable: default is "/mcp"
  --help, -h       Show this help message
  `);
  process.exit(0);
}

// Run in the specified transport mode
const transport = values.transport.toLowerCase();

if (transport === "sse") {
  const port = Number.parseInt(values.port as string, 10);
  // Use provided endpoint or default to "/sse" for SSE
  const endpoint = values.endpoint || "/sse";
  const host = (values.host as string) || undefined;
  runSSEServer(endpoint, port, host).catch(console.error);
} else if (transport === "streamable") {
  const port = Number.parseInt(values.port as string, 10);
  // Use provided endpoint or default to "/mcp" for streamable
  const endpoint = values.endpoint || "/mcp";
  const host = (values.host as string) || undefined;
  runHTTPStreamableServer(endpoint, port, host).catch(console.error);
} else {
  runStdioServer().catch(console.error);
}
