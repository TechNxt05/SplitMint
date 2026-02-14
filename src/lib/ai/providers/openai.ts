import OpenAI from "openai";
import { AIProvider } from "../types";

export class OpenAIProvider implements AIProvider {
    name = "OpenAI";
    private client: OpenAI;

    constructor() {
        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async generateResponse(prompt: string, systemPrompt: string = ""): Promise<string | null> {
        try {
            const completion = await this.client.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: prompt }
                ],
                model: "gpt-4o", // or gpt-3.5-turbo
                response_format: { type: "json_object" },
            });

            return completion.choices[0].message.content;
        } catch (error) {
            console.error("OpenAI API Error:", error);
            return null;
        }
    }
}
