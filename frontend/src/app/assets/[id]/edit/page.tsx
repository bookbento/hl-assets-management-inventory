// frontend/src/app/assets/[id]/edit/page.tsx
'use client';

import AssetForm from '@/components/AssetForm';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getAssetById } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id as string;

  const { data: asset, isLoading, isError } = useQuery({
    queryKey: ['asset', assetId],
    queryFn: () => getAssetById(assetId),
    enabled: !!assetId,
  });

  const handleSuccess = () => {
    router.push('/assets');
  };

  const handleCancel = () => {
    router.push('/assets');
  };

  if (isLoading) return <div>Loading asset...</div>;
  if (isError) return <div>Error loading asset.</div>;
  if (!asset) return <div>Asset not found.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Edit Asset</h1>
      <Card>
        <CardHeader>
          <CardTitle>Asset Details</CardTitle>
        </CardHeader>
        <CardContent>
          <AssetForm asset={asset} onSuccess={handleSuccess} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  );
}
