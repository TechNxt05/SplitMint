"use client";

import { Balance, Settlement } from "@/lib/balance";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";

export function BalancesList({
    balances,
    settlements
}: {
    balances: Balance[],
    settlements: Settlement[]
}) {

    const chartData = balances.map(b => ({
        name: b.name,
        balance: b.balance
    }));

    return (
        <div className="space-y-8">
            {/* Settlements */}
            <div className="space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Settlements</h3>
                {settlements.length === 0 ? (
                    <p className="text-sm">All settled up!</p>
                ) : (
                    <div className="space-y-3">
                        {settlements.map((s, i) => (
                            <div key={i} className="flex items-center justify-between text-sm p-3 bg-green-50 text-green-800 rounded-md border border-green-100">
                                <div className="flex items-center space-x-2">
                                    <span className="font-bold">{s.fromName}</span>
                                    <span className="text-muted-foreground">pays</span>
                                    <span className="font-bold">{s.toName}</span>
                                </div>
                                <span className="font-bold">{formatCurrency(s.amount)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Chart */}
            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value: any) => formatCurrency(value)} />
                        <Bar dataKey="balance" fill="#8884d8">
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.balance >= 0 ? '#22c55e' : '#ef4444'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* List View */}
            <div className="space-y-2">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Net Balances</h3>
                {balances.map(b => (
                    <div key={b.participantId} className="flex justify-between items-center text-sm border-b last:border-0 py-2">
                        <span>{b.name}</span>
                        <span className={b.balance >= 0 ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                            {b.balance > 0 ? "+" : ""}{formatCurrency(b.balance)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
