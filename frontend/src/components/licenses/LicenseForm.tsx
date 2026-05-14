import React, { useState } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLicense } from "@/lib/api";
import { toast } from "react-hot-toast";

interface LicenseFormProps {
  onClose: () => void;
  onSubmit?: () => void;
}

export function LicenseForm({ onClose, onSubmit }: LicenseFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    vendor: "",
    type: "Subscription",
    totalSeats: "",
    price: "",
    billingCycle: "Annually",
    annualCost: "",
    expiryDate: "",
    color: "blue",
    status: "ACTIVE",
  });

  const createMutation = useMutation({
    mutationFn: createLicense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      queryClient.invalidateQueries({ queryKey: ["license-summary"] });
      toast.success("License created successfully");
      if (onSubmit) onSubmit();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create license");
    },
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.vendor || !formData.totalSeats) {
      toast.error("Please fill in all required fields.");
      return;
    }

    createMutation.mutate({
      ...formData,
      totalSeats: parseInt(formData.totalSeats, 10),
      // Ensure ISO format for Prisma
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : "",
      // Ensure currency format if required by DB
      price: formData.price.startsWith('$') ? formData.price : `$${formData.price}`,
      annualCost: formData.annualCost.startsWith('$') ? formData.annualCost : `$${formData.annualCost}`,
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
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
              Add New License
            </h3>
            <p className="text-sm text-slate-500">
              Create a new software license in the database.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-2 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Name *</span>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
            />
          </label>
          <label className="space-y-2 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Vendor *</span>
            <input
              type="text"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
            />
          </label>
          <label className="space-y-2 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Type</span>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
            />
          </label>
          <label className="space-y-2 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Seats *</span>
            <input
              type="number"
              value={formData.totalSeats}
              onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
            />
          </label>
          <label className="space-y-2 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Price</span>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
            />
          </label>
          <label className="space-y-2 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Billing Cycle</span>
            <input
              type="text"
              value={formData.billingCycle}
              onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
            />
          </label>
          <label className="space-y-2 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Annual Cost</span>
            <input
              type="number"
              step="0.01"
              value={formData.annualCost}
              onChange={(e) => setFormData({ ...formData, annualCost: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
            />
          </label>
          <label className="space-y-2 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Expiry Date</span>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
            />
          </label>
          <label className="space-y-2 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Color</span>
            <select
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
            >
              <option value="blue">Blue</option>
              <option value="indigo">Indigo</option>
              <option value="emerald">Emerald</option>
              <option value="rose">Rose</option>
              <option value="amber">Amber</option>
            </select>
          </label>
          <label className="space-y-2 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</span>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-500 disabled:opacity-60"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Create License
          </button>
        </div>
      </motion.div>
    </>
  );
}
