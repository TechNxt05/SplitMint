import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "../types";

export class GeminiProvider implements AIProvider {
    name = "Gemini";
    private genAI: GoogleGenerativeAI;

    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    }

    async generateResponse(prompt: string, systemPrompt: string = ""): Promise<string | null> {
        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

            const fullPrompt = `${systemPrompt}\n\nUser Input: ${prompt}\n\nResponse (JSON):`;
            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Gemini API Error:", error);
            return null;
        }
    }
}
