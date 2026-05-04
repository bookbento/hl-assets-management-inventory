'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Database, 
  Smartphone,
  ChevronRight,
  Monitor
} from 'lucide-react';
import { motion } from 'framer-motion';

const settingsSections = [
  {
    title: 'Account',
    items: [
      { id: 'profile', icon: User, label: 'Profile Information', desc: 'Manage your name, email, and avatar' },
      { id: 'security', icon: Shield, label: 'Security & Access', desc: 'Password, 2FA, and login history' },
      { id: 'notifications', icon: Bell, label: 'Notifications', desc: 'Email alerts and system updates' },
    ]
  },
  {
    title: 'System',
    items: [
      { id: 'integration', icon: Globe, label: 'API & Integrations', desc: 'Connect Slack, Jira, and other tools' },
      { id: 'data', icon: Database, label: 'Data Management', desc: 'Export backups and audit logs' },
      { id: 'devices', icon: Smartphone, label: 'Mobile App Settings', desc: 'Manage registered tracking devices' },
    ]
  }
];

export default function SettingsPage() {
  return (
    <DashboardShell>
      <div className="mb-10 text-left">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-[#86868B]">Configure your workspace and personal preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {settingsSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-xs font-bold text-[#86868B] uppercase tracking-[0.2em] px-2">{section.title}</h3>
              <div className="apple-card overflow-hidden divide-y divide-[#D2D2D7] bg-white">
                {section.items.map((item) => (
                  <button 
                    key={item.id}
                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#424245] group-hover:scale-110 transition-transform">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1D1D1F] leading-snug">{item.label}</p>
                        <p className="text-xs text-[#86868B] font-medium mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#D2D2D7] group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6 text-left">
          <div className="apple-card p-6 bg-primary text-white border-0 shadow-xl shadow-primary/20">
            <h4 className="font-bold text-lg mb-2">Enterprise Plan</h4>
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-80 mb-4">Current Subscription</div>
            <div className="flex items-center justify-between py-4 border-y border-white/20 mb-6">
              <div>
                <p className="text-3xl font-bold">$499</p>
                <p className="text-[10px] uppercase font-bold opacity-70">Per Month / Billed Annually</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Monitor className="w-6 h-6" />
              </div>
            </div>
            <button className="w-full py-3 bg-white text-primary font-bold rounded-xl text-sm transition-transform active:scale-95">
              Manage Billing
            </button>
          </div>

          <div className="apple-card p-6 text-center bg-white">
            <div className="w-20 h-20 rounded-full bg-gray-100 mx-auto mb-4 border border-[#D2D2D7] flex items-center justify-center">
               <User className="w-10 h-10 text-gray-300" />
            </div>
            <h4 className="font-bold text-lg leading-none">Admin User</h4>
            <p className="text-xs text-[#86868B] font-bold uppercase mt-2 mb-6">Administrator</p>
            <div className="pt-6 border-t border-[#D2D2D7] space-y-3">
              <button className="w-full py-2 bg-gray-50 border border-[#D2D2D7] text-[#424245] text-sm font-bold rounded-lg hover:bg-gray-100 transition-colors">
                View Public Profile
              </button>
              <p className="text-[10px] text-[#86868B] font-medium italic">Member since January 2024</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
