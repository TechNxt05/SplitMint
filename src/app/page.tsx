import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Wallet } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center space-y-8 bg-gradient-to-b from-white to-gray-50">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900">
            Split expenses <span className="text-primary">seamlessly</span> with friends.
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Keep track of shared bills, balances, and settlements without the headache.
            Perfect for roommates, trips, and groups.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {userId ? (
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-8 text-lg gap-2">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 text-lg">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
                  Log in
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Wallet className="h-10 w-10 text-primary" />}
              title="Track Balances"
              description="Instantly see who owes whom. Our smart engine calculates net balances to minimize transactions."
            />
            <FeatureCard
              icon={<CheckCircle2 className="h-10 w-10 text-primary" />}
              title="Flexible Splitting"
              description="Split by percentage, exact amounts, or equally. We handle the math for you."
            />
            <FeatureCard
              icon={<ArrowRight className="h-10 w-10 text-primary" />}
              title="Easy Settlements"
              description="Record payments and settle up with a single click when debts are paid."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-50 border-t text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} SplitMint. Built with Next.js & NeonDB.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl border bg-gray-50/50 hover:bg-white hover:shadow-lg transition-all">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
