"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const splitSchema = z.object({
    participantId: z.string(),
    amount: z.number().min(0), // For EXACT
    percent: z.number().optional(), // For PERCENT
});

const createExpenseSchema = z.object({
    groupId: z.string(),
    description: z.string().min(1, "Description is required"),
    amount: z.number().positive("Amount must be positive"),
    date: z.string(), // ISO date string
    paidByParticipantId: z.string(),
    splitMode: z.enum(["EQUAL", "EXACT", "PERCENT"]),
    splits: z.array(splitSchema),
});

export async function createExpense(formData: z.infer<typeof createExpenseSchema>) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { error: "Not authenticated" };
    }

    const validatedFields = createExpenseSchema.safeParse(formData);

    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }

    const {
        groupId,
        description,
        amount,
        date,
        paidByParticipantId,
        splitMode,
        splits: inputSplits,
    } = validatedFields.data;

    try {
        // Verify group ownership
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { participants: true },
        });

        if (!group || group.ownerId !== session.user.id) {
            return { error: "Not authorized" };
        }

        // Calculate split shares based on mode
        let finalSplits: { participantId: string; shareAmount: number }[] = [];

        if (splitMode === "EQUAL") {
            // Filter out participants who are not involved in the split if explicit selection is used, 
            // or assume all participants if not specified (simplification: assumes inputSplits contains all selected participants)
            const involvedCount = inputSplits.length;
            if (involvedCount === 0) return { error: "No participants selected for split" };

            const share = amount / involvedCount;
            // Distribute remainder to first person (or paidBy) to ensure sum matches exactly
            // Simple approach: standard round, check diff

            let currentSum = 0;
            finalSplits = inputSplits.map((s, index) => {
                let shareAmount = Number((amount / involvedCount).toFixed(2));
                if (index === 0) {
                    // adjust first content later? No, let's just push and sum
                }
                return { participantId: s.participantId, shareAmount };
            });

            // Adjust for rounding errors
            const splitSum = finalSplits.reduce((sum, s) => sum + s.shareAmount, 0);
            const diff = amount - splitSum;
            if (Math.abs(diff) > 0.001) {
                finalSplits[0].shareAmount += diff;
                finalSplits[0].shareAmount = Number(finalSplits[0].shareAmount.toFixed(2));
            }

        } else if (splitMode === "EXACT") {
            const totalSplit = inputSplits.reduce((sum, s) => sum + s.amount, 0);
            if (Math.abs(totalSplit - amount) > 0.01) {
                return { error: `Split amounts (${totalSplit}) do not equal total amount (${amount})` };
            }
            finalSplits = inputSplits.map(s => ({
                participantId: s.participantId,
                shareAmount: s.amount
            }));

        } else if (splitMode === "PERCENT") {
            const totalPercent = inputSplits.reduce((sum, s) => sum + (s.percent || 0), 0);
            if (Math.abs(totalPercent - 100) > 0.1) {
                return { error: `Percentages (${totalPercent}) must equal 100%` };
            }

            finalSplits = inputSplits.map(s => ({
                participantId: s.participantId,
                shareAmount: Number(((amount * (s.percent || 0)) / 100).toFixed(2))
            }));
            // Adjust for rounding errors logic same as EQUAL
            const splitSum = finalSplits.reduce((sum, s) => sum + s.shareAmount, 0);
            const diff = amount - splitSum;
            if (Math.abs(diff) > 0.001) {
                finalSplits[0].shareAmount += diff;
                finalSplits[0].shareAmount = Number(finalSplits[0].shareAmount.toFixed(2));
            }
        }

        await prisma.expense.create({
            data: {
                amount,
                description,
                date: new Date(date),
                groupId,
                paidByParticipantId,
                splitMode,
                splits: {
                    createMany: {
                        data: finalSplits,
                    },
                },
            },
        });

        revalidatePath(`/groups/${groupId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to add expense:", error);
        return { error: "Failed to add expense" };
    }
}

export async function deleteExpense(expenseId: string, groupId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { error: "Not authenticated" };
    }

    try {
        const group = await prisma.group.findUnique({
            where: { id: groupId }
        });

        if (!group || group.ownerId !== session.user.id) {
            return { error: "Not authorized" };
        }

        await prisma.expense.delete({
            where: { id: expenseId },
        });

        revalidatePath(`/groups/${groupId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete expense:", error);
        return { error: "Failed to delete expense" };
    }
}
