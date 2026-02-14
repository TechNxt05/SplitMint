"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { handleChat } from "@/app/actions/chat";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export function FinanceCopilot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hi! I'm your Finance Copilot. Ask me to split a bill or analyze your spending!" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    async function sendMessage() {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setInput("");
        setIsLoading(true);

        const result = await handleChat(userMsg);

        if (result.error) {
            setMessages(prev => [...prev, { role: "assistant", content: "Error: " + result.error }]);
        } else if (result.data) {
            // TODO: Handle structured data (charts, split actions actions)
            const text = result.data.message || JSON.stringify(result.data);
            setMessages(prev => [...prev, { role: "assistant", content: text }]);
        }

        setIsLoading(false);
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90 transition-all hover:scale-105"
                >
                    <MessageCircle className="h-8 w-8 text-white" />
                </Button>
            )}

            {isOpen && (
                <Card className="w-[350px] sm:w-[400px] h-[500px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Bot className="h-5 w-5 text-primary" /> Finance Copilot
                        </CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 overflow-hidden">
                        <ScrollArea className="h-full p-4">
                            <div className="space-y-4" ref={scrollRef}>
                                {messages.map((m, i) => (
                                    <div key={i} className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
                                        {m.role === "assistant" && (
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <Bot className="h-4 w-4 text-primary" />
                                            </div>
                                        )}
                                        <div className={cn(
                                            "max-w-[80%] rounded-lg p-3 text-sm",
                                            m.role === "user"
                                                ? "bg-primary text-primary-foreground ml-auto"
                                                : "bg-muted text-foreground"
                                        )}>
                                            {m.content}
                                        </div>
                                        {m.role === "user" && (
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                                                <User className="h-4 w-4 text-primary-foreground" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-2 justify-start">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <Bot className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="bg-muted rounded-lg p-3">
                                            <span className="animate-pulse">Typing...</span>
                                        </div>
                                    </div>
                                )}
                                {/* Dummy div for auto-scroll */}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="p-3 border-t">
                        <form
                            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                            className="flex w-full items-center space-x-2"
                        >
                            <Input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Split 500 lunch..."
                                disabled={isLoading}
                                className="flex-1"
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
