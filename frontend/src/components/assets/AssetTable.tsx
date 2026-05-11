"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2, Pencil, Trash2, CheckCircle } from "lucide-react";
import { AssetStatus, AssetCategory } from "@/lib/mockups/types";
import { cn } from "@/lib/mockups/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAssets, deleteAsset, updateAsset } from "@/lib/api";
import { toast } from "react-hot-toast";
import { AssetForm, AssetFormValues } from "./AssetForm";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

type AssetRow = {
  id: string;
  name: string;
  serialNumber: string;
  category: AssetCategory;
  status: AssetStatus;
  assignedTo?: string | null;
  purchaseDate?: string | Date | null;
  warrantyExpiry?: string | Date | null;
  user?: { name?: string | null } | null;
};

type AssetsResponse = {
  data: AssetRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const statusColors = {
  [AssetStatus.AVAILABLE]: "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/20",
  [AssetStatus.IN_USE]: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20",
  [AssetStatus.MAINTENANCE]: "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20",
  [AssetStatus.RETIRED]: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20",
};

const statusLabels = {
  [AssetStatus.AVAILABLE]: "Available",
  [AssetStatus.IN_USE]: "In Use",
  [AssetStatus.MAINTENANCE]: "Maintenance",
  [AssetStatus.RETIRED]: "Retired",
};

const categoryLabels = {
  [AssetCategory.LAPTOP]: "Laptop",
  [AssetCategory.MONITOR]: "Monitor",
  [AssetCategory.PERIPHERAL]: "Peripheral",
  [AssetCategory.NETWORKING]: "Networking",
  [AssetCategory.MOBILE]: "Mobile",
  [AssetCategory.OTHER]: "Other",
};

export function AssetTable() {
  const searchParams = useSearchParams();
  const search = searchParams?.get("search") || "";
  const queryClient = useQueryClient();

  const [page, setPage] = React.useState(1);
  const limit = 10;

  const [notification, setNotification] = React.useState<{ title: string; message: string } | null>(null);
  const [editingAsset, setEditingAsset] = React.useState<AssetRow | null>(null);
  const [formInitialData, setFormInitialData] = React.useState<Partial<AssetFormValues> | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAsset(id),
    onSuccess: () => {
      setNotification({
        title: "Asset Deleted",
        message: "The asset has been removed from inventory."
      });
      setTimeout(() => setNotification(null), 3000);
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: () => {
      toast.error("Failed to delete asset");
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this asset?")) {
      deleteMutation.mutate(id);
    }
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AssetFormValues> }) =>
      updateAsset(id, data as any),
    onSuccess: () => {
      setNotification({
        title: "Asset Updated",
        message: "Changes have been saved successfully."
      });
      setTimeout(() => setNotification(null), 3000);
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      setEditingAsset(null);
      setFormInitialData(null);
    },
    onError: () => {
      toast.error("Failed to update asset");
    },
  });

  const handleEdit = (asset: AssetRow) => {
    const formattedData: Partial<AssetFormValues> = {
      name: asset.name,
      serialNumber: asset.serialNumber,
      category: asset.category as AssetFormValues["category"],
      status: asset.status as AssetFormValues["status"],
      assignedTo: asset.assignedTo ?? undefined,
      purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
      warrantyExpiry: asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toISOString().split('T')[0] : '',
    };
    setFormInitialData(formattedData);
    setEditingAsset(asset);
  };

  const columns = React.useMemo<ColumnDef<AssetRow>[]>(() => [
    {
      accessorKey: "name",
      header: "Asset Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="text-left">
            <div className="font-bold text-[var(--foreground)] text-sm">
              {row.getValue("name")}
            </div>
            <div className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider font-bold">
              SN: {row.original.serialNumber}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.getValue("category") as AssetCategory;
        return (
          <span className="text-sm font-medium text-[var(--foreground)]">
            {categoryLabels[category] || category}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as AssetStatus;
        return (
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight border",
              statusColors[status] || "bg-gray-50 text-gray-600 border-gray-200 dark:bg-white/10 dark:text-gray-300 dark:border-white/10",
            )}
          >
            {statusLabels[status] || status}
          </span>
        );
      },
    },
    {
      accessorKey: "assignedTo",
      header: "Assigned To",
      cell: ({ row }) => {
        // @ts-ignore
        const userName = row.original.user?.name || row.original.assignedTo;
        return <div className="text-sm text-[var(--foreground)]">{userName || "—"}</div>;
      },
    },
    {
      accessorKey: "warrantyExpiry",
      header: "Warranty",
      cell: ({ row }) => {
        const date = row.getValue("warrantyExpiry") as string;
        return (
          <span className="text-sm text-[var(--muted-foreground)] font-medium">
            {date ? new Date(date).toLocaleDateString() : "—"}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-1.5 hover:bg-[var(--surface-muted)] rounded-lg transition-colors text-[var(--muted-foreground)] hover:text-primary"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            disabled={deleteMutation.isPending}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-[var(--muted-foreground)] hover:text-red-500 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ], [deleteMutation.isPending]);

  const { data, isLoading, error } = useQuery<AssetsResponse>({
    queryKey: ["assets", { page, limit, search }],
    queryFn: async () => (await getAssets({ page, limit, search })) as unknown as AssetsResponse,
  });

  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  if (isLoading) {
    return (
      <div className="apple-card overflow-hidden flex-1 flex flex-col items-center justify-center min-h-[400px] bg-[var(--surface)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">Loading assets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="apple-card overflow-hidden flex-1 flex flex-col items-center justify-center min-h-[400px] bg-[var(--surface)]">
        <p className="text-sm text-red-500">
          Error loading assets. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="apple-card overflow-hidden flex-1 flex flex-col min-h-0 bg-[var(--surface)]">
      <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
        <h4 className="font-bold text-[var(--foreground)]">Recent Assets</h4>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-[var(--surface-muted)] rounded-md text-[11px] font-bold uppercase tracking-tight text-[var(--foreground)] hover:bg-[var(--surface-soft)] transition-colors">
            Filter
          </button>
          <button className="px-3 py-1.5 bg-[var(--surface-muted)] rounded-md text-[11px] font-bold uppercase tracking-tight text-[var(--foreground)] hover:bg-[var(--surface-soft)] transition-colors">
            Export
          </button>
        </div>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-soft)] border-b border-[var(--border)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-tight text-[var(--muted-foreground)]"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-[var(--surface-soft)] transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-5 py-3.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-[var(--border)] flex items-center justify-between mt-auto">
        <div className="text-[11px] text-[var(--muted-foreground)] font-medium">
          Showing{" "}
          <span className="font-bold text-[var(--foreground)]">
            {table.getRowModel().rows.length}
          </span>{" "}
          of{" "}
          <span className="font-bold text-[var(--foreground)]">{data?.total || 0}</span>{" "}
          assets
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((old) => Math.max(old - 1, 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center border border-[var(--border)] rounded-lg hover:bg-[var(--surface-muted)] disabled:opacity-30 transition-colors text-sm"
          >
            ‹
          </button>
          <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg font-bold text-xs">
            {page}
          </div>
          <button
            onClick={() =>
              setPage((old) =>
                data?.totalPages && old < data.totalPages ? old + 1 : old,
              )
            }
            disabled={!data || page >= (data.totalPages || 1)}
            className="w-8 h-8 flex items-center justify-center border border-[var(--border)] rounded-lg hover:bg-[var(--surface-muted)] disabled:opacity-30 transition-colors text-sm"
          >
            ›
          </button>
        </div>
      </div>
      {editingAsset && (
        <AssetForm
          title="Edit Asset"
          initialData={formInitialData || undefined}
          onSubmit={(data) => {
            updateMutation.mutate({ id: editingAsset.id, data });
          }}
          onClose={() => {
            setEditingAsset(null);
            setFormInitialData(null);
          }}
          isModal={true}
        />
      )}
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
    </div>
  );
}
