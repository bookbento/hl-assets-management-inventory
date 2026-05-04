// frontend/src/app/page.tsx
'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { SummaryCards } from '@/components/dashboard/Summary';
import { AssetTable } from '@/components/assets/AssetTable';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const stats = {
    total: 32,
    inUse: 20,
    available: 10,
    maintenance: 2,
  };

  return (
    <DashboardShell>
      <div className="grid grid-cols-4 grid-rows-6 gap-6 flex-1">
        {/* Stat Cards - Top Row */}
        <SummaryCards stats={stats} />
        
        {/* Main Content Area - Table (Bento Style) */}
        <div className="col-span-3 row-span-5 flex flex-col min-h-0">
           <AssetTable />
        </div>

        {/* Side Content Area - Category Distribution */}
        <div className="col-span-1 row-span-3 apple-card p-6 flex flex-col bg-white">
          <h4 className="font-bold mb-4 text-[#1D1D1F] text-left">Category Distribution</h4>
          <div className="flex-1 flex flex-col justify-center gap-6">
            {[
              { label: 'Laptops', value: 42, color: 'bg-primary' },
              { label: 'Peripherals', value: 28, color: 'bg-primary/60' },
              { label: 'Monitors', value: 20, color: 'bg-primary/40' },
              { label: 'Others', value: 10, color: 'bg-gray-300' },
            ].map((item) => (
              <div key={item.label} className="space-y-2 text-left">
                <div className="flex justify-between text-xs font-bold text-[#1D1D1F]">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promotion/CTA Card */}
        <div className="col-span-1 row-span-2 bg-gradient-to-br from-primary to-[#008F5B] p-6 rounded-2xl text-white shadow-xl shadow-primary/20 flex flex-col justify-between text-left">
          <div>
            <h4 className="font-bold text-lg leading-tight mb-2">Export Ready Analytics</h4>
            <p className="text-[11px] opacity-80 leading-relaxed">Download your comprehensive asset audit report for Q3 2023.</p>
          </div>
          <button className="w-full py-2.5 bg-white/20 backdrop-blur-md text-sm font-bold rounded-xl hover:bg-white/30 transition-colors border border-white/20">
            Download PDF
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
