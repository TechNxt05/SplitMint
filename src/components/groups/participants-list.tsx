"use client";

import { useState } from "react";
import { addParticipant, removeParticipant } from "@/app/actions/participants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, User } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { GroupWithDetails } from "@/types";

export function ParticipantsList({ group }: { group: GroupWithDetails }) {
    const [newParticipantName, setNewParticipantName] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const router = useRouter();

    async function handleAdd() {
        if (!newParticipantName.trim()) return;

        setIsAdding(true);
        const result = await addParticipant({ groupId: group.id, name: newParticipantName });
        setIsAdding(false);

        if (result.success) {
            setNewParticipantName("");
            toast.success("Participant added");
            router.refresh();
        } else {
            toast.error(result.error);
        }
    }

    async function handleRemove(participantId: string) {
        if (!confirm("Remove participant?")) return;
        const result = await removeParticipant(participantId, group.id);
        if (result.success) {
            toast.success("Removed");
            router.refresh(); // Refresh to update list
        } else {
            toast.error(result.error);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Participants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex space-x-2">
                    <Input
                        placeholder="Add person..."
                        value={newParticipantName}
                        onChange={(e) => setNewParticipantName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    />
                    <Button size="icon" onClick={handleAdd} disabled={isAdding}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                <div className="space-y-2">
                    {group.participants.map((participant: any) => (
                        <div
                            key={participant.id}
                            className="flex justify-between items-center p-2 rounded hover:bg-gray-50 group"
                        >
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{participant.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{participant.name}</span>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleRemove(participant.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
