// frontend/src/app/assets/page.tsx
"use client";

import { useState } from "react";
import { AssetForm } from "@/components/assets/AssetForm";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AssetTable } from "@/components/assets/AssetTable";
import { Plus, Download, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AssetsPage() {
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddAsset = (data: any) => {
    console.log('New Asset:', data);
    setShowForm(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-8">
        <div className="text-left">
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            Assets Inventory
          </h1>
          <p className="text-[#86868B]">
            Manage, track and maintain your organization's IT assets.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#D2D2D7] bg-white rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm active:scale-95">
            <Download className="w-4 h-4" />
            <span>Export Inventory</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2 shadow-md shadow-primary/20">
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      <AssetTable />

      {/* Asset Form Modal */}
      <AnimatePresence>
        {showForm && (
          <AssetForm
            onClose={() => setShowForm(false)}
            onSubmit={handleAddAsset}
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
              <p className="font-bold text-sm">Asset Created Successfully</p>
              <p className="text-xs text-gray-400 font-medium">
                The inventory has been updated accordingly.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}
