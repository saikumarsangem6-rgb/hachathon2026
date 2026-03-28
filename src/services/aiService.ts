import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getGeminiResponse(prompt: string, onChunk: (text: string) => void) {
  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-2.0-flash-exp", // Using flash as requested
      contents: prompt,
    });

    let fullText = "";
    for await (const chunk of response) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        onChunk(fullText);
      }
    }
    return fullText;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

// Mock for other models for hackathon demo
export async function getMockResponse(modelId: string, prompt: string, onChunk: (text: string) => void) {
  // In a real app, this would call the backend which proxies to OpenAI/Anthropic
  // For this demo, we'll use Gemini to simulate other models with different system prompts
  
  const systemPrompts: Record<string, string> = {
    'gpt-4o': "You are GPT-4o, a highly capable model by OpenAI. Answer concisely and professionally.",
    'claude-3-7-sonnet': "You are Claude 3.7 Sonnet by Anthropic. Answer with helpfulness and nuance.",
    'llama-3-1-405b': "You are Llama 3.1 405B by Meta. Answer with a bold and open-source spirit.",
    'mistral-large': "You are Mistral Large. Answer with European elegance and precision.",
    'deepseek-v3': "You are DeepSeek V3. Answer with deep technical insight.",
    'command-r-plus': "You are Command R+ by Cohere. Answer with a focus on RAG and business utility.",
    'phi-3-medium': "You are Phi-3 Medium by Microsoft. Answer with efficiency and clarity.",
  };

  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        systemInstruction: systemPrompts[modelId] || "You are a helpful AI model."
      }
    });

    let fullText = "";
    for await (const chunk of response) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        onChunk(fullText);
      }
    }
    return fullText;
  } catch (error) {
    console.error(`Error fetching response for ${modelId}:`, error);
    throw error;
  }
}
