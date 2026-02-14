import Groq from "groq-sdk";
import { AIProvider } from "../types";

export class GroqProvider implements AIProvider {
    name = "Groq";
    private client: Groq;

    constructor() {
        this.client = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
    }

    async generateResponse(prompt: string, systemPrompt: string = ""): Promise<string | null> {
        try {
            const completion = await this.client.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt + " Return JSON." },
                    { role: "user", content: prompt }
                ],
                model: "llama3-70b-8192",
                response_format: { type: "json_object" },
            });

            return completion.choices[0]?.message?.content || null;
        } catch (error) {
            console.error("Groq API Error:", error);
            return null;
        }
    }
}
