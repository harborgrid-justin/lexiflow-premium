// =============================================================================
// AI INTELLIGENCE CONFIGURATION
// =============================================================================
// Settings for AI providers (Gemini, OpenAI) and models

export const AI_PROVIDER_GEMINI = "gemini";
export const AI_PROVIDER_OPENAI = "openai";

// Model Configurations
export const GEMINI_MODEL_DEFAULT = "gemini-2.0-flash-exp";
export const GEMINI_MODEL_FALLBACK = "gemini-1.5-pro";

// API Key Retrieval
export const getGeminiApiKey = () => {
  return (
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.GEMINI_API_KEY ||
    (typeof localStorage !== "undefined"
      ? localStorage.getItem("gemini_api_key")
      : null)
  );
};

export const getOpenAiApiKey = () => {
  return (
    import.meta.env.VITE_OPENAI_API_KEY ||
    (typeof localStorage !== "undefined"
      ? localStorage.getItem("openai_api_key")
      : null)
  );
};

export const AI_CONFIG = {
  providers: {
    gemini: AI_PROVIDER_GEMINI,
    openai: AI_PROVIDER_OPENAI,
  },
  models: {
    gemini: {
      default: GEMINI_MODEL_DEFAULT,
      fallback: GEMINI_MODEL_FALLBACK,
    },
  },
  get geminiKey() {
    return getGeminiApiKey();
  },
  get openAiKey() {
    return getOpenAiApiKey();
  },
} as const;
