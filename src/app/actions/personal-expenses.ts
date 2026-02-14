"use server";

import { getAuthenticatedUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const PersonalExpenseSchema = z.object({
    amount: z.number().positive(),
    category: z.enum(["Food", "Travel", "Rent", "Shopping", "Bills", "Misc"]),
    description: z.string().min(1),
    date: z.string(), // ISO date
    paymentMode: z.string().default("UPI"),
});

export async function createPersonalExpense(formData: z.infer<typeof PersonalExpenseSchema>) {
    const user = await getAuthenticatedUser();
    if (!user) return { error: "Not authenticated" };

    const validated = PersonalExpenseSchema.safeParse(formData);
    if (!validated.success) return { error: "Invalid fields" };

    const { amount, category, description, date, paymentMode } = validated.data;

    try {
        await prisma.personalExpense.create({
            data: {
                userId: user.id,
                amount,
                category,
                description,
                date: new Date(date),
                paymentMode,
            },
        });
        revalidatePath("/apna-finance");
        return { success: true };
    } catch (error) {
        console.error("Failed to create personal expense:", error);
        return { error: "Failed to create expense" };
    }
}

export async function getPersonalExpenses() {
    const user = await getAuthenticatedUser();
    if (!user) return [];

    return await prisma.personalExpense.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" },
    });
}

export async function getMonthlySummary() {
    const user = await getAuthenticatedUser();
    if (!user) return { totalSpent: 0, categoryBreakdown: [] };

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Group by category
    const expenses = await prisma.personalExpense.groupBy({
        by: ['category'],
        where: {
            userId: user.id,
            date: {
                gte: startOfMonth
            }
        },
        _sum: {
            amount: true
        }
    });

    const totalSpent = expenses.reduce((acc, curr) => acc + (curr._sum.amount || 0), 0);

    return {
        totalSpent,
        categoryBreakdown: expenses.map(e => ({
            category: e.category,
            amount: e._sum.amount || 0
        }))
    };
}
