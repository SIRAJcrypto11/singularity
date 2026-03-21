import axios from 'axios';

const OLLAMA_URL = '/api/assistant';
const MODEL = 'gemma3:1b';

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export const askOracle = async (prompt: string, systemPrompt?: string) => {
  try {
    const response = await axios.post(OLLAMA_URL, {
      model: MODEL,
      prompt: prompt,
      system: systemPrompt || "You are the 'Oracle', a helpful local AI assistant. Keep responses concise and professional.",
    });

    if (response.data.error) throw new Error(response.data.error);
    return response.data as OllamaResponse;
  } catch (error: any) {
    console.error('Error communicating with Assistant API:', error.message);
    throw new Error('Asisten tidak merespon. Pastikan Ollama sudah jalan.');
  }
};

/**
 * Parses user input for intent (Tasks or Finance)
 */
export const parseIntent = async (input: string) => {
  const systemPrompt = `
    Analyze the user's input and extract intent.
    Return ONLY a raw JSON object string. NO markdown, NO explanations.
    Structure:
    {
      "type": "TASK" | "FINANCE" | "CHAT",
      "data": {
        "title": string,
        "amount": number (integer),
        "category": string,
        "date": "YYYY-MM-DD"
      }
    }
    Rules:
    - If task: type=TASK, data.title=task decription.
    - If spending/finance: type=FINANCE, data.amount=number (convert 50k to 50000), data.category=short category.
    - Otherwise: type=CHAT.
  `;

  try {
    const res = await askOracle(input, systemPrompt);
    // Robust extraction: find the first { and last }
    const match = res.response.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    return { type: "CHAT", data: { message: res.response } };
  } catch (e) {
    return { type: "CHAT", data: { message: "Gagal memproses permintaan." } };
  }
};
