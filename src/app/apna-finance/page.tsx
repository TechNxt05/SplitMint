import { getPersonalExpenses, getMonthlySummary } from "@/app/actions/personal-expenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { AddPersonalExpenseButton } from "@/components/apna-finance/add-expense-button";
import { BillScanner } from "@/components/ocr/bill-scanner";
import { SpendingChart } from "@/components/analytics/spending-chart";

export default async function ApnaFinancePage() {
    const expenses = await getPersonalExpenses();
    const { totalSpent, categoryBreakdown } = await getMonthlySummary();

    return (
        <div className="container mx-auto py-10 px-4 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Apna Finance</h1>
                <div className="flex gap-2">
                    <BillScanner />
                    <AddPersonalExpenseButton />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            This Month's Spend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
                    </CardContent>
                </Card>
                {categoryBreakdown.map((cat) => (
                    <Card key={cat.category}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {cat.category}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(cat.amount)}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <SpendingChart data={categoryBreakdown} />

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Recent Transactions</h2>
                    <div className="rounded-md border bg-white max-h-[360px] overflow-y-auto">
                        {expenses.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No expenses recorded yet.</div>
                        ) : (
                            <div className="divide-y">
                                {expenses.map((expense) => (
                                    <div key={expense.id} className="p-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{expense.description}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(expense.date).toLocaleDateString()} • {expense.category} • {expense.paymentMode}
                                            </p>
                                        </div>
                                        <span className="font-bold text-red-600">
                                            -{formatCurrency(expense.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
