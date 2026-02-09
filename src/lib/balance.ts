export type Balance = {
    participantId: string;
    name: string;
    paid: number;
    share: number;
    balance: number; // positive = owed, negative = owes
};

export type Settlement = {
    from: string; // participantId
    fromName: string;
    to: string; // participantId
    toName: string;
    amount: number;
};

export function calculateBalances(
    participants: { id: string; name: string }[],
    expenses: {
        amount: number;
        paidByParticipantId: string;
        splits: { participantId: string; shareAmount: number }[];
    }[]
): { balances: Balance[]; settlements: Settlement[] } {
    const balances: Record<string, Balance> = {};

    // Initialize balances
    participants.forEach((p) => {
        balances[p.id] = {
            participantId: p.id,
            name: p.name,
            paid: 0,
            share: 0,
            balance: 0,
        };
    });

    // Process expenses
    expenses.forEach((expense) => {
        if (balances[expense.paidByParticipantId]) {
            balances[expense.paidByParticipantId].paid += expense.amount; // Use expense.amount directly
        }

        expense.splits.forEach((split) => {
            if (balances[split.participantId]) {
                balances[split.participantId].share += split.shareAmount;
            }
        });
    });

    // Calculate net balance
    Object.values(balances).forEach((b) => {
        b.balance = b.paid - b.share;
    });

    const settlements = calculateSettlements(Object.values(balances));

    return {
        balances: Object.values(balances),
        settlements,
    };
}


// Greedy algorithm to minimize transactions
function calculateSettlements(balances: Balance[]): Settlement[] {
    let debtors = balances
        .filter((b) => b.balance < -0.01)
        .sort((a, b) => a.balance - b.balance); // Ascending (most negative first)

    let creditors = balances
        .filter((b) => b.balance > 0.01)
        .sort((a, b) => b.balance - a.balance); // Descending (most positive first)

    const settlements: Settlement[] = [];

    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        const amount = Math.min(Math.abs(debtor.balance), creditor.balance);

        // Add settlement
        if (amount > 0.01) {
            settlements.push({
                from: debtor.participantId,
                fromName: debtor.name,
                to: creditor.participantId,
                toName: creditor.name,
                amount: Number(amount.toFixed(2)),
            });
        }

        // Adjust balances
        debtor.balance += amount;
        creditor.balance -= amount;

        // Move indices
        if (Math.abs(debtor.balance) < 0.01) i++;
        if (creditor.balance < 0.01) j++;
    }

    return settlements;
}
