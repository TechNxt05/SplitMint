import { getGroupById } from "@/app/actions/groups";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { AddExpenseButton } from "@/components/groups/add-expense-button";
import { calculateBalances } from "@/lib/balance";
import { BalancesList } from "@/components/groups/balances-list";
import { ExpensesList } from "@/components/groups/expenses-list";
import { ParticipantsList } from "@/components/groups/participants-list";
import { GroupHeader } from "@/components/groups/group-header";

export default async function GroupPage({ params }: { params: { groupId: string } }) {
    const group = await getGroupById(params.groupId);

    if (!group) {
        notFound();
    }

    const { balances, settlements } = calculateBalances(
        group.participants,
        group.expenses.map((e) => ({
            amount: e.amount,
            paidByParticipantId: e.paidByParticipantId,
            splits: e.splits,
        }))
    );

    return (
        <div className="container mx-auto py-10 px-4">
            <GroupHeader group={group} />

            <div className="grid gap-6 md:grid-cols-3 mt-8">

                <div className="md:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Expenses</h2>
                        <AddExpenseButton group={group} />
                    </div>

                    <ExpensesList expenses={group.expenses} />
                </div>


                <div className="space-y-6">
                    <ParticipantsList group={group} />

                    <Card>
                        <CardHeader>
                            <CardTitle>Balances</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BalancesList balances={balances} settlements={settlements} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
