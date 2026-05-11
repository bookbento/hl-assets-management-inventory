"use client";

import { useState } from 'react';
import { Sidebar } from "@/components/layout/Sidebar";
import { Ticket as TicketIcon, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const MOCK_TICKETS = [
    { id: "TKT-8821", requester: "Sarah Jenkins", subject: "Hardware Request: Ergonomic Keyboard", priority: "Medium", status: "Pending", created: "2024-05-10", description: "Requesting an ergonomic keyboard due to wrist strain." },
    { id: "TKT-8822", requester: "David Chen", subject: "Software Access: AWS Console", priority: "High", status: "Pending", created: "2024-05-11", description: "Need production access to AWS for deployment." },
    { id: "TKT-8823", requester: "Emma Wilson", subject: "Broken Monitor: flickering screen", priority: "Critical", status: "Pending", created: "2024-05-11", description: "Monitor is flickering heavily." }
];

export default function TicketsPage() {
    const [tickets, setTickets] = useState(MOCK_TICKETS);
    const [selectedTicket, setSelectedTicket] = useState<typeof MOCK_TICKETS[0] | null>(null);

    const handleAction = (id: string, status: string) => {
        setTickets(prev => prev.filter(t => t.id !== id));
        setSelectedTicket(null);
    };

    return (
        <div className="flex min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50">
            <Sidebar />
            <div className="flex min-h-screen w-full flex-col sm:pl-64">
                <main className="flex-1 p-4 sm:p-8">
                    <div className="mx-auto max-w-7xl space-y-8">
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Ticket Management</h1>
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            <div className="lg:col-span-2 space-y-4">
                                {tickets.map((t) => (
                                    <div
                                        key={t.id}
                                        onClick={() => setSelectedTicket(t)}
                                        className={cn(
                                            "cursor-pointer rounded-2xl border p-5 transition-all hover:shadow-md bg-white dark:bg-slate-950",
                                            selectedTicket?.id === t.id ? "border-blue-500 ring-2 ring-blue-500/10" : "border-slate-200 dark:border-slate-800"
                                        )}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/20"><TicketIcon /></div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-slate-400">{t.id}</span>
                                                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", t.priority === 'Critical' ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600")}>{t.priority}</span>
                                                    </div>
                                                    <h3 className="font-bold mt-1">{t.subject}</h3>
                                                </div>
                                            </div>
                                            <ArrowRight className="text-slate-300" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="lg:col-span-1">
                                <AnimatePresence mode="wait">
                                    {selectedTicket ? (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
                                            <h2 className="text-lg font-bold mb-4">Details</h2>
                                            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900 text-sm italic text-slate-600 mb-6 font-serif">"{selectedTicket.description}"</div>
                                            <div className="flex gap-3">
                                                <button onClick={() => handleAction(selectedTicket.id, 'Approved')} className="flex-1 bg-emerald-600 text-white rounded-xl py-3 font-bold shadow-lg shadow-emerald-500/20">Approve</button>
                                                <button onClick={() => handleAction(selectedTicket.id, 'Rejected')} className="flex-1 border border-rose-200 text-rose-600 rounded-xl py-3 font-bold">Reject</button>
                                            </div>
                                        </motion.div>
                                    ) : <div className="h-64 border border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-slate-400">Select a ticket</div>}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
