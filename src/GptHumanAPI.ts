import { HttpsClient } from "./HttpsClient";
import { HumanizerRequest, HumanizerResponse } from "./type";

export class GptHumanAPI {
  private readonly httpsClient: HttpsClient;

  private readonly routes: Record<string, string> = {
    humanize: "/v1/humanize",
  };

  private readonly methods: Record<string, string> = {
    humanize: "POST",
  };

  constructor(client: HttpsClient) {
    this.httpsClient = client;
  }

  public async humanize(
    text: string,
    tone: string = "College",
    mode: string = "Balanced",
  ): Promise<{ data: HumanizerResponse; statusCode: number }> {
    const request: HumanizerRequest = {
      text,
      tone,
      mode,
    };

    return await this.httpsClient.request<HumanizerResponse>(
      this.routes.humanize,
      this.methods.humanize,
      JSON.stringify(request),
    );
  }

  public assembleResponseForOutput(data: HumanizerResponse): {
    content: { type: "text"; text: string }[];
  } {
    const humanScoreText =
      data.humanScore !== null
        ? `Human Score: ${data.humanScore}`
        : "N/A (language not supported by AI detector)";

    const metadata = [
      `### Humanize result`,
      ``,
      `- **Human score:** ${humanScoreText}`,
      `- **Similarity to original:** ${data.similarity}%`,
      `- **Readability:** ${data.readability}`,
      `- **Language detected:** ${data.language}`,
      `- **Tone used:** ${data.tone}`,
      `- **Mode used:** ${data.mode}`,
      `- **Input:** ${data.wordCount} words / ${data.charCount} chars`,
      `- **Output:** ${data.outputWordCount} words / ${data.outputCharCount} chars`,
      `- **Credits used:** ${data.creditUsage} (balance: ${data.creditBalance})`,
      `- **Request ID:** ${data.id}`,
    ].join("\n");

    return {
      content: [
        {
          type: "text",
          text: data.output,
        },
        {
          type: "text",
          text: metadata,
        },
      ],
    };
  }
}
