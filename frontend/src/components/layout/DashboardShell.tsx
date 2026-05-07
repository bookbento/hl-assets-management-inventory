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

      <Sidebar />

      <main className="flex-1 lg:ml-64 md:ml-20 p-4 sm:p-6 md:p-8 overflow-y-auto min-h-screen flex flex-col transition-all duration-300">

        {/* --- Top bar (Responsive Optimized) --- */}
        <header className="flex flex-col gap-4 mb-6 md:mb-10 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <Drawer direction="left">
                <DrawerTrigger asChild>
                  <button className="p-2 bg-white border border-[#D2D2D7] rounded-lg active:scale-95 transition-all shadow-sm">
                    <Menu className="w-5 h-5 text-[#424245]" />
                  </button>
                </DrawerTrigger>
                <DrawerContent className="w-[280px] p-0 border-none">
                  <Sidebar isDrawer={true} />
                </DrawerContent>
              </Drawer>
            </div>

            <div className="text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#1D1D1F]">
                System Overview
              </h1>
              <p className="text-xs sm:text-sm text-[#86868B] hidden xs:block">
                Manage and track company hardware assets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            {/* Search Bar - ขยายเต็มความกว้างในมือถือ */}
            <div className="relative flex-1 sm:w-64 md:w-72 lg:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                placeholder={pathname.startsWith("/employees") ? "Search employees..." : "Search assets..."}
                className="w-full bg-white border border-[#D2D2D7] rounded-full py-2 sm:py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              />
            </div>

            {/* Notification Bell */}
            <button className="p-2 sm:p-2.5 bg-white border border-[#D2D2D7] rounded-full hover:bg-gray-50 active:scale-95 transition-all relative shadow-sm flex-shrink-0">
              <Bell className="w-4 h-4 text-[#424245]" />
              <span className="absolute top-2 sm:top-2.5 right-2 sm:right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname} // เพิ่ม key เพื่อให้ animation ทำงานเวลาเปลี่ยนหน้า
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