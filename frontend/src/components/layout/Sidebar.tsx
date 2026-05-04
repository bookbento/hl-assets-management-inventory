// frontend/src/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, Users, Settings, LayoutDashboard, LogOut } from 'lucide-react';
import { cn } from '@/lib/mockups/utils';

const sidebarItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Assets', href: '/assets', icon: Package },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-full bg-white border-r border-[#D2D2D7] flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Package className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-[#1D1D1F]">IT Assets Inventory</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all group",
              pathname === item.href 
                ? "bg-[#1D1D1F]/10 text-[#00A86B]" 
                : "text-[#86868B] hover:bg-gray-100"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-transform group-hover:scale-110",
              pathname === item.href ? "text-primary" : "text-[#86868B]"
            )} />
            <span>{item.name}</span>
            
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-[#D2D2D7]">
        <div className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold text-[#1D1D1F] border border-[#D2D2D7]">AD</div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate text-[#1D1D1F]">Admin User</p>
            <p className="text-[11px] text-[#86868B] truncate font-bold">IT Architect</p>
          </div>
          <LogOut className="w-4 h-4 text-[#86868B] group-hover:text-red-500 transition-colors" />
        </div>
      </div>
    </div>
  );
}
