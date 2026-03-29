import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Loader2, AlertCircle, ArrowRight, Sparkles, FileText, Layout, Mail, Calendar } from 'lucide-react';
import { OnboardingStep, Client } from '../types';

interface OnboardingFlowProps {
  client: Client;
  onUpdate: (data: Partial<Client>) => Promise<void>;
  googleTokens?: any;
  notionTokens?: any;
  onComplete?: () => void;
}

export default function OnboardingFlow({ client, onUpdate, googleTokens, notionTokens, onComplete }: OnboardingFlowProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const steps: OnboardingStep[] = [
    { id: '1', title: 'Brand Assets', description: 'Collect logos, colors, and brand guidelines.', status: client.currentStep! > 0 ? 'completed' : 'pending' },
    { id: '2', title: 'Notion Workspace', description: 'Set up dedicated client dashboard in Notion.', status: client.currentStep! > 1 ? 'completed' : 'pending' },
    { id: '3', title: 'Contract Generation', description: 'Generate and send service agreement for signing.', status: client.currentStep! > 2 ? 'completed' : 'pending' },
    { id: '4', title: 'Kickoff Meeting', description: 'Schedule and prepare for the project kickoff.', status: client.currentStep! > 3 ? 'completed' : 'pending' },
  ];

  const handleNextStep = async () => {
    setIsProcessing(true);
    try {
      await onUpdate({ currentStep: (client.currentStep || 0) + 1 });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-[40px] p-10 border border-zinc-200 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Onboarding Flow</h2>
              <p className="text-zinc-500">Managing onboarding for <span className="font-bold text-zinc-900">{client.name}</span></p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Progress</p>
            <p className="text-2xl font-black text-indigo-600">{(client.currentStep || 0) / steps.length * 100}%</p>
          </div>
        </div>

        <div className="space-y-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-[28px] border transition-all flex items-center gap-6 ${
                step.status === 'completed' 
                  ? 'bg-emerald-50/30 border-emerald-100' 
                  : i === client.currentStep 
                    ? 'bg-white border-indigo-200 shadow-lg shadow-indigo-50 ring-1 ring-indigo-50' 
                    : 'bg-zinc-50/50 border-zinc-100 opacity-60'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                step.status === 'completed' 
                  ? 'bg-emerald-100 text-emerald-600' 
                  : i === client.currentStep 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                    : 'bg-zinc-100 text-zinc-400'
              }`}>
                {step.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <h4 className={`font-bold ${step.status === 'completed' ? 'text-emerald-900' : 'text-zinc-900'}`}>{step.title}</h4>
                <p className="text-sm text-zinc-500">{step.description}</p>
              </div>
              {i === client.currentStep && (
                <button
                  onClick={handleNextStep}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  Complete Step
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400">
            <Layout className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-zinc-900">Notion Page</h4>
          <p className="text-xs text-zinc-500">Dedicated workspace for project tracking.</p>
          <button className="mt-2 text-xs font-bold text-indigo-600 hover:underline">Open Workspace</button>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-zinc-900">Contract</h4>
          <p className="text-xs text-zinc-500">Service agreement and payment terms.</p>
          <button className="mt-2 text-xs font-bold text-indigo-600 hover:underline">View Agreement</button>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-zinc-900">Kickoff</h4>
          <p className="text-xs text-zinc-500">Scheduled meeting for project start.</p>
          <button className="mt-2 text-xs font-bold text-indigo-600 hover:underline">Schedule Now</button>
        </div>
      </div>
    </div>
  );
}
