#!/usr/bin/env node

import "dotenv/config";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./McpServerFactory";

const GPTHUMAN_API_KEY = process.env.GPTHUMAN_API_KEY
  ? process.env.GPTHUMAN_API_KEY
  : null;

if (!GPTHUMAN_API_KEY) {
  console.error("GPTHUMAN_API_KEY is not set");
  process.exit(1);
}
const GPTHUMAN_BASE_API_URL = "https://api.gpthuman.ai";

const server = createMcpServer(GPTHUMAN_API_KEY, GPTHUMAN_BASE_API_URL);

async function startStdioServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

startStdioServer().catch((e) => {
  console.error("Error starting GPTHuman MCP Server:", e);
  process.exit(1);
});
