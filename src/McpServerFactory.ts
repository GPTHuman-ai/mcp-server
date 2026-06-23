import { HttpsClient } from "./HttpsClient";
import { GptHumanAPI } from "./GptHumanAPI";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const MCP_SERVER_NAME = "GPTHuman MCP Server";
const MCP_SERVER_VERSION = "1.0.0";
const MCP_SERVER_WEBSITE_URL = "https://github.com/GPTHuman-ai/mcp-server";
const MCP_SERVER_DESCRIPTION =
  "A Model Context Protocol (MCP) server that exposes GPTHuman's AI humanization API. It provides tools for transforming AI-generated text into more natural, human-sounding writing while preserving the requested tone and rewrite mode.";

export function createMcpServer(apiKey: string, apiBaseUrl: string): McpServer {
  const server = new McpServer({
    name: MCP_SERVER_NAME,
    version: MCP_SERVER_VERSION,
    websiteUrl: MCP_SERVER_WEBSITE_URL,
    description: MCP_SERVER_DESCRIPTION,
  });

  const httpsClient = new HttpsClient(apiKey, apiBaseUrl);
  const gptHumanAPI = new GptHumanAPI(httpsClient);

  // -- Register Humanizer Tool (v1)
  server.registerTool(
    "humanize_text",
    {
      title: "Humanize Text",
      description:
        "Transforms AI-generated text into a more natural, human-sounding variant while preserving the requested tone and rewrite mode. Input must be at least 300 characters and must not exceed 2,000 words.",
      annotations: {
        title:
          "Humanize AI-Generated Text into a more natural, human-sounding variant while preserving the requested tone and rewrite mode.",
        openWorldHint: true,
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
      inputSchema: {
        text: z
          .string()
          .min(300, "Text must be at least 300 characters long.")
          .refine(
            (value) => value.trim().split(/\s+/).filter(Boolean).length <= 2000,
            { message: "Text must not exceed 2,000 words." },
          )
          .describe(
            "The text to humanize. Must be at least 300 characters and must not exceed 2,000 words.",
          ),
        tone: z
          .enum(["Standard", "HighSchool", "College", "PhD"])
          .optional()
          .describe(
            "Optional tone for the rewritten text. Defaults to `College` when omitted.",
          ),
        mode: z
          .enum(["Professional", "Balanced", "Enhanced"])
          .optional()
          .describe(
            "Optional rewrite mode. Defaults to `Balanced` when omitted.",
          ),
      },
    },
    async ({ text, tone, mode }) => {
      try {
        const { data, statusCode } = await gptHumanAPI.humanize(
          text,
          tone,
          mode,
        );

        if (statusCode !== 200) {
          let stringError = "Unknown error";
          if (data) {
            if (typeof data === "string") {
              stringError = data;
            } else if (data instanceof Error) {
              stringError = data.message;
            } else {
              // Try to extract a specific error message if present, otherwise stringify the whole object
              const typedData = data as any;
              if (typedData.error && typeof typedData.error === "string") {
                stringError = typedData.error;
              } else if (typedData.message && typeof typedData.message === "string") {
                stringError = typedData.message;
              } else {
                stringError = JSON.stringify(data, null, 2);
              }
            }
          }
          const completeError = `An error occurred while humanizing the text (Status ${statusCode}): ${stringError}`;
          return {
            content: [
              {
                type: "text",
                text: completeError,
              },
            ],
          };
        }

        return gptHumanAPI.assembleResponseForOutput(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `An unexpected error occurred while humanizing the text: ${errorMessage}`,
            },
          ],
        };
      }
    },
  );

  return server;
}
