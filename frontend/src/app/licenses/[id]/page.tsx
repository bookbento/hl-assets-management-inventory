"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { getLicenseById, getEmployees } from "@/lib/api";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

const colorMeta: Record<string, string> = {
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
  indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
  rose: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
};

export default function LicenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: license, isLoading: isLoadingLicense } = useQuery({
    queryKey: ["license", id],
    queryFn: () => getLicenseById(id),
    enabled: !!id,
  });

  const { data: allEmployees, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const assignedEmployees = useMemo(() => {
    if (!license || !allEmployees) return [];
    const assignedIds = license.assignments.map(a => a.employee.id);
    return allEmployees.filter(emp => assignedIds.includes(emp.id));
  }, [license, allEmployees]);

  const isLoading = isLoadingLicense || isLoadingEmployees;

  const handleEdit = (employee: any) => {
    // Navigate to employees page and search for the user to view/edit details
    router.push(`/employees?search=${encodeURIComponent(employee.name)}`);
  };

  return (
    <DashboardShell
      title={license ? `License: ${license.name}` : "License Details"}
      description="View assigned users and details for this license."
    >
      <div className="space-y-6">
        <div>
          <Link
            href="/licenses"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Licenses
          </Link>
        </div>

        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 text-sm text-[#86868B] dark:text-slate-400">Loading details...</p>
            </div>
          </div>
        ) : license ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-2xl font-bold",
                    colorMeta[license.color] || colorMeta.blue,
                  )}
                >
                  {license.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{license.name}</h1>
                  <p className="text-slate-500 dark:text-slate-400">{license.vendor} • {license.type}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Seats Used</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {license.usedSeats} / {license.totalSeats}
                  </p>
                </div>
                <div className="text-right pl-15 pr-12">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Annual Cost</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {license.annualCost}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Assigned Users</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">List of all employees currently using this license.</p>
              </div>
              <div className="flex-1 flex flex-col">
                <EmployeeTable
                  employeesData={assignedEmployees}
                  isLoadingData={isLoading}
                  onEdit={handleEdit}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 shadow-sm dark:border-rose-900/40 dark:bg-rose-950/20">
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">License not found</p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
