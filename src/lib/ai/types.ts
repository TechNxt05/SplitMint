export interface AIProvider {
    generateResponse(prompt: string, sytemPrompt?: string): Promise<string | null>;
    name: string;
}
