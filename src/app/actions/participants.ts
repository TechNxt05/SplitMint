"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const addParticipantSchema = z.object({
    groupId: z.string(),
    name: z.string().min(1, "Name is required"),
});

export async function addParticipant(formData: z.infer<typeof addParticipantSchema>) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { error: "Not authenticated" };
    }

    const validatedFields = addParticipantSchema.safeParse(formData);

    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }

    const { groupId, name } = validatedFields.data;

    try {
        // Verify group ownership
        const group = await prisma.group.findUnique({
            where: { id: groupId },
        });

        if (!group || group.ownerId !== session.user.id) {
            return { error: "Not authorized" };
        }

        await prisma.participant.create({
            data: {
                name,
                groupId,
            },
        });

        revalidatePath(`/groups/${groupId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to add participant:", error);
        return { error: "Failed to add participant" };
    }
}

export async function removeParticipant(participantId: string, groupId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { error: "Not authenticated" };
    }

    try {
        // Verify ownership via group
        const participant = await prisma.participant.findUnique({
            where: { id: participantId },
            include: { group: true }
        });

        if (!participant || participant.group.ownerId !== session.user.id) {
            return { error: "Not authorized" };
        }

        // Check if involved in expenses
        const expenseCount = await prisma.expenseSplit.count({
            where: { participantId },
        });

        const paidCount = await prisma.expense.count({
            where: { paidByParticipantId: participantId }
        })

        if (expenseCount > 0 || paidCount > 0) {
            return { error: "Cannot remove participant who is part of expenses" };
        }

        await prisma.participant.delete({
            where: { id: participantId },
        });

        revalidatePath(`/groups/${groupId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to remove participant:", error);
        return { error: "Failed to remove participant" };
    }
}
