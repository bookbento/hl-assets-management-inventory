// frontend/src/app/assets/page.tsx
"use client";

import { useState } from "react";
import { AssetForm } from "@/components/assets/AssetForm";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AssetTable } from "@/components/assets/AssetTable";
import { Plus, FileUp, CheckCircle, Loader2, Image as ImageIcon, Package, Barcode, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAsset, getAssets } from "@/lib/api";
import { toast } from "react-hot-toast";
import Papa from "papaparse";

export default function AssetsPage() {
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const queryClient = useQueryClient();
  const { data: featuredAssets, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ["asset-profile"],
    queryFn: () => getAssets({ limit: 1 }),
  });

  const mutation = useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["asset-summary"] });
      setShowForm(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create asset");
    },
  });

  const handleAddAsset = (data: any) => {
    // Ensure dates are correctly formatted for the API
    const assetData = {
      ...data,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : null,
      warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry).toISOString() : null,
    };
    mutation.mutate(assetData);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      // Fetch all assets for export (using a high limit)
      const response = await getAssets({ limit: 1000 });
      const assets = response.data;

      const csvData = assets.map((asset: any) => ({
        ID: asset.id,
        Name: asset.name,
        Category: asset.category,
        Status: asset.status,
        Serial: asset.serialNumber,
        Model: asset.model,
        Location: asset.location,
        "Purchase Date": asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "-",
        Price: asset.purchasePrice || 0,
        Warranty: asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : "-",
      }));

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Inventory exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export inventory");
    } finally {
      setIsExporting(false);
    }
  };

  const featuredAsset = featuredAssets?.data?.[0];

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
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 border border-[#D2D2D7] bg-white rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
            <span>{isExporting ? "Exporting..." : "Export Inventory"}</span>
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
