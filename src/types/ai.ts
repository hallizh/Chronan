export type AIProviderName = "openai" | "anthropic" | "gemini";

export interface AISettings {
  provider: AIProviderName;
  model: string;
  apiKey: string;
  /** Stored OpenAI OAuth tokens (access + refresh + expiry). Takes precedence over apiKey. */
  openaiTokens?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
}

export const MODEL_OPTIONS: Record<AIProviderName, { id: string; label: string }[]> = {
  openai: [
    { id: "gpt-4.1", label: "GPT-4.1" },
    { id: "gpt-4.1-mini", label: "GPT-4.1 mini" },
    { id: "gpt-4.1-nano", label: "GPT-4.1 nano" },
  ],
  anthropic: [
    { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
    { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
  ],
  gemini: [
    { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  ],
};
