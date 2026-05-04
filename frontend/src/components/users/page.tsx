'use client';

import { MOCK_USERS } from '@/lib/mockups/mockup-data';
import { Briefcase, Plus, Search, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UsersPage() {
    return (
        <main className="ml-64 p-8 min-h-screen bg-[#F5F5F7]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
                    <p className="text-[#86868B]">Manage staff access and equipment assignments.</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Employee</span>
                </button>
            </div>

            <div className="apple-card overflow-hidden bg-white">
                <div className="p-5 border-b border-[#D2D2D7] flex items-center justify-between bg-gray-50/30">
                    <div className="relative w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
                        <input
                            type="text"
                            placeholder="Filter employees..."
                            className="w-full bg-white border border-[#D2D2D7] rounded-full py-1.5 pl-11 pr-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50/50 border-b border-[#D2D2D7]">
                            <tr>
                                <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-tight text-[#86868B]">Name</th>
                                <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-tight text-[#86868B]">Department</th>
                                <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-tight text-[#86868B]">Assets</th>
                                <th className="text-right px-6 py-4 text-[11px] font-bold uppercase tracking-tight text-[#86868B]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D2D2D7]">
                            {MOCK_USERS.map((user, i) => (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 border border-[#D2D2D7] flex items-center justify-center text-xs font-bold text-[#1D1D1F]">
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#1D1D1F]">{user.name}</p>
                                                <p className="text-[11px] text-[#86868B] font-medium">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-3.5 h-3.5 text-[#86868B]" />
                                            <span className="text-[#424245] font-medium">{user.department}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-gray-100 rounded-full text-[11px] font-bold text-[#1D1D1F]">
                                            {user.assetsCount} Items
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#86868B]">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
