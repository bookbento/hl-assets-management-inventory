"use client";

import { Sidebar } from "./Sidebar";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Menu } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

function DashboardShellContent({ 
  children,
  title = "System Overview",
  description = "Manage and track company hardware assets."
}: { 
  children: React.ReactNode;
  title?: string;
  description?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    setSearchQuery(searchParams?.get("search") || "");
  }, [searchParams]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (searchQuery.trim()) {
        router.push(`${pathname}?search=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        router.push(pathname);
      }
    }
  };

  const getPlaceholder = () => {
    if (pathname.startsWith("/employees")) return "Search employees...";
    if (pathname.startsWith("/licenses")) return "Search licenses...";
    return "Search assets...";
  };

  return (
    <div className="flex min-h-screen bg-[#F5F5F7]">

      {!isLoginPage && <Sidebar />}

      <main
        className={`flex-1 overflow-y-auto min-h-screen flex flex-col transition-all duration-300
        ${!isLoginPage ? 'lg:ml-64 md:ml-20 p-4 sm:p-6 md:p-8' : 'p-0'}
      `}
      >

        {/* Top bar */}
        {!isLoginPage && (
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
                  {title}
                </h1>

                <p className="text-xs sm:text-sm text-[#86868B] hidden xs:block">
                  {description}
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
                  placeholder={getPlaceholder()}
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
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
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

export function DashboardShell({ 
  children,
  title,
  description
}: { 
  children: React.ReactNode;
  title?: string;
  description?: string;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F7]" />}>
      <DashboardShellContent title={title} description={description}>{children}</DashboardShellContent>
    </Suspense>
  );
}
