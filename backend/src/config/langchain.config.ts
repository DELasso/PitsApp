export type LLMProvider = 'openai' | 'local' | 'demo';

export const langchainConfig = {
  provider: (process.env.LC_PROVIDER as LLMProvider) ?? 'demo',
  // --- OPENAI (nube) ---
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  // --- LOCAL / DEMO (OpenAI-compatible) ---
  // Ej: Ollama: http://localhost:11434/v1  | LM Studio: http://localhost:1234/v1
  baseUrl: process.env.LC_BASE_URL ?? 'http://localhost:11434/v1',
  // Para local/DEMO puedes usar cualquier string (el servidor no valida)
  localApiKey: process.env.LC_LOCAL_API_KEY ?? 'demo-key',
  // --- Modelo ---
  model: process.env.LC_MODEL ?? 'llama3',
  temperature: Number(process.env.LC_TEMPERATURE ?? 0.2),
  maxTokens: Number(process.env.LC_MAX_TOKENS ?? 1024),
};
