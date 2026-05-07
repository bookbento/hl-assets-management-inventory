"use client";

import { AssetStats } from "@/lib/mockups/types";
import { Package, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/mockups/utils";

interface SummaryCardsProps {
  stats: AssetStats;
}

export function SummaryCards({ stats }: SummaryCardsProps) {
  if (!stats) {
    return <div>Loading...</div>;
  }

  const items = [
    {
      label: "Total Assets",
      value: stats.total,
      icon: Package,
      color: "text-blue-500",
      bg: "bg-white",
    },
    {
      label: "In Use",
      value: stats.inUse,
      icon: CheckCircle,
      color: "text-blue-600",
      bg: "bg-blue-100/50",
    },
    {
      label: "Available",
      value: stats.available,
      icon: RefreshCw,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Maintenance",
      value: stats.maintenance,
      icon: AlertCircle,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
  ];

  return (
    <>
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={cn(
            "p-4 sm:p-5 flex flex-col justify-between col-span-1 text-left", // ปรับ padding ตามจอ
            "rounded-[var(--radius-apple)] border border-[#d2d2d7] shadow-sm transition-all duration-200",
            item.bg,
          )}
        >
          <span className="text-[10px] sm:text-xs font-bold text-[#86868B] uppercase tracking-wider">
            {item.label}
          </span>

          <div className="flex items-end justify-between mt-2">
            <div className="overflow-hidden">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">
                {item.value.toLocaleString()}
              </h3>

              <p
                className={cn(
                  "text-[9px] sm:text-[10px] md:text-xs font-medium mt-1 truncate",
                  item.label === "Available"
                    ? "text-primary"
                    : "text-[#86868B]",
                )}
              >
                {item.label === "Total Assets"
                  ? "+12% from last month"
                  : item.label === "In Use"
                    ? "81.1% Utilization"
                    : item.label === "Available"
                      ? "Ready for deployment"
                      : "4 items pending"}
              </p>
            </div>

            <div className={cn(
              "p-1.5 sm:p-2.5 rounded-xl ml-2 flex-shrink-0",
              item.bg,
              item.color
            )}>
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
}