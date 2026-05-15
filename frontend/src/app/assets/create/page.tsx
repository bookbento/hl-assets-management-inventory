'use client';
// frontend/src/app/assets/create/page.tsx
import AssetForm from '@/components/assets/AssetForm';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAsset } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function CreateAssetPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-summary'] });
      toast.success('Asset created successfully');
      router.push('/assets');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create asset');
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

  return (
    <DashboardShell>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Asset</h1>
        <Card className="border-none shadow-apple-sm">
          <CardHeader>
            <CardTitle>Asset Details</CardTitle>
          </CardHeader>
          <CardContent>
            <AssetForm 
              onSubmit={handleSubmit} 
              onClose={handleCancel} 
              isModal={false}
              title="Add New Asset"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
