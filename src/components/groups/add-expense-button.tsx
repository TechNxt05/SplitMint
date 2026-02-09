"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createExpense } from "@/app/actions/expenses";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

const expenseSchema = z.object({
    description: z.string().min(1, "Required"),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Must be positive"),
    date: z.string(),
    paidByParticipantId: z.string().min(1, "Required"),
    splitMode: z.enum(["EQUAL", "EXACT", "PERCENT"]),
    selectedParticipants: z.array(z.string()).min(1, "Select at least one"),
    // We'll handle custom splits separately in state or a more complex schema if needed, 
    // but for now let's map form state to the action payload manually.
});

import { GroupWithDetails } from "@/types";

export function AddExpenseButton({ group }: { group: GroupWithDetails }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    // Form State
    const form = useForm<z.infer<typeof expenseSchema>>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            description: "",
            amount: "",
            date: new Date().toISOString().split('T')[0],
            paidByParticipantId: group.ownerId ? group.participants[0]?.id : "", // Default to first person
            splitMode: "EQUAL" as const,
            selectedParticipants: group.participants.map((p) => p.id), // Default all selected
        },
    });

    const mode = form.watch("splitMode");
    const amount = Number(form.watch("amount") || 0);

    // For EXACT/PERCENT, we need local state to track individual values
    // A simple way is to just use a map of participantId -> value
    const [splitValues, setSplitValues] = useState<Record<string, string>>({});

    async function onSubmit(values: any) {
        const numericAmount = Number(values.amount);

        // Prepare splits based on mode
        let splitsPayload: any[] = [];

        if (values.splitMode === "EQUAL") {
            splitsPayload = values.selectedParticipants.map((id: string) => ({
                participantId: id,
                amount: 0 // Ignored by backend for EQUAL
            }));
        } else if (values.splitMode === "EXACT") {
            splitsPayload = values.selectedParticipants.map((id: string) => ({
                participantId: id,
                amount: Number(splitValues[id] || 0)
            }));
        } else if (values.splitMode === "PERCENT") {
            splitsPayload = values.selectedParticipants.map((id: string) => ({
                participantId: id,
                amount: 0,
                percent: Number(splitValues[id] || 0)
            }));
        }

        const payload = {
            groupId: group.id,
            description: values.description,
            amount: numericAmount,
            date: new Date(values.date).toISOString(),
            paidByParticipantId: values.paidByParticipantId,
            splitMode: values.splitMode,
            splits: splitsPayload
        };

        const result = await createExpense(payload);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Expense added");
            setOpen(false);
            form.reset();
            setSplitValues({});
            router.refresh();
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Expense
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Expense</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl><Input placeholder="Dinner, Taxi, etc." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="amount" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="date" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl><Input type="date" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="paidByParticipantId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Paid By</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select who paid" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {group.participants.map((p: any) => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="splitMode" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Split Mode</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="EQUAL">Split Equally</SelectItem>
                                        <SelectItem value="EXACT">Exact Amounts</SelectItem>
                                        <SelectItem value="PERCENT">Percentages</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="space-y-2">
                            <FormLabel>Participants</FormLabel>
                            <div className="border rounded-md p-4 space-y-3">
                                {group.participants.map((p: any) => {
                                    const isSelected = form.watch("selectedParticipants").includes(p.id);
                                    return (
                                        <div key={p.id} className="flex items-center space-x-3">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={(checked) => {
                                                    const current = form.getValues("selectedParticipants");
                                                    if (checked) {
                                                        form.setValue("selectedParticipants", [...current, p.id]);
                                                    } else {
                                                        form.setValue("selectedParticipants", current.filter(id => id !== p.id));
                                                    }
                                                }}
                                            />
                                            <div className="flex-1 flex items-center justify-between">
                                                <span className="text-sm font-medium">{p.name}</span>

                                                {isSelected && mode !== "EQUAL" && (
                                                    <div className="flex items-center space-x-1">
                                                        <Input
                                                            className="h-8 w-24 text-right"
                                                            placeholder="0"
                                                            type="number"
                                                            value={splitValues[p.id] || ""}
                                                            onChange={(e) => setSplitValues(prev => ({ ...prev, [p.id]: e.target.value }))}
                                                        />
                                                        <span className="text-xs text-muted-foreground w-4">
                                                            {mode === "PERCENT" ? "%" : ""}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            Add Expense
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
