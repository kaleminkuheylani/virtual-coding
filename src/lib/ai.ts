import OpenAI from "openai";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export type AiProvider = "openrouter" | "gemini";

function openRouterClient(apiKey?: string): OpenAI {
  const key = apiKey ?? process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OpenRouter API key is missing.");

  return new OpenAI({ apiKey: key, baseURL: OPENROUTER_BASE_URL });
}

function geminiApiKey(apiKey?: string): string {
  const key = apiKey ?? process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Gemini API key is missing.");
  return key;
}

async function runOpenRouterPrompt(prompt: string, model: string, apiKey?: string): Promise<string> {
  const client = openRouterClient(apiKey);
  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0]?.message?.content ?? "No response.";
}

async function runGeminiPrompt(prompt: string, model: string, apiKey?: string): Promise<string> {
  const key = geminiApiKey(apiKey);
  const response = await fetch(`${GEMINI_BASE_URL}/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    throw new Error("Gemini request failed.");
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response.";
}

export async function runAiPrompt(params: {
  prompt: string;
  provider?: AiProvider;
  model?: string;
  apiKey?: string;
}): Promise<string> {
  const provider = params.provider ?? "openrouter";

  if (provider === "gemini") {
    return runGeminiPrompt(params.prompt, params.model ?? "gemini-1.5-flash", params.apiKey);
  }

  return runOpenRouterPrompt(params.prompt, params.model ?? "openai/gpt-4o-mini", params.apiKey);
}

export async function verifyAiProviderKey(params: { provider: AiProvider; apiKey?: string; model?: string }) {
  const provider = params.provider;

  if (provider === "gemini") {
    const key = geminiApiKey(params.apiKey);
    const model = params.model ?? "gemini-1.5-flash";
    const response = await fetch(`${GEMINI_BASE_URL}/models/${model}?key=${encodeURIComponent(key)}`);
    return response.ok;
  }

  const client = openRouterClient(params.apiKey);
  await client.models.list();
  return true;
}
