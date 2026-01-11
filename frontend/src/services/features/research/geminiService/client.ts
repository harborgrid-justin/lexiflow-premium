/**
 * GeminiService - Client Factory
 * Singleton-like accessor for Google Generative AI client
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { AI_CONFIG } from "@/config/features/ai.config";

/**
 * Singleton-like accessor to ensure consistent config and prevent unnecessary instantiation overhead
 * Checks multiple sources for API key: env vars, localStorage
 * @private
 */
export const getClient = () => {
  // Check environment variables (Vite-prefixed and standard)
  const apiKey = AI_CONFIG.geminiKey;

  if (!apiKey) {
    throw new Error(
      "Gemini API key not configured. Please set VITE_GEMINI_API_KEY environment variable or gemini_api_key in storage."
    );
  }
  return new GoogleGenerativeAI(apiKey);
};
