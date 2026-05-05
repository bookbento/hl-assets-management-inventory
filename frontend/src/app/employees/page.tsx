"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Briefcase, Plus, Search, MoreHorizontal, CheckCircle, Loader2, Building } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEmployees, createEmployee } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function EmployeesPage() {
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const queryClient = useQueryClient();

  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const mutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setShowForm(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create employee");
    },
  });

  const handleAddEmployee = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-8">
        <div className="text-left">
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-[#86868B]">
            Manage staff access and equipment assignments.
          </p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      <div className="apple-card overflow-hidden bg-white min-h-[400px] flex flex-col">
        <div className="p-5 border-b border-[#D2D2D7] flex items-center justify-between bg-gray-50/30">
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
            <input
              type="text"
              placeholder="Filter employees..."
              className="w-full bg-white border border-[#D2D2D7] rounded-full py-1.5 pl-11 pr-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-[#86868B]">Loading employees...</p>
          </div>
        ) : (
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
                {employees?.map((employee: any, i: number) => (
                  <motion.tr
                    key={employee.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 border border-[#D2D2D7] flex items-center justify-center text-xs font-bold text-[#1D1D1F]">
                          {(employee.name || 'E')
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
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
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#86868B]">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Employee Form Modal */}
      <AnimatePresence>
        {showForm && (
          <EmployeeForm
            onClose={() => setShowForm(false)}
            onSubmit={handleAddEmployee}
          />
        )}
      </AnimatePresence>

      {/* Success Notification Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-8 right-8 z-[200] bg-gray-900 text-white px-6 py-4 rounded-apple-lg shadow-2xl flex items-center gap-4 border border-white/10"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm">Employee Added Successfully</p>
              <p className="text-xs text-gray-400 font-medium">New staff profile has been registered.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}
