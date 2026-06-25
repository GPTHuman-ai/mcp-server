# GPTHuman MCP Server

[![npm version](https://img.shields.io/npm/v/@gpthuman/mcp-server.svg)](https://www.npmjs.com/package/@gpthuman/mcp-server)
[![License](https://img.shields.io/npm/l/@gpthuman/mcp-server.svg)](./LICENSE)
[![Node version](https://img.shields.io/node/v/@gpthuman/mcp-server.svg)](https://nodejs.org)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io)

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server providing access to GPTHuman's API, the leading platform for rewriting AI-generated text into more natural, human-sounding prose, with detector-oriented metadata returned when available. This allows any MCP-compatible client (Cursor, Claude Desktop, etc.) to call the humanizer tool natively.

The server is shipped as a single `humanize_text` tool that rewrites AI-generated text into a more natural, human-sounding variant, while preserving the requested tone and rewrite mode.

## Quick Start

You can run the server directly and test it in 60 seconds:

```bash
export GPTHUMAN_API_KEY=...
npx -y @gpthuman/mcp-server
```

To test the server interactively with the MCP Inspector before wiring it up to Cursor or Claude:

```bash
npx @modelcontextprotocol/inspector npx -y @gpthuman/mcp-server
```

## Requirements

- Node.js `>= 22.0.0`
- A GPTHuman API key — get one at [GPTHuman.ai](https://app.gpthuman.ai/api)

## Configuration

The server reads a single environment variable:

| Variable           | Required | Description                  |
| ------------------ | -------- | ---------------------------- |
| `GPTHUMAN_API_KEY` | Yes      | Your GPTHuman API key.       |

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

> **Security Note:** While the example above places the `GPTHUMAN_API_KEY` directly in JSON, we recommend using environment variables or local secret storage when possible. Never commit `.cursor/mcp.json` with real API keys to version control.

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

**Example Output**
```
---
**Metadata Summary:**
- **Human Score:** 98%
- **Similarity:** 85%
- **Readability:** College-level
- **Credit Usage:** 142
- **Remaining Balance:** 4,858
- **Request ID:** req_xyz123
```

## Example Prompts for MCP Clients

Once the server is configured, try giving your AI agent prompts like:
- “Humanize this generated blog intro in College tone using Balanced mode.”
- “Rewrite this product description in Professional mode.”
- “Use Enhanced mode but preserve the original meaning.”

## Credit Usage & Privacy

- **Credit Usage:** Credits are consumed per word of output generated.
- **Privacy:** Submitted content is private and is **not used for retraining** AI models.

## Troubleshooting

- **401:** Invalid or missing API key. Verify your `GPTHUMAN_API_KEY` is set correctly.
- **400:** The text provided is under 300 characters or over 2,000 words.
- **429:** Rate limit exceeded or insufficient credits.
- **Node version issue:** Ensure you are using Node >=22.
- **`humanScore: null`:** The detector score is unavailable for that specific language or content type.

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
  GptHumanAPI.ts      Wrapper around the GPTHuman REST API.
  HttpsClient.ts      Thin axios wrapper with auth and timeout.
  type.d.ts           Shared request/response interfaces.
```

## Links

- [GPTHuman](https://gpthuman.ai)
- [GPTHuman API docs](https://docs.gpthuman.ai)
- [GPTHuman Dashboard](https://app.gpthuman.ai)
- [Model Context Protocol specification](https://modelcontextprotocol.io)

## License

Apache-2.0 — see [LICENSE](./LICENSE).
