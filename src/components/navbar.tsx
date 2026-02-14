"use client";

import Link from "next/link";
import { UserButton, SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export function Navbar() {
    return (
        <nav className="border-b bg-white border-gray-200">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center space-x-2">
                        <Wallet className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold tracking-tight text-gray-900">SplitMint</span>
                    </Link>

                    <SignedIn>
                        <div className="hidden md:flex items-center space-x-4">
                            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                                Dashboard
                            </Link>
                            <Link href="/apna-finance" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                                Apna Finance
                            </Link>
                        </div>
                    </SignedIn>
                </div>

                <div className="flex items-center space-x-4">
                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button variant="ghost">Log in</Button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <Button>Get Started</Button>
                        </SignUpButton>
                    </SignedOut>
                </div>
            </div>
        </nav>
    );
}
