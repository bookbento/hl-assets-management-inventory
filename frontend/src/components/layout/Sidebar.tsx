// frontend/src/components/Sidebar.tsx
"use client";

import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/mockups/utils";
import { useMemo } from "react";

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/", roles: ["admin", "user"] },
  { label: "Assets", icon: Package, href: "/assets", roles: ["admin", "user"] },
  { label: "Employees", icon: Users, href: "/employees", roles: ["admin"] },
  { label: "Settings", icon: Settings, href: "/settings", roles: ["admin"] },
];

interface SidebarProps {
  className?: string;
  isDrawer?: boolean;
}

export function Sidebar({ className, isDrawer = false }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session as any)?.user?.role || "user";
  const username = (session as any)?.user?.username || "User";

  const visibleItems = useMemo(
    () => sidebarItems.filter((item) => item.roles.includes(role)),
    [role],
  );

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className={cn(
      "h-full bg-[var(--surface)] border-r border-[var(--border)] flex flex-col transition-all duration-300",
      !isDrawer && "fixed left-0 top-0 z-50 hidden lg:flex lg:w-64 md:flex md:w-20",
      isDrawer && "w-full",
      className
    )}>
      <div className={cn(
        "p-6 flex items-center gap-3 overflow-hidden",
        !isDrawer && "md:justify-center lg:justify-start"
      )}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <Package className="w-5 h-5 text-white" />
        </div>
        <span className={cn(
          "font-bold text-xl tracking-tight text-[var(--foreground)] transition-opacity duration-300",
          !isDrawer && "md:hidden lg:block"
        )}>
          IT AM
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all group overflow-hidden",
              pathname === item.href
                ? "bg-primary/10 text-primary"
                : "text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
              !isDrawer && "md:justify-center lg:justify-start"
            )}
          >
            <item.icon
              className={cn(
                "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                pathname === item.href ? "text-primary" : "text-[var(--muted-foreground)]",
              )}
            />
            <span className={cn(
              "transition-opacity duration-300 whitespace-nowrap",
              !isDrawer && "md:hidden lg:block"
            )}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <div
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-[var(--surface-muted)] transition-colors cursor-pointer group overflow-hidden",
            !isDrawer && "md:justify-center lg:justify-start"
          )}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-xs font-bold text-[var(--foreground)] border border-[var(--border)] shrink-0">
            {(username || "User")
              .split(" ")
              .map((part: string) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div className={cn(
            "flex-1 overflow-hidden text-left transition-opacity duration-300",
            !isDrawer && "md:hidden lg:block"
          )}>
            <p className="text-sm font-semibold truncate text-[var(--foreground)]">
              {username}
            </p>
            <p className="text-[11px] text-[var(--muted-foreground)] truncate font-bold uppercase tracking-wide">
              {role}
            </p>
          </div>
          <LogOut className={cn(
            "w-4 h-4 text-[var(--muted-foreground)] group-hover:text-red-500 transition-colors shrink-0",
            !isDrawer && "md:hidden lg:block"
          )} />
        </div>
      </div>
    </div>
  );
}
