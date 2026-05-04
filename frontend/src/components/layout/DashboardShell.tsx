"use client";

import { Sidebar } from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, User } from "lucide-react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F5F5F7]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between mb-10">
          <div className="text-left">
            <h1 className="text-3xl font-bold tracking-tight">
              System Overview
            </h1>
            <p className="text-[#86868B]">
              Manage and track company hardware assets.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
              <input
                type="text"
                placeholder="Search assets..."
                className="w-full bg-white border border-[#D2D2D7] rounded-full py-2.5 pl-11 pr-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2.5 bg-white border border-[#D2D2D7] rounded-full hover:bg-gray-50 transition-colors relative shadow-sm">
                <Bell className="w-4 h-4 text-[#424245]" />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full border border-white"></span>
              </button>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
