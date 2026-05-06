"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2, Pencil, Trash2, } from "lucide-react";
import { Asset, AssetStatus } from "@prisma/client";
import { cn } from "@/lib/mockups/utils";
import { useQuery } from "@tanstack/react-query";
import { getAssets } from "@/lib/api";

const statusColors = {
  [AssetStatus.AVAILABLE]: "bg-primary/10 text-primary border-primary/20",
  [AssetStatus.IN_USE]: "bg-blue-50 text-blue-600 border-blue-100",
  [AssetStatus.MAINTENANCE]: "bg-orange-50 text-orange-600 border-orange-100",
  [AssetStatus.RETIRED]: "bg-gray-100 text-gray-600 border-gray-200",
};

export const columns: ColumnDef<Asset>[] = [
  {
    accessorKey: "name",
    header: "Asset Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
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
    cell: ({ row }) => (
      <span className="text-sm font-medium text-[#424245]">
        {row.getValue("category")}
      </span>
    ),
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
            statusColors[status],
          )}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned To",
    cell: ({ row }) => {
      // @ts-ignore - user is included in the response
      const userName = row.original.user?.name || row.original.assignedTo;
      return <div className="text-sm text-[#424245]">{userName || "—"}</div>;
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
            // onClick={() => onEdit?.(row.original)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-[#86868B] hover:text-primary"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button 
            // onClick={() => onDelete?.(row.original.id)}
            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-[#86868B] hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
];
//  [onEdit, onDelete]

export function AssetTable() {
  const [page, setPage] = React.useState(1);
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["assets", { page, limit }],
    queryFn: () => getAssets({ page, limit }),
  });

  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
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
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-gray-100 rounded-md text-[11px] font-bold uppercase tracking-tight text-[#424245] hover:bg-gray-200 transition-colors">
            Filter
          </button>
          <button className="px-3 py-1.5 bg-gray-100 rounded-md text-[11px] font-bold uppercase tracking-tight text-[#424245] hover:bg-gray-200 transition-colors">
            Export
          </button>
        </div>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50 border-b border-[#D2D2D7]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-tight text-[#86868B]"
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
          <tbody className="divide-y divide-[#D2D2D7]">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
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
    </div>
  );
}
