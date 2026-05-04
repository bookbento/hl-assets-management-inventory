// frontend/src/components/ChartComponent.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getAssetSummary } from '@/lib/api';

// Mock data structure for chart
interface ChartData {
  category: string;
  count: number;
}

export default function ChartComponent() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['assetSummary'],
    queryFn: getAssetSummary,
  });

  const chartData: ChartData[] = data?.categoryDistribution.map((item: any) => ({
    category: item.category
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    count: item._count.id,
  })) || [];

  if (isLoading) return <div className="mt-6"><Card><CardContent><p>Loading chart...</p></CardContent></Card></div>;
  if (isError) return <div className="mt-6"><Card><CardContent><p>Error loading chart.</p></CardContent></Card></div>;

  return (
    <Card className="mt-6 w-full h-[400px]">
      <CardHeader>
        <CardTitle>Asset Distribution by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#00A86B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
