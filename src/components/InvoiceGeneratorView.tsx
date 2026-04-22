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
    agreedRate: 15000,
    durationType: 'monthly',
    duration: 1,
    monthsPayingNow: 1,
    startMonth: 1,
    discount: 0,
    amountPaid: 0,
    amountRemaining: 15000,
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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-white/80 backdrop-blur-3xl rounded-[40px] p-6 md:p-14 border border-zinc-200/50 shadow-premium relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 mb-10 text-center md:text-left">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-orange-50 to-orange-100 rounded-[24px] md:rounded-[32px] flex items-center justify-center text-orange-600 shadow-sm border border-orange-200/50 shrink-0 relative overflow-hidden group/icon">
            <span className="font-syne font-black text-2xl md:text-4xl relative z-10 transition-transform group-hover/icon:scale-110">P</span>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-syne font-bold text-zinc-900 tracking-tight mb-2 uppercase">Invoice Service</h2>
            <p className="text-zinc-500 text-sm md:text-base font-medium">Generate high-fidelity, branded payment requests for your clients.</p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setIsEditorOpen(true)}
            className="flex flex-col items-center justify-center p-10 py-16 rounded-[32px] border-2 border-dashed border-zinc-200 hover:border-orange-400 hover:bg-orange-50/50 hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-300 group bg-white/50"
          >
            <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-orange-600 group-hover:shadow-glow-orange group-hover:scale-110 transition-all duration-300 mb-5">
              <Plus className="w-8 h-8 text-zinc-400 group-hover:text-white transition-colors" />
            </div>
            <span className="text-xl md:text-2xl font-syne font-bold text-zinc-900 text-center mb-2 tracking-tight">Create Payment Invoice</span>
            <span className="text-sm md:text-base text-zinc-500 font-medium text-center px-4">Automatic billing, multi-month duration, and live preview</span>
          </button>

          <div className="bg-orange-950 p-10 py-12 rounded-[40px] flex flex-col gap-8 border border-orange-900/50 relative overflow-hidden shadow-premium">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-900/50 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-900/80 rounded-xl shadow-inner border border-orange-800/50 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold font-syne tracking-tight text-white">Original Design</h3>
            </div>
            
            <ul className="relative z-10 space-y-5">
              <li className="flex items-center gap-4 text-orange-200 text-sm md:text-base font-medium">
                <div className="w-6 h-6 bg-orange-900/50 rounded-full flex items-center justify-center shrink-0 border border-orange-800/50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
                </div>
                Custom 'Letterhead' PDF generation
              </li>
              <li className="flex items-center gap-4 text-orange-200 text-sm md:text-base font-medium">
                <div className="w-6 h-6 bg-orange-900/50 rounded-full flex items-center justify-center shrink-0 border border-orange-800/50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
                </div>
                Live Preview Editor (WYSIWYG)
              </li>
              <li className="flex items-center gap-4 text-orange-200 text-sm md:text-base font-medium">
                <div className="w-6 h-6 bg-orange-900/50 rounded-full flex items-center justify-center shrink-0 border border-orange-800/50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
                </div>
                Unified Pioneers Digital Brand Palette
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

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
