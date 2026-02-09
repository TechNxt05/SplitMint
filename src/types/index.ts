import { Prisma } from "@prisma/client";

export type GroupWithDetails = Prisma.GroupGetPayload<{
    include: {
        participants: true;
        expenses: {
            include: {
                paidBy: true;
                splits: {
                    include: {
                        participant: true;
                    };
                };
            };
        };
        _count: {
            select: { participants: true }
        }
    };
}> & {
    totalSpent?: number;
};

export type ExpenseWithDetails = Prisma.ExpenseGetPayload<{
    include: {
        paidBy: true;
        splits: {
            include: {
                participant: true
            }
        }
    }
}>;
