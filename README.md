# <img src="https://mermaid.js.org/favicon.svg" height="24"/> MCP Mermaid ![](https://badge.mcpx.dev?type=server 'MCP Server')  [![build](https://github.com/hustcc/mcp-mermaid/actions/workflows/build.yml/badge.svg)](https://github.com/hustcc/mcp-mermaid/actions/workflows/build.yml) [![npm Version](https://img.shields.io/npm/v/mcp-mermaid.svg)](https://www.npmjs.com/package/mcp-mermaid) [![smithery badge](https://smithery.ai/badge/@hustcc/mcp-mermaid)](https://smithery.ai/server/@hustcc/mcp-mermaid) [![npm License](https://img.shields.io/npm/l/mcp-mermaid.svg)](https://www.npmjs.com/package/mcp-mermaid) [![Trust Score](https://archestra.ai/mcp-catalog/api/badge/quality/hustcc/mcp-mermaid)](https://archestra.ai/mcp-catalog/hustcc__mcp-mermaid)

Generate <img src="https://mermaid.js.org/favicon.svg" height="14"/> [mermaid](https://mermaid.js.org/) diagram and chart with AI MCP dynamically. Also you can use <img src="https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*ZFK8SrovcqgAAAAAAAAAAAAAemJ7AQ/original" height="14"/> [mcp-server-chart](https://github.com/antvis/mcp-server-chart) to generate chart, graph, map.


## ✨ Features

- Fully support all features and syntax of `Mermaid`.
- Support configuration of `backgroundColor` and `theme`, enabling large AI models to output rich style configurations.

- Support exporting to `base64`, `svg`, `mermaid`, `file`, and remote-friendly `svg_url`, `png_url` formats, with validation for `Mermaid` to facilitate the model's multi-round output of correct syntax and graphics. Use `outputType: "file"` to automatically save PNG diagrams to disk for AI agents, or the URL modes to share diagrams through public mermaid.ink links.


<img width="720" alt="mcp-mermaid" src="https://mermaid.js.org/header.png" />


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

### Option 1: Global Installation

Install the package globally:

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

### Option 2: Local Development

If you're working with the source code locally:

```bash
# Clone and setup
git clone https://github.com/hustcc/mcp-mermaid.git
cd mcp-mermaid
npm install
npm run build

# Run with npm scripts
npm run start:sse        # SSE transport on port 3033
npm run start:streamable # Streamable transport on port 1122
```

### Access Points

Then you can access the server at:

- SSE transport: `http://localhost:3033/sse`
- Streamable transport: `http://localhost:1122/mcp` (local) or `http://localhost:3033/mcp` (global)

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

### Start the MCP server

**Using MCP Inspector (for debugging):**

```bash
npm run start
```

**Using different transport protocols:**

```bash
# SSE transport (Server-Sent Events)
npm run start:sse

# Streamable HTTP transport
npm run start:streamable
```

**Direct node commands:**

```bash
# SSE transport on port 3033
node build/index.js --transport sse --port 3033

# Streamable HTTP transport on port 1122
node build/index.js --transport streamable --port 1122

# STDIO transport (for MCP client integration)
node build/index.js --transport stdio
```

## 📄 License

MIT@[hustcc](https://github.com/hustcc).
