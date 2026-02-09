"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const createGroupSchema = z.object({
    name: z.string().min(1, "Group name is required"),
});

export async function createGroup(formData: z.infer<typeof createGroupSchema>) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { error: "Not authenticated" };
    }

    const validatedFields = createGroupSchema.safeParse(formData);

    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }

    try {
        const group = await prisma.group.create({
            data: {
                name: validatedFields.data.name,
                ownerId: session.user.id,
                participants: {
                    create: {
                        name: session.user.name || "Owner", // Add creator as first participant
                    },
                },
            },
        });

        revalidatePath("/dashboard");
        return { success: true, groupId: group.id };
    } catch (error) {
        console.error("Failed to create group:", error);
        return { error: "Failed to create group" };
    }
}

export async function getGroups() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return [];
    }

    try {
        const groups = await prisma.group.findMany({
            where: {
                ownerId: session.user.id,
            },
            include: {
                _count: {
                    select: { participants: true },
                },
                expenses: {
                    select: {
                        amount: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Calculate total spend for each group
        return groups.map((group: any) => ({
            ...group,
            totalSpent: group.expenses.reduce((sum: number, expense: { amount: number }) => sum + expense.amount, 0)
        }));

    } catch (error) {
        console.error("Failed to fetch groups:", error);
        return [];
    }
}

export async function getGroupById(groupId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return null;
    }

    try {
        const group = await prisma.group.findUnique({
            where: {
                id: groupId,
            },
            include: {
                participants: true,
                expenses: {
                    include: {
                        paidBy: true,
                        splits: {
                            include: {
                                participant: true
                            }
                        }
                    },
                    orderBy: {
                        date: 'desc'
                    }
                },
                _count: {
                    select: { participants: true }
                }
            },
        });

        if (!group || group.ownerId !== session.user.id) {
            return null;
        }

        return group;
    } catch (error) {
        console.error("Failed to fetch group:", error);
        return null;
    }
}

export async function deleteGroup(groupId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { error: "Not authenticated" };
    }

    try {
        // Verify ownership
        const group = await prisma.group.findUnique({
            where: { id: groupId },
        });

        if (!group || group.ownerId !== session.user.id) {
            return { error: "Not authorized" };
        }

        await prisma.group.delete({
            where: { id: groupId },
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete group:", error);
        return { error: "Failed to delete group" };
    }
}
