import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";
import { FinanceCopilot } from "@/components/chatbot/finance-copilot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SplitMint - Apna Finance",
  description: "Smart expense splitting and personal finance tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Navbar />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          <FinanceCopilot />
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
