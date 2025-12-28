/**
 * AI Provider Selector - Choose between Gemini and OpenAI
 */

import { GeminiService } from '../research/geminiService';
import { OpenAIService } from './openaiService';
import type { AIServiceInterface } from './aiProvider';

export type AIProvider = 'gemini' | 'openai';

// Get provider from localStorage or default to gemini
export const getAIProvider = (): AIProvider => {
  if (typeof localStorage === 'undefined') return 'gemini';
  const stored = localStorage.getItem('ai_provider');
  return (stored === 'openai' || stored === 'gemini') ? stored : 'gemini';
};

// Set provider in localStorage
export const setAIProvider = (provider: AIProvider): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('ai_provider', provider);
    console.log(`[AIProvider] Switched to ${provider.toUpperCase()}`);
  }
};

// Get the active AI service based on current provider
export const getAIService = (): AIServiceInterface => {
  const provider = getAIProvider();
  return provider === 'openai' ? OpenAIService : GeminiService;
};

// Check if API key is configured for a provider
export const isProviderConfigured = (provider: AIProvider): boolean => {
  if (typeof localStorage === 'undefined') return false;
  
  if (provider === 'gemini') {
    return !!(
      import.meta.env.VITE_GEMINI_API_KEY || 
      import.meta.env.GEMINI_API_KEY || 
      localStorage.getItem('gemini_api_key')
    );
  } else {
    return !!(
      import.meta.env.VITE_OPENAI_API_KEY || 
      import.meta.env.OPENAI_API_KEY || 
      localStorage.getItem('openai_api_key')
    );
  }
};

// Get configured API key for a provider
export const getProviderApiKey = (provider: AIProvider): string | null => {
  if (typeof localStorage === 'undefined') return null;
  
  if (provider === 'gemini') {
    return import.meta.env.VITE_GEMINI_API_KEY || 
           import.meta.env.GEMINI_API_KEY || 
           localStorage.getItem('gemini_api_key');
  } else {
    return import.meta.env.VITE_OPENAI_API_KEY || 
           import.meta.env.OPENAI_API_KEY || 
           localStorage.getItem('openai_api_key');
  }
};

// Set API key for a provider
export const setProviderApiKey = (provider: AIProvider, apiKey: string): void => {
  if (typeof localStorage === 'undefined') return;
  
  const storageKey = provider === 'gemini' ? 'gemini_api_key' : 'openai_api_key';
  localStorage.setItem(storageKey, apiKey);
};

// Get provider display name
export const getProviderDisplayName = (provider: AIProvider): string => {
  return provider === 'gemini' ? 'Google Gemini' : 'OpenAI GPT-4';
};

// Get provider status
export const getProviderStatus = (provider: AIProvider): { configured: boolean; hasKey: boolean } => {
  const hasKey = !!getProviderApiKey(provider);
  return {
    configured: isProviderConfigured(provider),
    hasKey
  };
};

// Export both services for direct access if needed
export { GeminiService, OpenAIService };
