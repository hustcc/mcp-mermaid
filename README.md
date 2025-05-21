# MCP Mermaid ![](https://badge.mcpx.dev?type=server 'MCP Server')  [![build](https://github.com/hustcc/mcp-mermaid/actions/workflows/build.yml/badge.svg)](https://github.com/hustcc/mcp-mermaid/actions/workflows/build.yml) [![npm Version](https://img.shields.io/npm/v/mcp-mermaid.svg)](https://www.npmjs.com/package/mcp-mermaid) [![smithery badge](https://smithery.ai/badge/@hustcc/mcp-mermaid)](https://smithery.ai/server/@hustcc/mcp-mermaid) [![npm License](https://img.shields.io/npm/l/mcp-mermaid.svg)](https://www.npmjs.com/package/mcp-mermaid)

❤️ Generate [mermaid](https://mermaid.js.org/) diagram and chart with AI MCP dynamically.


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
