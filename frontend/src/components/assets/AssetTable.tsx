'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { 
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Asset, AssetStatus } from '@/lib/mockups/types';
import { MOCK_ASSETS } from '@/lib/mockups/mockup-data';
import { cn } from '@/lib/mockups/utils';

const statusColors = {
  [AssetStatus.AVAILABLE]: 'bg-primary/10 text-primary border-primary/20',
  [AssetStatus.IN_USE]: 'bg-blue-50 text-blue-600 border-blue-100',
  [AssetStatus.MAINTENANCE]: 'bg-orange-50 text-orange-600 border-orange-100',
  [AssetStatus.RETIRED]: 'bg-gray-100 text-gray-600 border-gray-200',
};

export const columns: ColumnDef<Asset>[] = [
  {
    accessorKey: 'name',
    header: 'Asset Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="text-left">
          <div className="font-bold text-[#1D1D1F] text-sm">{row.getValue('name')}</div>
          <div className="text-[10px] text-[#86868B] uppercase tracking-wider font-bold">SN: {row.original.serialNumber}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => <span className="text-sm font-medium text-[#424245]">{row.getValue('category')}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as AssetStatus;
      return (
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight border",
          statusColors[status]
        )}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: 'assignedTo',
    header: 'Assigned To',
    cell: ({ row }) => (
      <div className="text-sm text-[#424245]">
        {row.getValue('assignedTo') || '—'}
      </div>
    ),
  },
  {
    accessorKey: 'warrantyExpiry',
    header: 'Warranty',
    cell: ({ row }) => <span className="text-sm text-[#86868B] font-medium">{row.getValue('warrantyExpiry')}</span>,
  },
];

export function AssetTable() {
  const table = useReactTable({
    data: MOCK_ASSETS,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

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
                  <th key={header.id} className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-tight text-[#86868B]">
                    {flexRender(header.column.columnDef.header, header.getContext())}
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
          Showing <span className="font-bold text-[#1D1D1F]">{table.getRowModel().rows.length}</span> of <span className="font-bold text-[#1D1D1F]">{MOCK_ASSETS.length}</span> assets
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="w-8 h-8 flex items-center justify-center border border-[#D2D2D7] rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors text-sm"
          >
            ‹
          </button>
          <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg font-bold text-xs">
            1
          </div>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
             className="w-8 h-8 flex items-center justify-center border border-[#D2D2D7] rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors text-sm"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
