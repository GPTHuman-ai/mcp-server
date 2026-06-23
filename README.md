# Gpthuman MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server providing access to GPTHuman's API, the leading platform for transforming AI-generated text into natural, human-sounding content that successfully bypasses AI detectors. This allows any MCP-compatible client (Cursor, Claude Desktop, etc.) to call the humanizer tool natively.

The server is shipped as a single `humanize_text` tool that rewrites AI-generated text into a more natural, human-sounding variant designed to bypass AI detectors, while preserving the requested tone and rewrite mode.

## Requirements

- Node.js `>= 22.0.0`
- A Gpthuman API key — get one at [gpthuman.ai](https://app.gpthuman.ai/api)

## Configuration

The server reads a single environment variable:

| Variable           | Required | Description                  |
| ------------------ | -------- | ---------------------------- |
| `GPTHUMAN_API_KEY` | Yes      | Your Gpthuman API key.       |

## Installation

### Cursor

Add the server to `~/.cursor/mcp.json` (or your workspace `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "gpthuman": {
      "command": "npx",
      "args": ["-y", "@gpthuman/mcp-server"],
      "env": {
        "GPTHUMAN_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Claude Desktop

Add it to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "gpthuman": {
      "command": "npx",
      "args": ["-y", "@gpthuman/mcp-server"],
      "env": {
        "GPTHUMAN_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Other clients

Any MCP client that supports the stdio transport can run the server with:

```bash
GPTHUMAN_API_KEY=your-api-key-here npx -y @gpthuman/mcp-server
```

## Tools

### `humanize_text`

Transforms AI-generated text into a more natural, human-sounding variant designed to bypass AI detectors, while preserving the requested tone and rewrite mode.

**Input parameters**

| Name   | Type   | Required | Default     | Description                                                                                                                  |
| ------ | ------ | -------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `text` | string | Yes      | —           | The text to humanize. Must be **at least 300 characters** and **at most 2,000 words**.                                       |
| `tone` | enum   | No       | `College`   | Target reading level / tone. One of `Standard`, `HighSchool`, `College`, `PhD`.                                              |
| `mode` | enum   | No       | `Balanced`  | Rewrite strategy. One of `Professional`, `Balanced`, `Enhanced`.                                                             |

**Output**

The tool returns two content blocks:

1. The humanized text (the primary payload).
2. A markdown summary with metadata: AI-detector human score, similarity to original, readability, detected language, applied tone and mode, input/output word and character counts, credit usage, remaining credit balance, and the request ID.

**Example call (from an MCP client)**

```json
{
  "name": "humanize_text",
  "arguments": {
    "text": "Your AI-generated text of at least 300 characters goes here...",
    "tone": "College",
    "mode": "Balanced"
  }
}
```

## Development

```bash
git clone https://github.com/GPTHuman-ai/mcp-server.git
cd mcp-server
npm install

cp .env.example .env
# Edit .env and set GPTHUMAN_API_KEY

npm run build
npm start
```

Available scripts:

| Script           | Description                                    |
| ---------------- | ---------------------------------------------- |
| `npm run build`  | Compile TypeScript to `dist/`.                 |
| `npm start`      | Run the compiled server on the stdio transport.|
| `npm run format` | Format the codebase with Prettier.             |
| `npm test`       | Run the Jest test suite.                       |

### Project structure

```
src/
  stdio.ts            Entry point — wires the server to the stdio transport.
  McpServerFactory.ts Builds the McpServer and registers tools.
  GptHumanAPI.ts      Wrapper around the Gpthuman REST API.
  HttpsClient.ts      Thin axios wrapper with auth and timeout.
  type.d.ts           Shared request/response interfaces.
```

## Links

- [Gpthuman](https://gpthuman.ai)
- [Gpthuman API docs](https://docs.gpthuman.ai)
- [Model Context Protocol specification](https://modelcontextprotocol.io)

## License

Apache-2.0 — see [LICENSE](./LICENSE).
