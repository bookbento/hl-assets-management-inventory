"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Check,
  DollarSign,
  FileUp,
  Key,
  Loader2,
  Plus,
  Pencil,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LicenseForm } from "@/components/licenses/LicenseForm";
import { LicenseTable } from "@/components/licenses/LicenseTable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
  assignLicense,
  deleteLicense,
  getEmployees,
  getLicenseSummary,
  getLicenses,
  LicenseRecord,
  unassignLicense,
  updateLicense,
} from "@/lib/api";
import Papa from "papaparse";
import { toast } from "react-hot-toast";

type LicenseFormState = {
  name: string;
  vendor: string;
  type: string;
  totalSeats: string;
  status: LicenseRecord["status"];
  expiryDate: string;
  price: string;
  billingCycle: string;
  annualCost: string;
  color: string;
};

type LicenseEmployee = {
  id: string;
  name: string;
  email: string;
  department?: { name?: string } | null;
  businessUnit?: { name?: string } | null;
};

const statusMeta: Record<
  LicenseRecord["status"],
  { label: string; dot: string; badge: string }
> = {
  ACTIVE: {
    label: "Active",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  WARNING: {
    label: "Warning",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  CRITICAL: {
    label: "Critical",
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
  },
  EXPIRED: {
    label: "Expired",
    dot: "bg-slate-500",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

const colorMeta: Record<string, string> = {
  rose: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
  indigo:
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
  emerald:
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
  amber:
    "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatMoney = (value: number) => money.format(value || 0);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const emptyFormState = (license: LicenseRecord): LicenseFormState => ({
  name: license.name,
  vendor: license.vendor,
  type: license.type,
  totalSeats: String(license.totalSeats),
  status: license.status,
  expiryDate: license.expiryDate.split("T")[0],
  price: license.price,
  billingCycle: license.billingCycle,
  annualCost: license.annualCost,
  color: license.color || "blue",
});

export default function LicensesPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const searchTerm = searchParams?.get("search") || "";
  const [selectedLicenseId, setSelectedLicenseId] = useState<string | null>(null);
  const [editingLicenseId, setEditingLicenseId] = useState<string | null>(null);
  const [assigningLicenseId, setAssigningLicenseId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<LicenseFormState | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: licenses = [], isLoading, error } = useQuery({
    queryKey: ["licenses"],
    queryFn: getLicenses,
  });

  const { data: summary } = useQuery({
    queryKey: ["license-summary"],
    queryFn: getLicenseSummary,
  });

  const { data: employees = [] } = useQuery<LicenseEmployee[]>({
    queryKey: ["employees"],
    queryFn: getEmployees as unknown as () => Promise<LicenseEmployee[]>,
  });

  const selectedLicense = licenses.find((license) => license.id === selectedLicenseId) || null;
  const editingLicense = licenses.find((license) => license.id === editingLicenseId) || null;
  const assigningLicense = licenses.find((license) => license.id === assigningLicenseId) || null;

  const filteredLicenses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return licenses;

    return licenses.filter((license) => {
      return (
        license.name.toLowerCase().includes(term) ||
        license.vendor.toLowerCase().includes(term) ||
        license.type.toLowerCase().includes(term) ||
        license.status.toLowerCase().includes(term)
      );
    });
  }, [licenses, searchTerm]);

  useEffect(() => {
    if (editingLicense) {
      setEditingForm(emptyFormState(editingLicense));
    }
  }, [editingLicense]);

  useEffect(() => {
    if (!assigningLicense) {
      setSelectedEmployeeId("");
      return;
    }

    const eligibleEmployee = employees.find(
      (employee) =>
        !assigningLicense.assignments.some(
          (assignment) => assignment.employee.id === employee.id,
        ),
    );

    setSelectedEmployeeId(eligibleEmployee?.id || "");
  }, [assigningLicense, employees]);

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, any> }) =>
      updateLicense(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      queryClient.invalidateQueries({ queryKey: ["license-summary"] });
      setEditingLicenseId(null);
      setEditingForm(null);
      toast.success("License updated");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update license");
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, employeeId }: { id: string; employeeId: string }) =>
      assignLicense(id, { employeeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      queryClient.invalidateQueries({ queryKey: ["license-summary"] });
      setAssigningLicenseId(null);
      setSelectedEmployeeId("");
      toast.success("Seat assigned");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to assign seat");
    },
  });

  const unassignMutation = useMutation({
    mutationFn: ({ id, assignmentId }: { id: string; assignmentId: string }) =>
      unassignLicense(id, { assignmentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      queryClient.invalidateQueries({ queryKey: ["license-summary"] });
      toast.success("User removed from license");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to remove user");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLicense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      queryClient.invalidateQueries({ queryKey: ["license-summary"] });
      setSelectedLicenseId(null);
      toast.success("License deleted");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete license");
    },
  });

  const handleExport = () => {
    try {
      if (!filteredLicenses.length) {
        toast.error("No licenses to export");
        return;
      }

      const csvData = filteredLicenses.map((license) => ({
        Name: license.name,
        Vendor: license.vendor,
        Type: license.type,
        "Total Seats": license.totalSeats,
        "Used Seats": license.usedSeats,
        Status: license.status,
        Expiry: formatDate(license.expiryDate),
        Price: license.price,
        "Billing Cycle": license.billingCycle,
        "Annual Cost": license.annualCost,
      }));

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `licenses_export_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Licenses exported successfully");
    } catch (exportError) {
      console.error("Export failed:", exportError);
      toast.error("Failed to export licenses");
    }
  };

  const submitEdit = () => {
    if (!editingLicense || !editingForm) return;

    updateMutation.mutate({
      id: editingLicense.id,
      payload: {
        name: editingForm.name,
        vendor: editingForm.vendor,
        type: editingForm.type,
        totalSeats: Number(editingForm.totalSeats),
        status: editingForm.status,
        expiryDate: new Date(editingForm.expiryDate).toISOString(),
        price: editingForm.price.startsWith('$') ? editingForm.price : `$${editingForm.price}`,
        billingCycle: editingForm.billingCycle,
        annualCost: editingForm.annualCost.startsWith('$') ? editingForm.annualCost : `$${editingForm.annualCost}`,
        color: editingForm.color,
      },
    });
  };

  const assignableEmployees = assigningLicense
    ? employees.filter(
      (employee) =>
        !assigningLicense.assignments.some(
          (assignment) => assignment.employee.id === employee.id,
        ),
    )
    : [];

  return (
    <DashboardShell
      title="Software Licenses"
      description="Live data from backend licenses table."
    >
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-primary">
            <span className="ml-1 text-sm">
              Manage the licenses: add, edit, and delete licenses.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="btn-primary flex items-center gap-2"
              onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4" />
              <span>Add License</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <FileUp className="h-4 w-4" /> Export
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 text-sm text-[#86868B]">Loading licenses...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 shadow-sm dark:border-rose-900/40 dark:bg-rose-950/20">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-8 w-8 text-rose-500" />
              <p className="mt-3 text-sm font-semibold text-rose-700 dark:text-rose-300">
                Failed to load licenses
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5 dark:border-emerald-900/30 dark:bg-emerald-900/10">
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <p className="text-xs font-bold uppercase tracking-wider">Total Licenses</p>
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {summary?.total ?? licenses.length}
                </h2>
                <p className="mt-1 text-xs text-emerald-600">Across all vendors</p>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-5 dark:border-rose-900/30 dark:bg-rose-900/10">
                <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                  <p className="text-xs font-bold uppercase tracking-wider">Expiring Soon</p>
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {summary?.expiringSoon ?? 0}
                </h2>
                <p className="mt-1 text-xs text-rose-600">Next 30 days</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-5 dark:border-blue-900/30 dark:bg-blue-900/10">
                <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
                  <p className="text-xs font-bold uppercase tracking-wider">Assigned Seats</p>
                  <Key className="h-5 w-5" />
                </div>
                <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {summary?.assignedSeats ?? 0}
                </h2>
                <p className="mt-1 text-xs text-blue-600">
                  {summary?.availableSeats ?? 0} seats available
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between text-indigo-500">
                  <p className="text-xs font-bold uppercase tracking-wider">Annual cost</p>
                  <DollarSign className="h-5 w-5" />
                </div>
                <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {formatMoney(summary?.annualCostTotal ?? 0)}
                </h2>
                <p className="mt-1 text-xs text-slate-500">Projected expenditure</p>
              </div>
            </div>

            <LicenseTable
              licenses={filteredLicenses}
              onSelectLicense={setSelectedLicenseId}
              onEditLicense={(id) => {
                setSelectedLicenseId(null);
                setEditingLicenseId(id);
              }}
              formatDate={formatDate}
            />
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedLicense && !isLoading && !error && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLicenseId(null)}
              className="fixed inset-0 z-50 bg-slate-950/20 backdrop-blur-sm sm:pl-64"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 h-screen w-full max-w-lg border-l border-[#D2D2D7] bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-[#D2D2D7] p-6 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold",
                        colorMeta[selectedLicense.color] || colorMeta.blue,
                      )}
                    >
                      {selectedLicense.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {selectedLicense.name}
                      </h2>
                      <p className="text-sm text-slate-500">{selectedLicense.vendor}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLicenseId(null)}
                    className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Available Seats
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                        {selectedLicense.availableSeats}
                      </p>
                      <p className="text-xs text-slate-500">
                        out of {selectedLicense.totalSeats}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Annual Cost
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                        {selectedLicense.annualCost}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedLicense.price} / {selectedLicense.billingCycle}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                      License Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2 text-slate-500">
                          <Calendar className="h-4 w-4" /> Expiry Date
                        </span>
                        <span className="font-medium">
                          {formatDate(selectedLicense.expiryDate)}
                        </span>
                      </div>
                      {(() => {
                        const now = new Date();
                        const expiry = new Date(selectedLicense.expiryDate);
                        const calcStatus = expiry < now ? "EXPIRED" :
                          selectedLicense.usedSeats >= selectedLicense.totalSeats ? "CRITICAL" :
                            selectedLicense.usagePercent >= 90 ? "WARNING" : "ACTIVE";
                        const dMeta = statusMeta[calcStatus];

                        return (
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2 text-slate-500">
                              <ShieldCheck className="h-4 w-4" /> Status
                            </span>
                            <span className={cn("font-bold",
                              calcStatus === "ACTIVE" ? "text-emerald-600" :
                                calcStatus === "WARNING" ? "text-amber-600" :
                                  calcStatus === "CRITICAL" ? "text-rose-600" : "text-slate-500"
                            )}>
                              {dMeta.label}
                            </span>
                          </div>
                        );
                      })()}
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2 text-slate-500">
                          <Users className="h-4 w-4" /> Seat Occupancy
                        </span>
                        <span className="font-medium">
                          {selectedLicense.usagePercent}% Used
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                        Assigned Users
                      </h3>
                      <button
                        onClick={() => setAssigningLicenseId(selectedLicense.id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-500"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Assign Seat
                      </button>
                    </div>
                    <div className="space-y-2">
                      {selectedLicense.assignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="flex items-center justify-between rounded-xl border border-slate-100 p-3 dark:border-slate-800 dark:bg-slate-900/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                              {assignment.employee.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold">
                                {assignment.employee.name}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {assignment.employee.department?.name ||
                                  assignment.employee.businessUnit?.name ||
                                  assignment.employee.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-[10px] font-medium text-slate-400">
                                Since
                              </p>
                              <p className="text-[10px] font-bold text-slate-900 dark:text-white">
                                {formatDate(assignment.assignedDate)}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Remove ${assignment.employee.name} from this license?`,
                                  )
                                ) {
                                  unassignMutation.mutate({
                                    id: selectedLicense.id,
                                    assignmentId: assignment.id,
                                  });
                                }
                              }}
                              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                              title="Remove user from license"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedLicenseId(null);
                        setEditingLicenseId(selectedLicense.id);
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl btn-primary py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit License</span>
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Delete ${selectedLicense.name} from the database?`,
                          )
                        ) {
                          deleteMutation.mutate(selectedLicense.id);
                        }
                      }}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-500 hover:bg-rose-50 dark:border-rose-900/40 dark:bg-slate-950"
                      title="Delete license"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <LicenseForm
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingLicense && editingForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm"
              onClick={() => setEditingLicenseId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="fixed left-1/2 top-1/2 z-[70] w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Edit License
                  </h3>
                  <p className="text-sm text-slate-500">
                    Update license details in the database.
                  </p>
                </div>
                <button
                  onClick={() => setEditingLicenseId(null)}
                  className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  ["name", "Name"],
                  ["vendor", "Vendor"],
                  ["type", "Type"],
                  ["totalSeats", "Total Seats"],
                  ["price", "Price"],
                  ["billingCycle", "Billing Cycle"],
                  ["annualCost", "Annual Cost"],
                  ["expiryDate", "Expiry Date"],
                  ["color", "Color"],
                ].map(([key, label]) => {
                  const fieldKey = key as keyof LicenseFormState;

                  return (
                    <label key={key} className="space-y-2 text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {label}
                      </span>
                      {fieldKey === "color" ? (
                        <select
                          value={editingForm[fieldKey]}
                          onChange={(e) =>
                            setEditingForm((prev) =>
                              prev ? { ...prev, color: e.target.value } : prev,
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
                        >
                          <option value="blue">Blue</option>
                          <option value="indigo">Indigo</option>
                          <option value="emerald">Emerald</option>
                          <option value="rose">Rose</option>
                          <option value="amber">Amber</option>
                        </select>
                      ) : (
                        <input
                          type={fieldKey === "totalSeats" ? "number" : fieldKey === "expiryDate" ? "date" : "text"}
                          value={editingForm[fieldKey]}
                          onChange={(e) =>
                            setEditingForm((prev) =>
                              prev
                                ? {
                                  ...prev,
                                  [fieldKey]: e.target.value,
                                }
                                : prev,
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
                        />
                      )}
                    </label>
                  );
                })}

                <label className="space-y-2 text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </span>
                  <select
                    value={editingForm.status}
                    onChange={(e) =>
                      setEditingForm((prev) =>
                        prev
                          ? {
                            ...prev,
                            status: e.target.value as LicenseRecord["status"],
                          }
                          : prev,
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="WARNING">Warning</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="EXPIRED">Expired</option>
                  </select>
                </label>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setEditingLicenseId(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={submitEdit}
                  disabled={updateMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-500 disabled:opacity-60"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {assigningLicense && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm"
              onClick={() => setAssigningLicenseId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="fixed left-1/2 top-1/2 z-[70] w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Assign Seat
                  </h3>
                  <p className="text-sm text-slate-500">
                    Add a user to {assigningLicense.name}.
                  </p>
                </div>
                <button
                  onClick={() => setAssigningLicenseId(null)}
                  className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="space-y-2 text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Employee
                  </span>
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <option value="">Select employee</option>
                    {assignableEmployees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} - {employee.email}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setAssigningLicenseId(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    selectedEmployeeId &&
                    assignMutation.mutate({
                      id: assigningLicense.id,
                      employeeId: selectedEmployeeId,
                    })
                  }
                  disabled={!selectedEmployeeId || assignMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-500 disabled:opacity-60"
                >
                  {assignMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Assign
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardShell >
  );
}
