'use client';
// frontend/src/app/assets/page.tsx
import AssetTable from '@/components/AssetTable';

export default function AssetsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
      <AssetTable onEdit={() => {}} />
    </div>
  );
}
