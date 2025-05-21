# MCP Mermaid ![](https://badge.mcpx.dev?type=server 'MCP Server')  [![build](https://github.com/hustcc/mcp-mermind/actions/workflows/build.yml/badge.svg)](https://github.com/hustcc/mcp-mermind/actions/workflows/build.yml) [![npm Version](https://img.shields.io/npm/v/mcp-mermind.svg)](https://www.npmjs.com/package/mcp-mermind) [![smithery badge](https://smithery.ai/badge/@hustcc/mcp-mermind)](https://smithery.ai/server/@hustcc/mcp-mermind) [![npm License](https://img.shields.io/npm/l/mcp-mermind.svg)](https://www.npmjs.com/package/mcp-mermind)

❤️ Generate [mermaid](https://mermaid.js.org/) diagram and chart with AI MCP dynamically.


## 🤖 Usage

To use with `Desktop APP`, such as Claude, VSCode, [Cline](https://cline.bot/mcp-marketplace), Cherry Studio, and so on, add the  MCP server config below. On Mac system:

```json
{
  "mcpServers": {
    "mcp-mermind": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-mermind"
      ]
    }
  }
}
```

On Window system:

```json
{
  "mcpServers": {
    "mcp-mermind": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "mcp-mermind"
      ]
    }
  }
}
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
