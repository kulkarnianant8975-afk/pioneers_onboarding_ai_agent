import React, { useState } from 'react';
import { CreditCard, Plus, FileText, Download, Clock, CheckCircle2, AlertCircle, Sparkles, ChevronRight, LayoutDashboard, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InvoiceData } from '../types';
import InvoiceEditor from './InvoiceEditor';
import { InvoiceGenerator } from '../../invoiceGenerator';

export default function InvoiceGeneratorView() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const defaultInvoiceData: InvoiceData = {
    invoiceNumber: `PDMA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    invoiceDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    clientName: '',
    clientAddress: '',
    clientEmail: '',
    clientPhone: '',
    agencyName: 'Pioneers',
    agencyAddress: 'Chintamani Maharaj Mandir, Vasmat Road\nAbove Wellness Medical, Parbhani-431401',
    agencyEmail: 'pdmasolutions@gmail.com',
    agencyCEO: 'Madhav Sharma-CEO',
    agencyPhone: '+91 00000 00000',
    items: [],
    subtotal: 15000,
    total: 15000,
    pkgName: 'Premium',
    serviceCategory: 'package',
    monthlyRate: 15000,
    durationType: 'monthly',
    duration: 1,
    monthsPayingNow: 1,
    startMonth: 1,
    discount: 0,
    paymentMethod: 'upi',
    paymentDetails: {
      upiApp: 'GPay / PhonePe',
      upiTxn: ''
    },
    bankName: 'HDFC Bank',
    accountNumber: '50100XXXXXXXXX',
    ifscCode: 'HDFC000XXXX',
    upiId: 'pdmasolutions@upi',
    showBankDetails: true,
    status: 'unpaid',
    notes: 'Thank you for choosing Pioneers! Please make payment by the due date. For billing queries, contact pdmasolutions@gmail.com.'
  };

  const handleGenerateInvoice = async (data: InvoiceData) => {
    setIsGenerating(true);
    try {
      const generator = new InvoiceGenerator();
      const doc = await generator.generate(data);
      doc.save(`Invoice_${data.invoiceNumber}.pdf`);
      setIsEditorOpen(false);
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Hero Section */}
      <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-14 border border-zinc-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-blue-100/50 transition-colors" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-[#0f172a] rounded-[24px] md:rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-blue-100 shrink-0 border border-zinc-800 relative overflow-hidden group/icon">
            <div className="absolute inset-0 bg-blue-600/20 translate-y-full group-hover/icon:translate-y-0 transition-transform duration-500" />
            <span className="font-syne font-black text-2xl md:text-4xl relative z-10 transition-transform group-hover/icon:scale-110">P</span>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-4xl font-black text-[#0f172a] tracking-tight mb-2 md:mb-4 font-syne uppercase">Invoice Service</h2>
            <p className="text-zinc-500 text-sm md:text-lg max-w-xl font-medium">Generate high-fidelity, branded payment requests for your clients.</p>
          </div>
        </div>

        <div className="mt-14 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => setIsEditorOpen(true)}
              className="bg-[#0f172a] hover:bg-[#1e293b] text-white p-10 rounded-[40px] flex flex-col items-center gap-6 transition-all border border-zinc-800 active:scale-[0.98] group shadow-2xl shadow-zinc-200"
            >
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-[#22d3ee]" />
              </div>
              <div className="text-center">
                <span className="text-xl font-bold block mb-1 font-syne">Create Payment Invoice</span>
                <span className="text-zinc-500 text-sm font-medium">Automatic billing, multi-month duration, and live preview</span>
              </div>
            </button>

            <div className="bg-zinc-50 p-10 rounded-[40px] flex flex-col gap-8 border border-zinc-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#2563eb]" />
                </div>
                <h3 className="text-lg font-bold font-syne tracking-tight text-[#0f172a]">Original Design</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-zinc-500 text-sm font-medium">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-[#2563eb]" />
                  </div>
                  Custom 'Letterhead' PDF generation
                </li>
                <li className="flex items-center gap-3 text-zinc-500 text-sm font-medium">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-[#2563eb]" />
                  </div>
                  Live Preview Editor (What you see is what you get)
                </li>
                <li className="flex items-center gap-3 text-zinc-500 text-sm font-medium">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-[#2563eb]" />
                  </div>
                  Unified Pioneers Digital Brand Palette
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isEditorOpen && (
          <InvoiceEditor 
            isOpen={isEditorOpen}
            onClose={() => setIsEditorOpen(false)}
            initialData={defaultInvoiceData}
            onSave={handleGenerateInvoice}
          />
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-md z-[200] flex items-center justify-center text-white"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="font-bold tracking-[0.2em] uppercase text-[10px] text-blue-200">Processing Signature PDF...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
