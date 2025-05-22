# MCP Mermaid ![](https://badge.mcpx.dev?type=server 'MCP Server')  [![build](https://github.com/hustcc/mcp-mermaid/actions/workflows/build.yml/badge.svg)](https://github.com/hustcc/mcp-mermaid/actions/workflows/build.yml) [![npm Version](https://img.shields.io/npm/v/mcp-mermaid.svg)](https://www.npmjs.com/package/mcp-mermaid) [![smithery badge](https://smithery.ai/badge/@hustcc/mcp-mermaid)](https://smithery.ai/server/@hustcc/mcp-mermaid) [![npm License](https://img.shields.io/npm/l/mcp-mermaid.svg)](https://www.npmjs.com/package/mcp-mermaid)

❤️ Generate [mermaid](https://mermaid.js.org/) diagram and chart with AI MCP dynamically. Also you can use [mcp-server-chart](https://github.com/antvis/mcp-server-chart) to generate chart, graph, map.


## 🤖 Usage

To use with `Desktop APP`, such as Claude, VSCode, Cline, Cherry Studio, and so on, add the  MCP server config below. On Mac system:

```json
{
  "mcpServers": {
    "mcp-mermaid": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-mermaid"
      ]
    }
  }
}
```

On Window system:

```json
{
  "mcpServers": {
    "mcp-mermaid": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "mcp-mermaid"
      ]
    }
  }
}
```

Also, you can use it on aliyun, modelscope, glama.ai, smithery.ai or others with HTTP, SSE Protocol.


## 🚰 Run with SSE or Streamable transport

Install the package globally.

```bash
npm install -g mcp-mermaid
```

Run the server with your preferred transport option:

```bash
# For SSE transport (default endpoint: /sse)
mcp-mermaid -t sse

# For Streamable transport with custom endpoint
mcp-mermaid -t streamable
```

Then you can access the server at:
- SSE transport: `http://localhost:3033/sse`
- Streamable transport: `http://localhost:3033/mcp`


## 🎮 CLI Options

You can also use the following CLI options when running the MCP server. Command options by run cli with `-h`.

```plain
MCP Mermaid CLI

Options:
  --transport, -t  Specify the transport protocol: "stdio", "sse", or "streamable" (default: "stdio")
  --port, -p       Specify the port for SSE or streamable transport (default: 3033)
  --endpoint, -e   Specify the endpoint for the transport:
                    - For SSE: default is "/sse"
                    - For streamable: default is "/mcp"
  --help, -h       Show this help message
```


## 🔨 Development

Install dependencies:

```bash
npm install
```

Build the server:

```bash
npm run build
```

Start the MCP server:

```bash
npm run start
```


## 📄 License

MIT@[hustcc](https://github.com/hustcc).
