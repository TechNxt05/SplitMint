"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function registerUser(formData: z.infer<typeof registerSchema>) {
    const validatedFields = registerSchema.safeParse(formData);

    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }

    const { name, email, password } = validatedFields.data;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: "User already exists" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: "Something went wrong" };
    }
}
