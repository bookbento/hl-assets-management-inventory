"use client";

import { Sidebar } from "./Sidebar";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Menu, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useQuery } from "@tanstack/react-query";
import { getExpiringSoonLicenses, getLicenseSummary, type LicenseExpiryAlert } from "@/lib/api";
import Link from "next/link";

const notificationTone: Record<
  LicenseExpiryAlert["urgency"],
  { dot: string; text: string; border: string; bg: string }
> = {
  soon: {
    dot: "bg-amber-500",
    text: "text-amber-700",
    border: "border-amber-200",
    bg: "bg-amber-50",
  },
  warning: {
    dot: "bg-orange-500",
    text: "text-orange-700",
    border: "border-orange-200",
    bg: "bg-orange-50",
  },
  critical: {
    dot: "bg-rose-500",
    text: "text-rose-700",
    border: "border-rose-200",
    bg: "bg-rose-50",
  },
};

const formatExpiryNotice = (daysLeft: number) => {
  if (daysLeft <= 0) return "Expires today";
  if (daysLeft === 1) return "Expires in 1 day";
  return `Expires in ${daysLeft} days`;
};

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
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const notificationsRef = useRef<HTMLDivElement>(null);

  const { data: licenseSummary } = useQuery({
    queryKey: ["license-summary"],
    queryFn: getLicenseSummary,
    enabled: !isLoginPage,
    staleTime: 60_000,
  });

  const { data: expiringLicenses = [], isLoading: isLoadingNotifications } = useQuery({
    queryKey: ["license-expiring-soon"],
    queryFn: getExpiringSoonLicenses,
    enabled: !isLoginPage,
    staleTime: 60_000,
  });

  useEffect(() => {
    setSearchQuery(searchParams?.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    setIsNotificationOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const notificationCount = licenseSummary?.expiringSoon ?? expiringLicenses.length;
  const visibleNotifications = useMemo(() => expiringLicenses.slice(0, 5), [expiringLicenses]);

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

              <div className="relative flex-shrink-0" ref={notificationsRef}>
                <button
                  type="button"
                  onClick={() => setIsNotificationOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={isNotificationOpen}
                  className="relative flex items-center justify-center rounded-full border border-[#D2D2D7] bg-white p-2 shadow-sm transition-all hover:bg-gray-50 active:scale-95 sm:p-2.5"
                >
                  <Bell className="h-4 w-4 text-[#424245]" />
                  {notificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-sm">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotificationOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute right-0 top-full z-50 mt-3 w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-3xl border border-[#D2D2D7] bg-white shadow-2xl"
                    >
                      <div className="flex items-center justify-between border-b border-[#E5E5EA] px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-[#1D1D1F]">License Alerts</p>
                          <p className="text-xs text-[#86868B]">
                            {notificationCount > 0
                              ? `${notificationCount} licenses expiring soon`
                              : "No licenses are expiring in the next 30 days"}
                          </p>
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="max-h-[22rem] overflow-y-auto p-2">
                        {isLoadingNotifications ? (
                          <div className="flex items-center justify-center py-10 text-sm text-[#86868B]">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading alerts...
                          </div>
                        ) : visibleNotifications.length > 0 ? (
                          <div className="space-y-2">
                            {visibleNotifications.map((license) => {
                              const tone = notificationTone[license.urgency];

                              return (
                                <Link
                                  key={license.id}
                                  href={`/licenses/${license.id}`}
                                  onClick={() => setIsNotificationOpen(false)}
                                  className={`block rounded-2xl border ${tone.border} ${tone.bg} px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-sm`}
                                >
                                  <div className="flex items-start gap-3">
                                    <span className={`mt-1 h-2.5 w-2.5 rounded-full ${tone.dot}`} />
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                          <p className="truncate text-sm font-semibold text-[#1D1D1F]">
                                            {license.name}
                                          </p>
                                          <p className="truncate text-xs text-[#6E6E73]">
                                            {license.vendor} • {license.type}
                                          </p>
                                        </div>
                                        <ArrowRight className={`mt-0.5 h-4 w-4 shrink-0 ${tone.text}`} />
                                      </div>
                                      <div className="mt-2 flex items-center justify-between gap-2">
                                        <span className={`text-xs font-medium ${tone.text}`}>
                                          {formatExpiryNotice(license.daysLeft)}
                                        </span>
                                        <span className="text-[11px] text-[#86868B]">
                                          {new Date(license.expiryDate).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                          })}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="px-4 py-10 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                              <Bell className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-semibold text-[#1D1D1F]">All clear</p>
                            <p className="mt-1 text-xs text-[#86868B]">
                              No licenses are expiring within the next 30 days.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-[#E5E5EA] bg-[#FAFAFA] px-4 py-3">
                        <Link
                          href="/licenses"
                          onClick={() => setIsNotificationOpen(false)}
                          className="flex items-center justify-between rounded-2xl border border-[#D2D2D7] bg-white px-3 py-2 text-sm font-medium text-[#1D1D1F] transition-colors hover:bg-[#F5F5F7]"
                        >
                          <span>Open licenses page</span>
                          <ArrowRight className="h-4 w-4 text-[#86868B]" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
