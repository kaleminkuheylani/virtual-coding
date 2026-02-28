import OpenAI from "openai";

const baseURL = "https://openrouter.ai/api/v1";

export function openRouterClient(apiKey?: string): OpenAI {
  const key = apiKey ?? process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OpenRouter API key is missing.");

  return new OpenAI({ apiKey: key, baseURL });
}

export async function runAiPrompt(params: {
  prompt: string;
  model?: string;
  apiKey?: string;
}): Promise<string> {
  const client = openRouterClient(params.apiKey);
  const completion = await client.chat.completions.create({
    model: params.model ?? "openai/gpt-4o-mini",
    messages: [{ role: "user", content: params.prompt }],
  });

  return completion.choices[0]?.message?.content ?? "No response.";
}
