"use client";

import { Sidebar } from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Menu } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  const pathname = usePathname();

  useEffect(() => {
    setSearchQuery(searchParams?.get("search") || "");
  }, [searchParams]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const baseRoute = pathname.startsWith("/employees") ? "/employees" : "/assets";
      if (searchQuery.trim()) {
        router.push(`${baseRoute}?search=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        router.push(baseRoute);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F5F7]">
      {/* Desktop Sidebar */}
      <Sidebar />

      <main className="flex-1 lg:ml-64 md:ml-20 p-4 md:p-8 overflow-y-auto min-h-screen flex flex-col transition-all duration-300">
        {/* Top bar */}
        <header className="flex items-center justify-between mb-6 md:mb-10">
          <div className="flex items-center gap-4">
            {/* Mobile Drawer Trigger */}
            <div className="md:hidden">
              <Drawer direction="left">
                <DrawerTrigger asChild>
                  <button className="p-2.5 bg-white border border-[#D2D2D7] rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                    <Menu className="w-5 h-5 text-[#424245]" />
                  </button>
                </DrawerTrigger>
                <DrawerContent className="w-[280px] p-0 border-none">
                  <Sidebar isDrawer={true} />
                </DrawerContent>
              </Drawer>
            </div>

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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  placeholder={pathname.startsWith("/employees") ? "Search employees (Press Enter)..." : "Search assets (Press Enter)..."}
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
