import { OpenAIProvider } from "./providers/openai";
import { GeminiProvider } from "./providers/gemini";
import { GroqProvider } from "./providers/groq";
import { AIProvider } from "./types";

const SYSTEM_PROMPT = `
You are the "Finance Copilot" for SplitMint.
Your capabilities:
1. Parse natural language into structured expense data.
2. Analyze spending patterns.
3. Suggest equal/exact/percent splits.
4. Be helpful, concise, and use Indian financial context (UPI, Lakhs, etc).

Output Format:
ALWAYS return a valid JSON object.
Schema:
{
  "intent": "ADD_EXPENSE" | "SPLIT_EXPENSE" | "QUERY_BALANCE" | "GENERAL_CHAT" | "ANALYSIS",
  "message": "Friendly response to user",
  "data": { ... } // structured data if applicable (amount, category, participants, etc)
}
`;

export async function generateAIResponse(prompt: string) {
    const providers: AIProvider[] = [
        new OpenAIProvider(),
        new GeminiProvider(),
        new GroqProvider(),
    ];

    for (const provider of providers) {
        console.log(`Trying AI Provider: ${provider.name}`);
        const response = await provider.generateResponse(prompt, SYSTEM_PROMPT);

        if (response) {
            try {
                // simple heuristic to clean markdown json blocks if present
                const cleaned = response.replace(/```json/g, "").replace(/```/g, "").trim();
                return JSON.parse(cleaned);
            } catch (e) {
                console.error(`Failed to parse JSON from ${provider.name}:`, response);
                // continue to next provider? No, if we got a response but it's bad JSON, 
                // it might be better to fail or return raw text wrapped.
                // For now, let's try the next provider if parsing fails, assuming the model hallucinated format.
                continue;
            }
        }
    }

    return {
        intent: "ERROR",
        message: "Sorry, my brain is foggy. All AI services are currently down. Please try again later.",
        data: {}
    };
}
