import React from 'react';
import { motion } from 'motion/react';
import { Users, FileText, CheckCircle, Clock, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Client } from '../types';

interface DashboardProps {
  clients: Client[];
  onViewClient: (client: Client) => void;
  user?: any;
  googleTokens?: any;
  notionTokens?: any;
}

export default function Dashboard({ clients, onViewClient, user, googleTokens, notionTokens }: DashboardProps) {
  const stats = [
    { label: 'Total Clients', value: clients.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Projects', value: clients.filter(c => c.status === 'active').length, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Onboarding', value: clients.filter(c => c.status === 'onboarding').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Completed', value: clients.filter(c => c.status === 'completed').length, icon: CheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[32px] border border-zinc-200 shadow-sm"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900">Recent Clients</h3>
          <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50">
                <th className="px-8 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Client</th>
                <th className="px-8 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Package</th>
                <th className="px-8 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Created</th>
                <th className="px-8 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {clients.slice(0, 5).map((client) => (
                <tr key={client.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center font-bold text-zinc-600">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900">{client.name}</p>
                        <p className="text-xs text-zinc-500">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      client.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      client.status === 'onboarding' ? 'bg-amber-100 text-amber-700' :
                      'bg-zinc-100 text-zinc-600'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm text-zinc-600 font-medium">
                    {client.packageName || 'N/A'}
                  </td>
                  <td className="px-8 py-5 text-sm text-zinc-500">
                    {client.createdAt?.toDate ? client.createdAt.toDate().toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => onViewClient(client)}
                      className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ArrowUpRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-zinc-500 italic">
                    No clients found. Add your first client to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
