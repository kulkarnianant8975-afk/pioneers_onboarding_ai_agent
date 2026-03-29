import React from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Bell, Shield, Database, Globe, User } from 'lucide-react';

export default function Settings({ clients }: any) {
  const sections = [
    { id: 'profile', label: 'Profile Settings', icon: User, description: 'Manage your personal information and preferences.' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Configure how you receive alerts and updates.' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Update your password and security settings.' },
    { id: 'database', label: 'Database', icon: Database, description: 'Manage your data and database connections.' },
    { id: 'integrations', label: 'Integrations', icon: Globe, description: 'Connect with third-party services and APIs.' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-[40px] p-10 border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-6 mb-10">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
            <SettingsIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
            <p className="text-zinc-500">Manage your application configuration and preferences.</p>
          </div>
        </div>

        <div className="space-y-4">
          {sections.map((section, i) => (
            <motion.button
              key={section.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="w-full flex items-center gap-6 p-6 rounded-[24px] border border-zinc-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group text-left"
            >
              <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                <section.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-zinc-900">{section.label}</h4>
                <p className="text-sm text-zinc-500">{section.description}</p>
              </div>
              <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                <Globe className="w-5 h-5" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 rounded-[40px] p-10 text-white overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2">System Information</h3>
          <div className="grid grid-cols-2 gap-8 mt-6">
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Version</p>
              <p className="text-sm font-medium text-zinc-300">v1.0.4-stable</p>
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Environment</p>
              <p className="text-sm font-medium text-zinc-300">Production</p>
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Last Update</p>
              <p className="text-sm font-medium text-zinc-300">March 27, 2026</p>
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">System Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-sm font-medium text-emerald-400">All systems operational</p>
              </div>
            </div>
          </div>
        </div>
        <SettingsIcon className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
      </div>
    </div>
  );
}
