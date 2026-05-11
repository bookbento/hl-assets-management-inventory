"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import {
  User,
  Bell,
  Shield,
  Globe,
  Database,
  Smartphone,
  ChevronRight,
  Monitor,
} from "lucide-react";
import { motion } from "framer-motion";

const settingsSections = [
  {
    title: "Account",
    items: [
      {
        id: "profile",
        icon: User,
        label: "Profile Information",
        desc: "Manage your name, email, and avatar",
      },
      {
        id: "security",
        icon: Shield,
        label: "Security & Access",
        desc: "Password, 2FA, and login history",
      },
      {
        id: "notifications",
        icon: Bell,
        label: "Notifications",
        desc: "Email alerts and system updates",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        id: "integration",
        icon: Globe,
        label: "API & Integrations",
        desc: "Connect Slack, Jira, and other tools",
      },
      {
        id: "data",
        icon: Database,
        label: "Data Management",
        desc: "Export backups and audit logs",
      },
      {
        id: "devices",
        icon: Smartphone,
        label: "Mobile App Settings",
        desc: "Manage registered tracking devices",
      },
    ],
  },
];

export default function SettingsPage() {
  return (
    <DashboardShell>
      <div className="mb-10 text-left">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-[var(--muted-foreground)]">
          Configure your workspace and personal preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {settingsSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-[0.2em] px-2">
                {section.title}
              </h3>
              <div className="apple-card overflow-hidden divide-y divide-[var(--border)] bg-[var(--surface)]">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    className="w-full flex items-center justify-between p-5 hover:bg-[var(--surface-muted)] transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--surface-soft)] flex items-center justify-center text-[var(--foreground)] group-hover:scale-110 transition-transform">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-[var(--foreground)] leading-snug">
                          {item.label}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)] font-medium mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--border)] group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6 text-left">
          <div className="apple-card p-6 bg-primary text-white border-0 shadow-xl shadow-primary/20">
            <h4 className="font-bold text-lg mb-2">Enterprise Plan</h4>
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-80 mb-4">
              Current Subscription
            </div>
            <div className="flex items-center justify-between py-4 border-y border-white/20 mb-6">
              <div>
                <p className="text-3xl font-bold">$499</p>
                <p className="text-[10px] uppercase font-bold opacity-70">
                  Per Month / Billed Annually
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Monitor className="w-6 h-6" />
              </div>
            </div>
            <button className="w-full py-3 bg-white text-primary font-bold rounded-xl text-sm transition-transform active:scale-95">
              Manage Billing
            </button>
          </div>

          <div className="apple-card p-6 text-center bg-[var(--surface)]">
            <div className="w-20 h-20 rounded-full bg-[var(--surface-soft)] mx-auto mb-4 border border-[var(--border)] flex items-center justify-center">
              <User className="w-10 h-10 text-gray-300" />
            </div>
            <h4 className="font-bold text-lg leading-none">Admin User</h4>
            <p className="text-xs text-[var(--muted-foreground)] font-bold uppercase mt-2 mb-6">
              Administrator
            </p>
            <div className="pt-6 border-t border-[var(--border)] space-y-3">
              <button className="w-full py-2 bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--foreground)] text-sm font-bold rounded-lg hover:bg-[var(--surface-muted)] transition-colors">
                View Public Profile
              </button>
              <p className="text-[10px] text-[var(--muted-foreground)] font-medium italic">
                Member since January 2024
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
