"use server";

import { generateAIResponse } from "@/lib/ai";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export async function handleChat(prompt: string) {
    const user = await getAuthenticatedUser();
    if (!user) {
        return { error: "Please log in to chat." };
    }

    try {
        const response = await generateAIResponse(prompt);
        // Here we could persist chat history if needed in future
        return { success: true, data: response };
    } catch (error) {
        console.error("Chat Error:", error);
        return { error: "Failed to get response." };
    }
}
