import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getAuthenticatedUser() {
    const { userId } = await auth();

    if (!userId) {
        return null;
    }

    // Check if user exists in our DB
    const user = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    if (user) {
        return user;
    }

    // If not, sync from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
        return null;
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const name = `${clerkUser.firstName} ${clerkUser.lastName}`.trim();

    try {
        const newUser = await prisma.user.create({
            data: {
                clerkId: userId,
                email: email,
                name: name || "User",
            },
        });
        return newUser;
    } catch (error) {
        // Handle race condition where user might be created in parallel
        const existingUser = await prisma.user.findUnique({
            where: { clerkId: userId },
        });
        return existingUser;
    }
}
