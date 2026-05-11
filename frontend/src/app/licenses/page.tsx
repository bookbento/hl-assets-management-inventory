"use client";

import { useState } from 'react';
import { Sidebar } from "@/components/layout/Sidebar";
import {
    Key,
    Search,
    Plus,
    ShieldCheck,
    AlertTriangle,
    Download,
    Users,
    DollarSign,
    X,
    User,
    Calendar,
    ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Mock Data for Licenses with detailed user info
const MOCK_LICENSES = [
    {
        id: "lic-1",
        name: "Adobe Creative Cloud",
        vendor: "Adobe Inc.",
        type: "Subscription",
        totalSeats: 50,
        usedSeats: 42,
        status: "Active",
        expiryDate: "2026-12-15",
        price: "$2,400",
        billingCycle: "Monthly",
        annualCost: "$28,800",
        color: "rose",
        users: [
            { name: "Sarah Jenkins", email: "sarah.j@company.com", department: "Design", assignedDate: "2024-01-10" },
            { name: "Mike Ross", email: "m.ross@company.com", department: "Marketing", assignedDate: "2024-02-15" },
            { name: "Emma Wilson", email: "emma.w@company.com", department: "Design", assignedDate: "2024-03-01" },
        ]
    },
    {
        id: "lic-2",
        name: "Microsoft 365 Business",
        vendor: "Microsoft",
        type: "Subscription",
        totalSeats: 250,
        usedSeats: 218,
        status: "Active",
        expiryDate: "2027-01-20",
        price: "$5,500",
        billingCycle: "Annual",
        annualCost: "$5,500",
        color: "blue",
        users: [
            { name: "Alex Morgan", email: "alex.m@company.com", department: "IT", assignedDate: "2023-11-20" },
            { name: "John Doe", email: "john.d@company.com", department: "Sales", assignedDate: "2024-01-05" },
        ]
    },
    {
        id: "lic-3",
        name: "JetBrains All Products",
        vendor: "JetBrains",
        type: "Annual",
        totalSeats: 30,
        usedSeats: 28,
        status: "Warning",
        expiryDate: "2026-08-05",
        price: "$8,900",
        billingCycle: "Annual",
        annualCost: "$8,900",
        color: "indigo",
        users: [
            { name: "David Chen", email: "d.chen@company.com", department: "Engineering", assignedDate: "2023-12-12" },
            { name: "Sofia Garcia", email: "s.garcia@company.com", department: "Engineering", assignedDate: "2024-01-15" },
        ]
    },
    {
        id: "lic-4",
        name: "Slack Pro Plan",
        vendor: "Salesforce",
        type: "Monthly",
        totalSeats: 1200,
        usedSeats: 1140,
        status: "Active",
        expiryDate: "2026-06-30",
        price: "$15,000",
        billingCycle: "Monthly",
        annualCost: "$180,000",
        color: "emerald",
        users: [
            { name: "Whole Org", email: "all@company.com", department: "All", assignedDate: "2023-01-01" },
        ]
    },
    {
        id: "lic-5",
        name: "Zoom Business",
        vendor: "Zoom Video",
        type: "Subscription",
        totalSeats: 100,
        usedSeats: 98,
        status: "Critical",
        expiryDate: "2026-11-12",
        price: "$1,990",
        billingCycle: "Monthly",
        annualCost: "$23,880",
        color: "blue",
        users: [
            { name: "HR Team", email: "hr@company.com", department: "HR", assignedDate: "2023-05-10" },
        ]
    }
];

export default function LicensesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLicense, setSelectedLicense] = useState<typeof MOCK_LICENSES[0] | null>(null);

    const filteredLicenses = MOCK_LICENSES.filter(lic =>
        lic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lic.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50">
            <Sidebar />
            <div className="flex min-h-screen w-full flex-col sm:pl-64">
                <main className="flex-1 p-4 sm:p-8">
                    <div className="mx-auto max-w-7xl space-y-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Software Licenses</h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Manage subscriptions, key tracking, and seat allocation.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                                    <Download className="h-4 w-4" /> Export
                                </button>
                                <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95">
                                    <Plus className="h-4 w-4" /> Add License
                                </button>
                            </div>
                        </div>

                        {/* Dashboard KPIs */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5 dark:border-emerald-900/30 dark:bg-emerald-900/10">
                                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                                    <p className="text-xs font-bold uppercase tracking-wider">Total Active</p>
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">42</h2>
                                <p className="mt-1 text-xs text-emerald-600">Across all vendors</p>
                            </div>
                            <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-5 dark:border-rose-900/30 dark:bg-rose-900/10">
                                <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                                    <p className="text-xs font-bold uppercase tracking-wider">Expiring Soon</p>
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">5</h2>
                                <p className="mt-1 text-xs text-rose-600">Next 30 days</p>
                            </div>
                            <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-5 dark:border-blue-900/30 dark:bg-blue-900/10">
                                <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
                                    <p className="text-xs font-bold uppercase tracking-wider">Assigned Seats</p>
                                    <Key className="h-5 w-5" />
                                </div>
                                <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">1.2k</h2>
                                <p className="mt-1 text-xs text-blue-600">Total usage</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 shadow-sm border-indigo-100 dark:border-indigo-900/30">
                                <div className="flex items-center justify-between text-indigo-500">
                                    <p className="text-xs font-bold uppercase tracking-wider">Annual cost</p>
                                    <DollarSign className="h-5 w-5" />
                                </div>
                                <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">$247,080</h2>
                                <p className="mt-1 text-xs text-slate-500">Projected expenditure</p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                            <div className="border-b border-slate-100 p-6 dark:border-slate-800">
                                <div className="relative max-w-md">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by vendor or software name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white font-sans"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-900 dark:text-white">
                                    <thead className="bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-900/50">
                                        <tr>
                                            <th className="px-6 py-4">Software & Vendor</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4 text-center">Seats Usage</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Annual Cost</th>
                                            <th className="px-6 py-4">Expiry</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredLicenses.map((lic) => {
                                            const usagePercent = Math.round((lic.usedSeats / lic.totalSeats) * 100);

                                            // Calculate days until expiry for color coding
                                            const expiryDate = new Date(lic.expiryDate);
                                            const today = new Date();
                                            const diffTime = expiryDate.getTime() - today.getTime();
                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                            let expiryColorClass = "text-emerald-500 dark:text-emerald-400"; // Safe (Green)
                                            if (diffDays < 0) {
                                                expiryColorClass = "text-rose-500 dark:text-rose-400 font-bold underline decoration-rose-500/30"; // Expired (Red)
                                            } else if (diffDays <= 30) {
                                                expiryColorClass = "text-amber-500 dark:text-amber-400 font-bold"; // Warning (Orange)
                                            }

                                            return (
                                                <tr
                                                    key={lic.id}
                                                    onClick={() => setSelectedLicense(lic)}
                                                    className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                                                >
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn(
                                                                `flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl font-bold`,
                                                                lic.color === 'rose' ? "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400" :
                                                                    lic.color === 'blue' ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" :
                                                                        lic.color === 'indigo' ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400" :
                                                                            "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                                                            )}>
                                                                {lic.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 dark:text-white">{lic.name}</p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">{lic.vendor}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400 uppercase tracking-tight">
                                                            {lic.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="mx-auto w-full max-w-[140px]">
                                                            <div className="mb-1 flex items-center justify-between text-[10px]">
                                                                <span className="font-bold">{lic.usedSeats} / {lic.totalSeats}</span>
                                                                <span className={usagePercent > 90 ? "text-rose-500 font-bold" : "text-slate-400"}>{usagePercent}%</span>
                                                            </div>
                                                            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                                <div
                                                                    className={cn(
                                                                        "h-full transition-all duration-700",
                                                                        usagePercent > 95 ? 'bg-rose-500' : usagePercent > 80 ? 'bg-amber-500' : 'bg-blue-500'
                                                                    )}
                                                                    style={{ width: `${usagePercent}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn(
                                                                "h-2 w-2 rounded-full",
                                                                lic.status === 'Active' ? 'bg-emerald-500' :
                                                                    lic.status === 'Warning' ? 'bg-amber-500' :
                                                                        'bg-rose-500',
                                                                "animate-pulse"
                                                            )} />
                                                            <span className="text-xs font-medium">{lic.status}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 font-bold text-slate-900 dark:text-white">
                                                        {lic.annualCost}
                                                    </td>
                                                    <td className={cn("px-6 py-5 text-xs font-medium", expiryColorClass)}>
                                                        {lic.expiryDate}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Side Detail Panel */}
            <AnimatePresence>
                {selectedLicense && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedLicense(null)}
                            className="fixed inset-0 z-50 bg-slate-950/20 backdrop-blur-sm sm:pl-64"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 z-50 h-screen w-full max-w-lg border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
                        >
                            <div className="flex h-full flex-col">
                                <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold",
                                            selectedLicense.color === 'rose' ? "bg-rose-100 text-rose-600" :
                                                selectedLicense.color === 'blue' ? "bg-blue-100 text-blue-600" :
                                                    selectedLicense.color === 'indigo' ? "bg-indigo-100 text-indigo-600" :
                                                        "bg-emerald-100 text-emerald-600"
                                        )}>
                                            {selectedLicense.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedLicense.name}</h2>
                                            <p className="text-sm text-slate-500">{selectedLicense.vendor}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedLicense(null)}
                                        className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Available Seats</p>
                                            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                                                {selectedLicense.totalSeats - selectedLicense.usedSeats}
                                            </p>
                                            <p className="text-xs text-slate-500">out of {selectedLicense.totalSeats}</p>
                                        </div>
                                        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Annual Cost</p>
                                            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{selectedLicense.annualCost}</p>
                                            <p className="text-xs text-slate-500">{selectedLicense.price} / {selectedLicense.billingCycle}</p>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">License Details</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500 flex items-center gap-2"><Calendar className="h-4 w-4" /> Expiry Date</span>
                                                <span className="font-medium">{selectedLicense.expiryDate}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500 flex items-center gap-2"><Key className="h-4 w-4" /> License Key</span>
                                                <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">XXXX-XXXX-XXXX-4921</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500 flex items-center gap-2"><Users className="h-4 w-4" /> Seat Occupancy</span>
                                                <span className="font-medium">{Math.round((selectedLicense.usedSeats / selectedLicense.totalSeats) * 100)}% Used</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Users List */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Assigned Users</h3>
                                            <span className="text-xs font-bold text-blue-600">{selectedLicense.usedSeats} Total</span>
                                        </div>
                                        <div className="space-y-2">
                                            {selectedLicense.users.map((user, idx) => (
                                                <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 dark:border-slate-800 dark:bg-slate-900/30">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold">{user.name}</p>
                                                            <p className="text-[10px] text-slate-500">{user.department}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-medium text-slate-400">Since</p>
                                                        <p className="text-[10px] font-bold text-slate-900 dark:text-white">{user.assignedDate}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {selectedLicense.usedSeats > selectedLicense.users.length && (
                                                <p className="text-center text-xs text-slate-500 py-2">
                                                    + {selectedLicense.usedSeats - selectedLicense.users.length} more users
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 p-6 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                    <div className="flex gap-3">
                                        <button className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all">
                                            Assign New Seat
                                        </button>
                                        <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                                            <ExternalLink className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
