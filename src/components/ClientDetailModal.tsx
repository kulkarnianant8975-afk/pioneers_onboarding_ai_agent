import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Calendar, FileText, CheckCircle2, Clock, Trash2, ArrowRight } from 'lucide-react';
import { Client } from '../types';

interface ClientDetailModalProps {
  client: Client;
  onClose: () => void;
  onDelete: (id: string) => void;
  onStartOnboarding: (client?: Client) => void;
  googleTokens?: any;
}

export default function ClientDetailModal({ client, onClose, onDelete, onStartOnboarding, googleTokens }: ClientDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-zinc-200"
      >
        <div className="px-10 py-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900">{client.name}</h2>
              <p className="text-zinc-500 text-xs">Client Profile & Details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-10 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Email Address</p>
              <div className="flex items-center gap-2 text-zinc-900 font-bold">
                <Mail className="w-4 h-4 text-zinc-400" />
                {client.email}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</p>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  client.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                  client.status === 'onboarding' ? 'bg-amber-100 text-amber-700' :
                  'bg-zinc-100 text-zinc-600'
                }`}>
                  {client.status}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Created At</p>
              <div className="flex items-center gap-2 text-zinc-900 font-bold">
                <Calendar className="w-4 h-4 text-zinc-400" />
                {client.createdAt?.toDate ? client.createdAt.toDate().toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Package</p>
              <div className="flex items-center gap-2 text-zinc-900 font-bold">
                <FileText className="w-4 h-4 text-zinc-400" />
                {client.packageName || 'Not Assigned'}
              </div>
            </div>
          </div>

          <div className="bg-zinc-50 rounded-[32px] p-8 border border-zinc-100">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Onboarding Progress</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-3 bg-zinc-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                  style={{ width: `${(client.currentStep || 0) / 4 * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-indigo-600">{(client.currentStep || 0) / 4 * 100}%</span>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={() => onStartOnboarding(client)}
              className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-5 h-5" /> Continue Onboarding
            </button>
            <button
              onClick={() => onDelete(client.id)}
              className="px-8 py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" /> Delete Client
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
