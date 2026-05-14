"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Briefcase, Plus, FileDown, CheckCircle, Loader2, Building, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useSearchParams } from "next/navigation";

import { Suspense } from "react";
import Papa from "papaparse";
import { resolveMediaUrl } from "@/lib/config";

function EmployeesPageContent() {
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

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



  const handleAddEmployee = (data: any) => {
    mutation.mutate(data);
  };

  const handleEditEmployee = (data: any) => {
    if (editingEmployee) {
      updateMut.mutate({ id: editingEmployee.id, data });
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

        toast.loading(`Importing ${rows.length} employees...`, { id: 'import-loading' });

        // Get BU/Dept data to match names if needed, or assume ID is provided in CSV
        // For simplicity, we'll assume the CSV has: name, email, businessUnitId, departmentId, jobTitleId

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

        toast.dismiss('import-loading');
        queryClient.invalidateQueries({ queryKey: ["employees"] });

        if (failCount === 0) {
          toast.success(`Successfully imported ${successCount} employees`);
        } else {
          toast.success(`Import finished: ${successCount} success, ${failCount} failed`);
        }

        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      error: (error) => {
        toast.error("Error parsing CSV file");
        setIsImporting(false);
      }
    });
  };



  return (
    <DashboardShell
      title="Employees"
      description="Manage staff access and equipment assignments."
    >
      <div className="flex justify-between items-center mb-8">
        <div className="text-primary">
          <span className="ml-1 text-sm">Manage the employee list: add, edit, and delete employees.</span>
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
            className="flex items-center gap-2 px-4 py-2 border border-[#D2D2D7] bg-white rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm active:scale-95 disabled:opacity-50"
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

      <div className="apple-card overflow-hidden bg-white min-h-[400px] flex flex-col">


        <EmployeeTable onEdit={(employee) => setEditingEmployee(employee)} />
      </div>

      {/* Employee Form Modal (Create) */}
      <AnimatePresence>
        {showForm && (
          <EmployeeForm
            onClose={() => setShowForm(false)}
            onSubmit={handleAddEmployee}
          />
        )}
      </AnimatePresence>

      {/* Employee Form Modal (Edit) */}
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

      {/* Success Notification Toast */}
      <AnimatePresence>
        {notification && (
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
              <p className="font-bold text-sm">{notification.title}</p>
              <p className="text-xs text-gray-400 font-medium">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}

export default function EmployeesPage() {
  return (
    <Suspense fallback={<div className="min-h-[400px]" />}>
      <EmployeesPageContent />
    </Suspense>
  );
}
