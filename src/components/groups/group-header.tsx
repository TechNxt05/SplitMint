"use client";

import { Button } from "@/components/ui/button";
import { deleteGroup } from "@/app/actions/groups";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

import { GroupWithDetails } from "@/types";

export function GroupHeader({ group }: { group: GroupWithDetails }) {
    const router = useRouter();

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this group?")) return;

        const result = await deleteGroup(group.id);
        if (result.success) {
            toast.success("Group deleted");
            router.push("/dashboard");
        } else {
            toast.error("Failed to delete group");
        }
    }

    return (
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border">
            <div>
                <h1 className="text-3xl font-bold">{group.name}</h1>
                <p className="text-muted-foreground">{group.participants.length} participants</p>
            </div>
            <Button variant="destructive" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
