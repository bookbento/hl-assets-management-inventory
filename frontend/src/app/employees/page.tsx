"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Briefcase, Plus, Search, FileDown, CheckCircle, Loader2, Building, Pencil, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Papa from "papaparse";

export default function EmployeesPage() {
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams?.get("search") || "";
  const [localSearch, setLocalSearch] = useState(urlSearch);

  useEffect(() => {
    setLocalSearch(urlSearch);
  }, [urlSearch]);

  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const mutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setShowForm(false);
      setNotification({
        title: "Employee Added Successfully",
        message: "New staff profile has been registered."
      });
      setTimeout(() => setNotification(null), 3000);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create employee");
    },
  });

  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setEditingEmployee(null);
      setNotification({
        title: "Employee Updated",
        message: "The employee information has been saved."
      });
      setTimeout(() => setNotification(null), 3000);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update employee");
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setNotification({
        title: "Employee Deleted",
        message: "The staff record has been removed."
      });
      setTimeout(() => setNotification(null), 3000);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete employee");
    },
  });

  const handleAddEmployee = (data: any) => {
    mutation.mutate(data);
  };

  const handleEditEmployee = (data: any) => {
    if (editingEmployee) {
      updateMut.mutate({ id: editingEmployee.id, data });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      deleteMut.mutate(id);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        let successCount = 0;
        let failCount = 0;

        toast.loading(`Importing ${rows.length} employees...`, { id: "import-loading" });

        for (const row of rows) {
          try {
            await createEmployee({
              name: row.name,
              email: row.email,
              businessUnitId: row.businessUnitId,
              departmentId: row.departmentId,
              jobTitleId: row.jobTitleId,
            });
            successCount++;
          } catch (err) {
            console.error("Failed to import row:", row, err);
            failCount++;
          }
        }

        toast.dismiss("import-loading");
        queryClient.invalidateQueries({ queryKey: ["employees"] });

        if (failCount === 0) {
          toast.success(`Successfully imported ${successCount} employees`);
        } else {
          toast.success(`Import finished: ${successCount} success, ${failCount} failed`);
        }

        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      error: () => {
        toast.error("Error parsing CSV file");
        setIsImporting(false);
      }
    });
  };

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

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-8">
        <div className="text-left">
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-[var(--muted-foreground)]">
            Manage staff access and equipment assignments.
          </p>
        </div>
        <div className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] bg-[var(--surface)] rounded-lg text-sm font-medium hover:bg-[var(--surface-muted)] transition-colors shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            <span>{isImporting ? "Importing..." : "Import Employee"}</span>
          </button>
          <button
            className="btn-primary flex items-center gap-2"
            onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      <div className="apple-card overflow-hidden bg-[var(--surface)] min-h-[400px] flex flex-col">
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-soft)]">
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                router.push(`/employees?search=${encodeURIComponent(e.target.value)}`);
              }}
              placeholder="Filter employees..."
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-full py-1.5 pl-11 pr-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-[var(--muted-foreground)]">Loading employees...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--surface-soft)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-tight text-[var(--muted-foreground)]">
                    Name
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-tight text-[var(--muted-foreground)]">
                    Unit / Department
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-tight text-[var(--muted-foreground)]">
                    Job Title
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-tight text-[var(--muted-foreground)]">
                    Assets
                  </th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-tight text-[var(--muted-foreground)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredEmployees.map((employee: any, i: number) => (
                  <motion.tr
                    key={employee.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-[var(--surface-muted)] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-slate-600 dark:to-slate-700 border border-[var(--border)] flex items-center justify-center text-xs font-bold text-[var(--foreground)]">
                          {(employee.name || 'E')
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--foreground)]">{employee.name}</p>
                          <p className="text-[11px] text-[var(--muted-foreground)] font-medium">
                            {employee.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[var(--surface-muted)] rounded text-[var(--muted-foreground)] uppercase">
                            {employee.businessUnit?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="w-3 h-3 text-[var(--muted-foreground)]" />
                          <span className="text-[var(--foreground)] font-medium">
                            {employee.department?.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                        <span className="text-[var(--foreground)] font-medium">
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
                          onClick={() => setEditingEmployee(employee)}
                          className="p-1.5 hover:bg-[var(--surface-muted)] rounded-lg transition-colors text-[var(--muted-foreground)] hover:text-primary"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
                          disabled={deleteMut.isPending}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-[var(--muted-foreground)] hover:text-red-500 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <EmployeeForm
            onClose={() => setShowForm(false)}
            onSubmit={handleAddEmployee}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingEmployee && (
          <EmployeeForm
            title="Edit Employee"
            initialData={editingEmployee}
            onClose={() => setEditingEmployee(null)}
            onSubmit={handleEditEmployee}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-8 right-8 z-[200] bg-[var(--surface)] text-[var(--foreground)] px-6 py-4 rounded-apple-lg shadow-2xl flex items-center gap-4 border border-[var(--border)]"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm">{notification.title}</p>
              <p className="text-xs text-[var(--muted-foreground)] font-medium">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}
