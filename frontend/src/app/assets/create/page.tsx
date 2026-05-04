'use client';
// frontend/src/app/assets/create/page.tsx
import AssetForm from '@/components/AssetForm';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateAssetPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/assets');
  };

  const handleCancel = () => {
    router.push('/assets');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Create New Asset</h1>
      <Card>
        <CardHeader>
          <CardTitle>Asset Details</CardTitle>
        </CardHeader>
        <CardContent>
          <AssetForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  );
}
