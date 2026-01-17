/**
 * GeminiService - Content Generation
 * Draft generation, streaming, and reply generation
 */

import { Prompts } from "@/services/ai/prompts";
import { withRetry } from "@/utils/apiUtils";

import { getClient } from "./client";

/**
 * Stream draft generation for real-time UI updates
 */
export async function* streamDraft(
  context: string,
  type: string
): AsyncGenerator<string, void, unknown> {
  try {
    const model = getClient().getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });
    const result = await model.generateContentStream(
      Prompts.Draft(context, type)
    );
    for await (const chunk of result.stream) {
      const chunkText = chunk.response.text();
      if (chunkText) yield chunkText;
    }
  } catch {
    yield "Error streaming content.";
  }
}

/**
 * Generate complete draft document
 */
export async function generateDraft(prompt: string, type: string): Promise<string> {
  return withRetry(async () => {
    try {
      const model = getClient().getGenerativeModel({
        model: "gemini-2.0-flash-exp",
      });
      const result = await model.generateContent(Prompts.Draft(prompt, type));
      return result.response.text() || "Error generating content.";
    } catch {
      return "Generation failed.";
    }
  });
}

/**
 * Generate professional reply to message
 */
export async function generateReply(lastMsg: string, role: string): Promise<string> {
  return withRetry(async () => {
    try {
      const model = getClient().getGenerativeModel({
        model: "gemini-2.0-flash-exp",
      });
      const result = await model.generateContent(
        `Draft a professional reply to this message from a ${role}: "${lastMsg}"`
      );
      return result.response.text() || "";
    } catch {
      return "Unable to generate reply.";
    }
  });
}

/**
 * Draft document (wrapper for generateDraft with callback support)
 */
export async function draftDocument(
  prompt: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  const stream = streamDraft(prompt, "document");
  for await (const chunk of stream) {
    onChunk(chunk);
  }
}

/**
 * Suggest reply (wrapper for generateReply)
 */
export async function suggestReply(threadMessages: string[]): Promise<string> {
  // Use the last message for context
  const lastMessage = threadMessages[threadMessages.length - 1] || "";
  return generateReply(lastMessage, "professional");
}
