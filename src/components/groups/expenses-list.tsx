"use client";

import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { deleteExpense } from "@/app/actions/expenses";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { ExpenseWithDetails } from "@/types";

export function ExpensesList({ expenses }: { expenses: ExpenseWithDetails[] }) {
    const router = useRouter();

    async function handleDelete(expenseId: string, groupId: string) {
        if (!confirm("Delete this expense?")) return;
        const result = await deleteExpense(expenseId, groupId);
        if (result.success) {
            toast.success("Expense deleted");
            router.refresh();
        } else {
            toast.error("Failed to delete");
        }
    }

    if (expenses.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                No expenses yet. Add one to get started!
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {expenses.map((expense) => (
                <Card key={expense.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary/10 rounded-lg text-primary font-bold">
                                <span className="text-xs uppercase">{format(new Date(expense.date), "MMM")}</span>
                                <span className="text-lg">{format(new Date(expense.date), "dd")}</span>
                            </div>
                            <div>
                                <h3 className="font-semibold">{expense.description}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {expense.paidBy.name} paid {formatCurrency(expense.amount)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Split ({expense.splitMode})</p>
                                {/* Show who was involved simply */}
                                <p className="text-sm">
                                    {expense.splits.length} people
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-red-500"
                                onClick={() => handleDelete(expense.id, expense.groupId)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
