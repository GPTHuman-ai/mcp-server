import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GptHumanAPI } from "../src/GptHumanAPI";
import { HttpsClient } from "../src/HttpsClient";
import { HumanizerResponse } from "../src/type";


describe("GptHumanAPI", () => {
    let instance: GptHumanAPI;
    let requestMock: jest.Mock<
        (url: string, method: string, body: string) => Promise<{
            data: HumanizerResponse;
            statusCode: number;
        }>
    >;

    const humanizerResponse: HumanizerResponse = {
        id: "request_123",
        language: "en",
        similarity: 87,
        readability: 72,
        humanScore: 94,
        status: "200",
        output: "This is the rewritten humanized output.",
        outputWordCount: 6,
        outputCharCount: 39,
        creditUsage: 10,
        creditBalance: 990,
        tone: "College",
        mode: "Balanced",
        wordCount: 120,
        charCount: 800,
        timestamp: "2026-06-23T15:00:00.000Z",
    };

    beforeEach(() => {
        requestMock = jest.fn(async () => ({
            data: humanizerResponse,
            statusCode: 200,
        }));

        instance = new GptHumanAPI({
            request: requestMock,
        } as unknown as HttpsClient);
    });

    describe("humanize", () => {
        it("calls the humanize endpoint with default tone and mode", async () => {
            const text = "A".repeat(300);

            const response = await instance.humanize(text);

            expect(response).toEqual({
                data: humanizerResponse,
                statusCode: 200,
            });
            expect(requestMock).toHaveBeenCalledTimes(1);
            expect(requestMock).toHaveBeenCalledWith(
                "/v1/humanize",
                "POST",
                JSON.stringify({
                    text,
                    tone: "College",
                    mode: "Balanced",
                }),
            );
        });

        it("passes custom tone and mode to the request body", async () => {
            const text = "B".repeat(300);

            await instance.humanize(text, "PhD", "Enhanced");

            expect(requestMock).toHaveBeenCalledWith(
                "/v1/humanize",
                "POST",
                JSON.stringify({
                    text,
                    tone: "PhD",
                    mode: "Enhanced",
                }),
            );
        });
    });

    describe("assembleResponseForOutput", () => {
        it("returns the humanized output as the first content block", () => {
            const response = instance.assembleResponseForOutput(humanizerResponse);

            expect(response.content[0]).toEqual({
                type: "text",
                text: humanizerResponse.output,
            });
        });

        it("includes response metadata in the second content block", () => {
            const response = instance.assembleResponseForOutput(humanizerResponse);

            expect(response.content[1].type).toBe("text");
            expect(response.content[1].text).toContain("### Humanize result");
            expect(response.content[1].text).toContain("- **Human score:** Human Score: 94");
            expect(response.content[1].text).toContain("- **Similarity to original:** 87%");
            expect(response.content[1].text).toContain("- **Language detected:** en");
            expect(response.content[1].text).toContain("- **Credits used:** 10 (balance: 990)");
            expect(response.content[1].text).toContain("- **Request ID:** request_123");
        });

        it("shows N/A when humanScore is null", () => {
            const response = instance.assembleResponseForOutput({
                ...humanizerResponse,
                humanScore: null,
            });

            expect(response.content[1].text).toContain(
                "N/A (language not supported by AI detector)",
            );
        });
    });
});