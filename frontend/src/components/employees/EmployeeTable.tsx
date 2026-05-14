"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEmployees, deleteEmployee } from "@/lib/api";
import { Building, Briefcase, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { resolveMediaUrl } from "@/lib/config";
import { toast } from "react-hot-toast";
import { useSearchParams } from "next/navigation";

interface EmployeeTableProps {
  onEdit: (employee: any) => void;
}

export function EmployeeTable({ onEdit }: EmployeeTableProps) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const localSearch = searchParams?.get("search") || "";
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: employees, isLoading, error } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      toast.success("Employee deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: () => {
      toast.error("Failed to delete employee");
    },
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-[#86868B]">Loading employees...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <p className="text-sm text-red-500">Error loading employees</p>
      </div>
    );
  }

  const filteredEmployees = employees?.filter((emp: any) => {
    if (!localSearch) return true;
    const term = localSearch.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(term) ||
      emp.email?.toLowerCase().includes(term) ||
      emp.department?.name?.toLowerCase().includes(term) ||
      emp.jobTitle?.name?.toLowerCase().includes(term) ||
      emp.businessUnit?.name?.toLowerCase().includes(term)
    );
  }) || [];

  const totalPages = Math.ceil(filteredEmployees.length / limit);
  const startIndex = (page - 1) * limit;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + limit);

  return (
    <div className="flex flex-col flex-1">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 border-b border-[#D2D2D7]">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-tight text-[#86868B]">
                Name
              </th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-tight text-[#86868B]">
                Unit / Department
              </th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-tight text-[#86868B]">
                Job Title
              </th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-tight text-[#86868B]">
                Assets
              </th>
              <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-tight text-[#86868B]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D2D2D7]">
            {paginatedEmployees.map((employee: any, i: number) => (
              <motion.tr
                key={employee.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onEdit(employee)}
                className="hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 border border-[#D2D2D7] flex items-center justify-center text-xs font-bold text-[#1D1D1F] overflow-hidden shrink-0">
                      {employee.avatarUrl ? (
                        <img
                          src={resolveMediaUrl(employee.avatarUrl) || undefined}
                          alt={employee.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>
                          {(employee.name || 'E')
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-[#1D1D1F]">{employee.name}</p>
                      <p className="text-[11px] text-[#86868B] font-medium">
                        {employee.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 rounded text-[#86868B] uppercase">
                        {employee.businessUnit?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-3 h-3 text-[#86868B]" />
                      <span className="text-[#424245] font-medium">
                        {employee.department?.name}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-[#86868B]" />
                    <span className="text-[#424245] font-medium">
                      {employee.jobTitle?.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[11px] font-bold">
                    {employee._count?.employeeAssets || 0} Items
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(employee);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-[#86868B] hover:text-primary"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this employee?")) {
                          deleteMutation.mutate(employee.id);
                        }
                      }}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-[#86868B] hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
            {paginatedEmployees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[#86868B]">
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-[#D2D2D7] bg-gray-50 flex items-center justify-between">
          <div className="text-[11px] font-medium text-[#86868B]">
            Showing {startIndex + 1} to {Math.min(startIndex + limit, filteredEmployees.length)} of {filteredEmployees.length} entries
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
