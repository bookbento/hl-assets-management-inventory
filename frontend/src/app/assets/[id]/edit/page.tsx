// frontend/src/app/assets/[id]/edit/page.tsx
'use client';

import AssetForm from '@/components/assets/AssetForm';
import type { AssetFormValues } from '@/components/assets/AssetForm';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAssetById, updateAsset } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const assetId = params.id as string;

  const { data: asset, isLoading, isError } = useQuery({
    queryKey: ['asset', assetId],
    queryFn: () => getAssetById(assetId),
    enabled: !!assetId,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => updateAsset(assetId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset', assetId] });
      toast.success('Asset updated successfully');
      router.push('/assets');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update asset');
    },
  });

  const handleSubmit = (data: any) => {
    // Ensure dates are correctly formatted for the API
    const assetData = {
      ...data,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : null,
      warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry).toISOString() : null,
    };
    mutation.mutate(assetData);
  };

  const handleCancel = () => {
    router.push('/assets');
  };

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading asset...</div>;
  if (isError) return <div className="text-red-500 text-center py-12">Error loading asset.</div>;
  if (!asset) return <div className="text-gray-500 text-center py-12">Asset not found.</div>;

  // Format dates for the form (YYYY-MM-DD)
  const initialData = {
    name: asset.name,
    serialNumber: asset.serialNumber,
    category: asset.category as AssetFormValues["category"],
    status: asset.status as AssetFormValues["status"],
    purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
    warrantyExpiry: asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toISOString().split('T')[0] : '',
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Asset</h1>
        <Card className="border-none shadow-apple-sm">
          <CardHeader>
            <CardTitle>Asset Details</CardTitle>
          </CardHeader>
          <CardContent>
            <AssetForm 
              initialData={initialData} 
              onSubmit={handleSubmit} 
              onClose={handleCancel}
              isModal={false}
              title="Edit Asset Details"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
