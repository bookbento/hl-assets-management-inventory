"use client";

import * as React from "react";
import { Suspense } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import { Loader2, Pencil, Trash2, CheckCircle, Image as ImageIcon, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { AssetStatus, AssetCategory } from "@/lib/mockups/types";
import { cn } from "@/lib/mockups/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAssets, deleteAsset, updateAsset, getEmployees, assignAsset, unassignAsset } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/config";
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
  imageUrl?: string | null;
  assignedTo?: string | null;
  purchaseDate?: string | Date | null;
  warrantyExpiry?: string | Date | null;
  user?: { name?: string | null } | null;
  employeeAssets?: any[];
};

type AssetsResponse = {
  data: AssetRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const statusColors = {
  [AssetStatus.AVAILABLE]: "bg-green-50 text-green-600 border-green-200",
  [AssetStatus.IN_USE]: "bg-blue-50 text-blue-600 border-blue-100",
  [AssetStatus.MAINTENANCE]: "bg-orange-50 text-orange-600 border-orange-100",
  [AssetStatus.RETIRED]: "bg-red-50 text-red-600 border-red-200",
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




function AssetTableContent() {
  const searchParams = useSearchParams();
  const search = searchParams?.get("search") || "";
  const queryClient = useQueryClient();

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const [page, setPage] = React.useState(1);
  const limit = 10;

  const [notification, setNotification] = React.useState<{ title: string; message: string } | null>(null);
  const [editingAsset, setEditingAsset] = React.useState<AssetRow | null>(null);
  const [formInitialData, setFormInitialData] = React.useState<Partial<AssetFormValues> | null>(null);

  // --- Delete Logic ---
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

  const assignMutation = useMutation({
    mutationFn: assignAsset,
    onSuccess: () => {
      toast.success("Asset assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assets-summary"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to assign asset");
    },
  });

  const unassignMutation = useMutation({
    mutationFn: unassignAsset,
    onSuccess: () => {
      toast.success("Asset unassigned successfully");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assets-summary"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to unassign asset");
    },
  });

  const handleAssignmentChange = async (assetId: string, currentEmployeeId: string | null, newEmployeeId: string) => {
    try {
      if (currentEmployeeId) {
        await unassignMutation.mutateAsync({ assetId });
      }
      if (newEmployeeId) {
        await assignMutation.mutateAsync({ employeeId: newEmployeeId, assetId });
      }
    } catch (e) {
      // errors handled in mutations
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
    const currentAssignment = asset.employeeAssets?.[0];
    const formattedData: Partial<AssetFormValues> & { imageUrl?: string | null } = {
      name: asset.name,
      serialNumber: asset.serialNumber,
      category: asset.category as AssetFormValues["category"],
      status: asset.status as AssetFormValues["status"],
      assignedTo: currentAssignment?.employeeId || "",
      imageUrl: asset.imageUrl ?? undefined,
      // Ensure dates are in YYYY-MM-DD format for input type="date"
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
          <div className="w-11 h-11 rounded-md border border-[var(--border)] bg-[var(--surface-soft)] overflow-hidden shrink-0 flex items-center justify-center">
            {row.original.imageUrl ? (
              <img
                src={resolveMediaUrl(row.original.imageUrl) || undefined}
                alt={row.getValue("name")}
                className="h-full w-full object-contain"
              />
            ) : (
              <ImageIcon className="w-5 h-5 text-[var(--muted-foreground)]" />
            )}
          </div>
          <div className="text-left">
            <div className="font-bold text-[#1D1D1F] text-sm">
              {row.getValue("name")}
            </div>
            <div className="text-[10px] text-[#86868B] uppercase tracking-wider font-bold">
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
          <span className="text-sm font-medium text-[#424245]">
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
              statusColors[status] || "bg-gray-50 text-gray-600 border-gray-200",
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
        const currentAssignment = row.original.employeeAssets?.[0];
        const userName = currentAssignment?.employee?.name || "—";

        return <div className="text-sm text-[#424245]">{userName}</div>;
      },
    },
    {
      accessorKey: "warrantyExpiry",
      header: "Warranty",
      cell: ({ row }) => {
        const date = row.getValue("warrantyExpiry") as string;
        return (
          <span className="text-sm text-[#86868B] font-medium">
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
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row.original);
            }}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-[#86868B] hover:text-primary"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.original.id);
            }}
            disabled={deleteMutation.isPending}
            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-[#86868B] hover:text-red-500 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ], [deleteMutation.isPending, employees, assignMutation.isPending, unassignMutation.isPending]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  
  const sortBy = sorting.length > 0 ? sorting[0].id : undefined;
  const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : undefined;

  const { data, isLoading, error } = useQuery<AssetsResponse>({
    queryKey: ["assets", { page, limit, search, sortBy, sortOrder }],
    queryFn: async () => (await getAssets({ page, limit, search, sortBy, sortOrder })) as unknown as AssetsResponse,
  });

  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    manualPagination: true,
    manualSorting: true,
  });

  if (isLoading) {
    return (
      <div className="apple-card overflow-hidden flex-1 flex flex-col items-center justify-center min-h-[400px] bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-[#86868B]">Loading assets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="apple-card overflow-hidden flex-1 flex flex-col items-center justify-center min-h-[400px] bg-white">
        <p className="text-sm text-red-500">
          Error loading assets. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="apple-card overflow-hidden flex-1 flex flex-col min-h-0 bg-white">
      <div className="p-5 border-b border-[#D2D2D7] flex items-center justify-between">
        <h4 className="font-bold text-[#1D1D1F]">Recent Assets</h4>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50 border-b border-[#D2D2D7]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort() && header.id !== 'actions';
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "text-left px-5 py-3 text-[11px] font-bold uppercase tracking-tight text-[#86868B]",
                        canSort && "cursor-pointer group hover:bg-gray-100 transition-colors"
                      )}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className={cn("flex items-center gap-1.5", header.id === 'actions' && "justify-end")}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {canSort && (
                          <span className="inline-flex">
                            {{
                              asc: <ChevronUp className="w-3.5 h-3.5" />,
                              desc: <ChevronDown className="w-3.5 h-3.5" />,
                            }[header.column.getIsSorted() as string] ?? (
                              <ArrowUpDown className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 transition-opacity" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[#D2D2D7]">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => handleEdit(row.original)}
                className="hover:bg-gray-50 transition-colors cursor-pointer group"
              >
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
      <div className="p-4 border-t border-[#D2D2D7] flex items-center justify-between mt-auto">
        <div className="text-[11px] text-[#86868B] font-medium">
          Showing{" "}
          <span className="font-bold text-[#1D1D1F]">
            {table.getRowModel().rows.length}
          </span>{" "}
          of{" "}
          <span className="font-bold text-[#1D1D1F]">{data?.total || 0}</span>{" "}
          assets
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((old) => Math.max(old - 1, 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center border border-[#D2D2D7] rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors text-sm"
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
            className="w-8 h-8 flex items-center justify-center border border-[#D2D2D7] rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors text-sm"
          >
            ›
          </button>
        </div>
      </div>
      {editingAsset && (
        <AssetForm
          title="Edit Asset"
          initialData={formInitialData || undefined}
          employees={employees}
          onSubmit={async (data) => {
            const formattedData = {
              ...data,
              purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : null,
              warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry).toISOString() : null,
            };

            // Handle assignment change if any
            if (data.assignedTo !== formInitialData?.assignedTo) {
              await handleAssignmentChange(editingAsset.id, formInitialData?.assignedTo || null, data.assignedTo || "");
            }

            updateMutation.mutate({ id: editingAsset.id, data: formattedData as any });
          }}
          onClose={() => {
            setEditingAsset(null);
            setFormInitialData(null);
          }}
          isModal={true}
        />
      )}
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
    </div>
  );
}

export function AssetTable() {
  return (
    <Suspense fallback={<div className="apple-card min-h-[400px] bg-white" />}>
      <AssetTableContent />
    </Suspense>
  );
}
