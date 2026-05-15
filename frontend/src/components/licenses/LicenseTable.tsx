"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck, AlertTriangle, Edit, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { LicenseRecord } from "@/lib/api";

interface LicenseTableProps {
  licenses: LicenseRecord[];
  onSelectLicense: (id: string) => void;
  onEditLicense: (id: string) => void;
  formatDate: (date: string) => string;
}

const statusMeta = {
  ACTIVE: { label: "Active", dot: "bg-emerald-500", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  WARNING: { label: "High Usage", dot: "bg-amber-500", badge: "border-amber-200 bg-amber-50 text-amber-700" },
  CRITICAL: { label: "No Seats", dot: "bg-rose-500", badge: "border-rose-200 bg-rose-50 text-rose-700" },
  EXPIRED: { label: "Expired", dot: "bg-slate-400", badge: "border-slate-200 bg-slate-50 text-slate-700" },
};

const colorMeta: Record<string, string> = {
  blue: "bg-blue-100 text-blue-600",
  indigo: "bg-indigo-100 text-indigo-600",
  emerald: "bg-emerald-100 text-emerald-600",
  rose: "bg-rose-100 text-rose-600",
  amber: "bg-amber-100 text-amber-600",
};

export function LicenseTable({ licenses, onSelectLicense, onEditLicense, formatDate }: LicenseTableProps) {
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const limit = 10;

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      setSortConfig(null);
      return;
    }
    setSortConfig({ key, direction });
  };

  const sortedLicenses = React.useMemo(() => {
    let sortableItems = [...licenses];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof LicenseRecord];
        let bValue: any = b[sortConfig.key as keyof LicenseRecord];

        if (sortConfig.key === 'status') {
           const getStatus = (l: LicenseRecord) => {
             const now = new Date();
             const expiry = new Date(l.expiryDate);
             if (expiry < now) return 0;
             if (l.usedSeats >= l.totalSeats) return 1;
             if (l.usagePercent >= 50) return 2;
             return 3;
           };
           aValue = getStatus(a);
           bValue = getStatus(b);
        } else if (sortConfig.key === 'annualCost') {
           aValue = parseFloat((aValue?.toString() || "0").replace(/[^0-9.-]+/g,"")) || 0;
           bValue = parseFloat((bValue?.toString() || "0").replace(/[^0-9.-]+/g,"")) || 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [licenses, sortConfig]);

  const totalPages = Math.ceil(sortedLicenses.length / limit);
  const startIndex = (page - 1) * limit;
  const paginatedLicenses = sortedLicenses.slice(startIndex, startIndex + limit);

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key === columnKey) {
      return sortConfig.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />;
    }
    return <ArrowUpDown className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 transition-opacity" />;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 text-xs font-bold border-b border-[#D2D2D7] uppercase tracking-tight text-[#86868B] dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 cursor-pointer group hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1.5">
                  Software & Vendor
                  <SortIcon columnKey="name" />
                </div>
              </th>
              <th className="px-6 py-4 cursor-pointer group hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('type')}>
                <div className="flex items-center gap-1.5">
                  Type
                  <SortIcon columnKey="type" />
                </div>
              </th>
              <th className="px-6 py-4 text-center cursor-pointer group hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('usagePercent')}>
                <div className="flex items-center justify-center gap-1.5">
                  Seats Usage
                  <SortIcon columnKey="usagePercent" />
                </div>
              </th>
              <th className="px-6 py-4 cursor-pointer group hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1.5">
                  Status
                  <SortIcon columnKey="status" />
                </div>
              </th>
              <th className="px-6 py-4 cursor-pointer group hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('annualCost')}>
                <div className="flex items-center gap-1.5">
                  Annual Cost
                  <SortIcon columnKey="annualCost" />
                </div>
              </th>
              <th className="px-6 py-4 cursor-pointer group hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('expiryDate')}>
                <div className="flex items-center gap-1.5">
                  Expiry
                  <SortIcon columnKey="expiryDate" />
                </div>
              </th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D2D2D7]">
            {paginatedLicenses.map((license) => {
              const getCalculatedStatus = () => {
                const now = new Date();
                const expiry = new Date(license.expiryDate);
                if (expiry < now) return "EXPIRED";
                if (license.usedSeats >= license.totalSeats) return "CRITICAL";
                if (license.usagePercent >= 50) return "WARNING";
                return "ACTIVE";
              };

              const currentStatus = getCalculatedStatus();
              const meta = statusMeta[currentStatus];

              return (
                <tr
                  key={license.id}
                  onClick={() => onSelectLicense(license.id)}
                  className="group cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl font-bold",
                          colorMeta[license.color] || colorMeta.blue,
                        )}
                      >
                        {license.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {license.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {license.vendor}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-tight text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {license.type}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="mx-auto w-full max-w-[140px]">
                      <div className="mb-1 flex items-center justify-between text-[10px]">
                        <span className="font-bold">
                          {license.usedSeats} / {license.totalSeats}
                        </span>
                        <span
                          className={
                            license.usagePercent > 90
                              ? "font-bold text-rose-500"
                              : license.usagePercent > 50
                                ? "font-bold text-amber-500"
                                : "text-slate-400"
                          }
                        >
                          {license.usagePercent}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className={cn(
                            "h-full transition-all duration-700",
                            license.usagePercent > 95
                              ? "bg-rose-500"
                              : license.usagePercent > 50
                                ? "bg-amber-500"
                                : "bg-blue-500",
                          )}
                          style={{ width: `${license.usagePercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", meta.dot, "animate-pulse")} />
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                          meta.badge,
                        )}
                      >
                        {meta.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-900 dark:text-white">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: license.currency || "USD",
                      maximumFractionDigits: 0,
                    }).format(license.annualCost || 0)}
                  </td>
                  <td
                    className={cn(
                      "px-6 py-5 text-xs font-medium",
                      currentStatus === "ACTIVE"
                        ? "text-emerald-600"
                        : currentStatus === "WARNING"
                          ? "text-amber-600"
                          : currentStatus === "CRITICAL"
                            ? "text-rose-600"
                            : "text-slate-500",
                    )}
                  >
                    {formatDate(license.expiryDate)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditLicense(license.id);
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-primary/20 cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
            {paginatedLicenses.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-[#86868B]">
                  No licenses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-[#D2D2D7] bg-gray-50 flex items-center justify-between">
          <div className="text-[11px] font-medium text-[#86868B]">
            Showing {startIndex + 1} to {Math.min(startIndex + limit, licenses.length)} of {licenses.length} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-[#D2D2D7] bg-white text-[#424245] hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-[#1D1D1F]">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-[#D2D2D7] bg-white text-[#424245] hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
