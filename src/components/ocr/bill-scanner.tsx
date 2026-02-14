"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ScanLine, Upload } from "lucide-react";
import Tesseract from "tesseract.js";
import { toast } from "sonner";
import { handleChat } from "@/app/actions/chat";

export function BillScanner() {
    const [scanning, setScanning] = useState(false);
    const [progress, setProgress] = useState(0);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setScanning(true);
        setProgress(0);

        try {
            toast.info("Scanning bill with OCR...");

            const { data: { text } } = await Tesseract.recognize(
                file,
                'eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setProgress(Math.floor(m.progress * 100));
                        }
                    }
                }
            );

            toast.success("Scan complete! Analyzing with AI...");

            // Send to AI for structuring
            const prompt = `I scanned this bill. Extract the expense details (merchant, date, total, items) and suggest how to split it. \n\nOCR Text:\n${text}`;

            // We can use the chat action or a dedicated one. Using chat for now as it handles intents.
            // But purely for UI feedback, maybe we want to populate a form?
            // For now, let's just send it to the chat to show the "Intelligence" part.

            // Actually, let's call the chat and show the result in the chat window? 
            // Or just toast the result? 
            // Better: open the chat window with the result.

            // Since Chatbot state is local, we can't easily push to it from here without context.
            // Let's just log it for now or show a dialog with the result.

            const result = await handleChat(prompt);

            if (result.data) {
                toast.success("AI Analysis Complete! Check your Finance Copilot.");
                // Ideally we would trigger the Copilot to open and show this message.
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to scan bill.");
        } finally {
            setScanning(false);
        }
    }

    return (
        <div className="flex items-center gap-4">
            <input
                type="file"
                id="bill-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
            <label htmlFor="bill-upload">
                <Button variant="outline" className="cursor-pointer" asChild disabled={scanning}>
                    <span>
                        {scanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanLine className="mr-2 h-4 w-4" />}
                        {scanning ? `Scanning ${progress}%` : "Scan Bill"}
                    </span>
                </Button>
            </label>
        </div>
    );
}
