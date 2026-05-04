'use client';

import { AssetStats } from '@/lib/mockups/types';
import { Package, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/mockups/utils';

interface SummaryCardsProps {
  stats: AssetStats;
}

export function SummaryCards({ stats }: SummaryCardsProps) {
  const items = [
    { label: 'Total Assets', value: stats.total, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'In Use', value: stats.inUse, icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Available', value: stats.available, icon: RefreshCw, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Maintenance', value: stats.maintenance, icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <>
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="apple-card p-5 flex flex-col justify-between col-span-1 text-left"
        >
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">{item.label}</span>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-3xl font-bold tracking-tight">{item.value.toLocaleString()}</h3>
              <p className={cn(
                "text-[10px] font-bold mt-1",
                item.label === 'Available' ? "text-primary": "text-[#86868B]"
              )}>
                {item.label === 'Total Assets' ? "+12% from last month" : 
                 item.label === 'In Use' ? "81.1% Utilization" : 
                 item.label === 'Available' ? "Ready for deployment" : 
                 "4 items pending"}
              </p>
            </div>
            <div className={cn("p-2.5 rounded-xl", item.bg, item.color)}>
              <item.icon className="w-5 h-5" />
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
}
