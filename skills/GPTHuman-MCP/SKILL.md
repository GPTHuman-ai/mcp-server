---
name: GPTHuman-humanizer
description: Transform AI-generated text into natural, human-sounding content that successfully bypasses AI detectors using GPTHuman
---

# GPTHuman Text Humanizer

This skill enables you to use the `humanize_text` tool provided by the GPTHuman MCP server to rewrite AI-generated text into natural, human-sounding prose with AI-detector metadata.

## When to Use

Use this skill when the user asks you to:
- "Humanize" a piece of text
- Rewrite AI-generated content to sound more human
- Make text bypass AI detectors or improve its human score
- Adjust the tone of an AI-generated draft to sound more natural

## How to Use

If the GPTHuman MCP server is connected, you will have access to the `humanize_text` tool.

Call the `humanize_text` tool with the following parameters:
- `text` (required): The text you want to humanize. **Note:** The text must be at least 300 characters and at most 2,000 words.
- `tone` (optional): The target reading level / tone. Valid options are `Standard`, `HighSchool`, `College`, `PhD`. Defaults to `College`.
- `mode` (optional): The rewrite strategy. Valid options are `Professional`, `Balanced`, `Enhanced`. Defaults to `Balanced`.

## Steps

1. **Verify Text Length:** Ensure the text provided by the user is at least 300 characters long. If it's too short, inform the user that GPTHuman requires a minimum of 300 characters for optimal results.
2. **Determine Tone and Mode:** If the user hasn't specified a tone or mode, use your best judgment based on the context, or use the defaults (`College` and `Balanced`).
3. **Execute the Tool:** Call `humanize_text` with the appropriate arguments.
4. **Present the Results:** Provide the humanized text to the user. You should also briefly mention the key metadata returned by the tool (such as the AI-detector Human Score, Similarity, and Credit Usage).

## Example Scenarios

- **Scenario 1:** The user says "Humanize this generated blog intro in College tone using Balanced mode."
  - **Action:** Call `humanize_text` with the user's text, `tone="College"`, and `mode="Balanced"`.
  
- **Scenario 2:** The user asks "Rewrite this product description in Professional mode."
  - **Action:** Call `humanize_text` with the user's text and `mode="Professional"`.
