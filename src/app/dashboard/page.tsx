import { getGroups } from "@/app/actions/groups";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { CreateGroupModal } from "@/components/dashboard/create-group-modal";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
    const groups = await getGroups();

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <CreateGroupModal />
            </div>

            {groups.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed">
                    <h3 className="text-lg font-medium text-gray-900">No groups yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Create a group to start splitting expenses.
                    </p>
                    <div className="mt-6">
                        <CreateGroupModal />
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group: any) => (
                        <Link key={group.id} href={`/groups/${group.id}`}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xl font-bold">
                                        {group.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatCurrency(group.totalSpent)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Total expenses
                                    </p>
                                    <div className="mt-4 flex items-center text-sm text-muted-foreground">
                                        <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2" />
                                        {group._count.participants} participants
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
