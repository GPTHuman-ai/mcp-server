import { HttpsClient } from "./HttpsClient";
import { GptHumanAPI } from "./GptHumanAPI";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { HumanizerRequest } from "./type";

const MCP_SERVER_NAME = "Gpthuman MCP Server";
const MCP_SERVER_VERSION = "1.0.0";
const MCP_SERVER_WEBSITE_URL = "https://github.com/GPTHuman-ai/mcp-server";
const MCP_SERVER_DESCRIPTION =
    "A Model Context Protocol (MCP) Server by Gpthuman, the leading humanizer in the industry.";

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
        async ({ text, tone, mode }: HumanizerRequest) => {
            try {
                const { data, statusCode } = await gptHumanAPI.humanize(
                    text,
                    tone,
                    mode,
                );

                if (statusCode !== 200) {
                    const stringError = data ? JSON.stringify(data) : "Unknown error";
                    const completeError = `An error occurred while humanizing the text, please make sure to provide a valid API key. Error: ${stringError}`;
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
            } catch {
                return {
                    content: [
                        {
                            type: "text",
                            text: "An error occurred while humanizing the text, please make sure to provide a valid API key.",
                        },
                    ],
                };
            }
        },
    );

    return server;
}
