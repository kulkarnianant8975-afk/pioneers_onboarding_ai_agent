import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Save, FileText, Settings, CreditCard, ChevronRight, Info, CheckCircle2, AlertCircle, Building, User, Calendar, Wallet } from 'lucide-react';
import { InvoiceData, InvoiceItem } from '../types';

interface InvoiceEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: InvoiceData;
  onSave: (data: InvoiceData) => void;
}

const PACKAGE_OPTIONS = [
  { name: 'Basic', rate: 5000, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'Standard', rate: 8000, color: 'text-amber-600', bg: 'bg-amber-50' },
  { name: 'Premium', rate: 15000, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { name: 'Elite', rate: 25000, color: 'text-purple-600', bg: 'bg-purple-50' },
  { name: 'Custom', rate: 0, color: 'text-zinc-600', bg: 'bg-zinc-50' },
];

export default function InvoiceEditor({ isOpen, onClose, initialData, onSave }: InvoiceEditorProps) {
  const [data, setData] = useState<InvoiceData>(initialData);
  const [activeTab, setActiveTab] = useState<'client' | 'billing' | 'payment'>('client');

  // Auto-calculations
  useEffect(() => {
    let subtotal = data.monthlyRate * data.monthsPayingNow;
    
    // Add-on items
    const addsOnTotal = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    subtotal += addsOnTotal;
    
    // Discount is the difference between standard package price and purchased price
    const calculatedDiscount = (data.monthlyRate - data.agreedRate) * data.monthsPayingNow;
    const finalDiscount = calculatedDiscount > 0 ? calculatedDiscount : 0;
    
    const total = data.overrideTotal !== undefined ? data.overrideTotal : (subtotal - finalDiscount);
    const amountRemaining = total - (data.amountPaid || 0);

    if (data.subtotal !== subtotal || data.total !== total || data.amountRemaining !== amountRemaining || data.discount !== finalDiscount) {
      setData(prev => ({ ...prev, subtotal, total, amountRemaining, discount: finalDiscount }));
    }
  }, [data.monthlyRate, data.agreedRate, data.monthsPayingNow, data.items, data.overrideTotal, data.amountPaid]);

  const updateField = (field: keyof InvoiceData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updatePaymentDetail = (field: keyof InvoiceData['paymentDetails'], value: string) => {
    setData(prev => ({
      ...prev,
      paymentDetails: { ...prev.paymentDetails, [field]: value }
    }));
  };

  const getPeriodText = () => {
    const end = Math.min(data.startMonth + data.monthsPayingNow - 1, data.duration);
    return data.monthsPayingNow === 1 
      ? `Month ${data.startMonth} of ${data.duration}` 
      : `Month ${data.startMonth}–${end} of ${data.duration}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-xl z-[100] flex items-center justify-center p-0 md:p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        className="bg-white w-full max-w-6xl h-full md:h-[90vh] rounded-none md:rounded-[32px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-zinc-200"
      >
        {/* Sidebar - Category Navigation */}
        <div className="w-full md:w-80 bg-zinc-50 border-b md:border-b-0 md:border-r border-zinc-100 flex md:flex-col p-4 md:p-6 overflow-x-auto md:overflow-y-auto shrink-0">
          <div className="hidden md:flex mb-10 items-center gap-3">
             <div className="w-10 h-10 bg-[#2563eb] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
               <span className="font-syne font-black text-xl">P</span>
             </div>
             <div>
               <h3 className="font-syne font-bold text-zinc-900 tracking-tight">Invoice Editor</h3>
               <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Pioneers Digital</p>
             </div>
          </div>

          <nav className="flex md:flex-col gap-2 flex-1 min-w-max md:min-w-0">
            <button 
              onClick={() => setActiveTab('client')}
              className={`flex items-center gap-3 px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl transition-all whitespace-nowrap ${activeTab === 'client' ? 'bg-white shadow-sm border border-zinc-200 text-blue-600' : 'text-zinc-500 hover:bg-zinc-100'}`}
            >
              <Building className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-bold">Client Info</span>
            </button>
            <button 
              onClick={() => setActiveTab('billing')}
              className={`flex items-center gap-3 px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl transition-all whitespace-nowrap ${activeTab === 'billing' ? 'bg-white shadow-sm border border-zinc-200 text-blue-600' : 'text-zinc-500 hover:bg-zinc-100'}`}
            >
              <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-bold">Package & Rate</span>
            </button>
            <button 
              onClick={() => setActiveTab('payment')}
              className={`flex items-center gap-3 px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl transition-all whitespace-nowrap ${activeTab === 'payment' ? 'bg-white shadow-sm border border-zinc-200 text-blue-600' : 'text-zinc-500 hover:bg-zinc-100'}`}
            >
              <Wallet className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-bold">Payment</span>
            </button>
          </nav>

          <div className="hidden md:block pt-6 border-t border-zinc-100 space-y-4">
            <button 
              onClick={() => onSave(data)}
              className="w-full bg-[#0f172a] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#1e293b] active:scale-95 transition-all shadow-xl shadow-zinc-100"
            >
              <Save className="w-5 h-5" /> Generate PDF
            </button>
            <button onClick={onClose} className="w-full text-zinc-400 text-sm font-bold py-2 hover:text-rose-600">Cancel</button>
          </div>

          <div className="md:hidden flex items-center gap-2 min-w-max ml-4">
             <button 
               onClick={onClose}
               className="p-3 bg-zinc-100 text-zinc-400 rounded-xl"
             >
               <X className="w-5 h-5" />
             </button>
             <button 
               onClick={() => onSave(data)}
               className="px-6 py-3 bg-[#2563eb] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-100"
             >
               Generate
             </button>
          </div>
        </div>

        {/* Content Area - Form & Preview */}
        <div className="flex-1 overflow-y-auto bg-white flex flex-col md:flex-row min-w-0">
          {/* Form Fields Section */}
          <div className="flex-1 p-8 md:p-12 space-y-8 bg-white border-r border-zinc-50 min-w-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'client' && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-10"
                >
                  <section className="space-y-4">
                    <h4 className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.2em]">Invoice Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50/50 p-6 rounded-3xl border border-zinc-100">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Invoice Number</label>
                        <input 
                          value={data.invoiceNumber}
                          onChange={e => updateField('invoiceNumber', e.target.value)}
                          className="w-full bg-white border border-zinc-200 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          placeholder="PDMA-2024-..."
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Invoice Date</label>
                          <input 
                            type="text"
                            value={data.invoiceDate}
                            onChange={e => updateField('invoiceDate', e.target.value)}
                            className="w-full bg-white border border-zinc-200 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Date of issue"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Due Date</label>
                          <input 
                            type="text"
                            value={data.dueDate}
                            onChange={e => updateField('dueDate', e.target.value)}
                            className="w-full bg-white border border-zinc-200 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Payment due by"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.2em]">Agency Details (Your Info)</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Agency Name</label>
                        <input 
                          value={data.agencyName}
                          onChange={e => updateField('agencyName', e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          placeholder="Your Company Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Agency Address</label>
                        <textarea 
                          value={data.agencyAddress}
                          onChange={e => updateField('agencyAddress', e.target.value)}
                          rows={3}
                          className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                          placeholder="Your Office Address"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Agency CEO (Signatory)</label>
                        <input 
                          value={data.agencyCEO}
                          onChange={e => updateField('agencyCEO', e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          placeholder="CEO Name"
                        />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.2em]">Client Identification</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Company Name</label>
                        <input 
                          value={data.clientName}
                          onChange={e => updateField('clientName', e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          placeholder="e.g. Acme Marketing Co."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Billing Address</label>
                        <textarea 
                          value={data.clientAddress}
                          onChange={e => updateField('clientAddress', e.target.value)}
                          rows={3}
                          className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                          placeholder="Address, City, Pincode"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Client Email</label>
                          <input 
                            value={data.clientEmail}
                            onChange={e => updateField('clientEmail', e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="billing@client.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Client Phone</label>
                          <input 
                            value={data.clientPhone}
                            onChange={e => updateField('clientPhone', e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="+91 XXXXX XXXXX"
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}

              {activeTab === 'billing' && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-10"
                >
                  <section className="space-y-4">
                    <h4 className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.2em]">Service Category</h4>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => updateField('serviceCategory', 'package')}
                         className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${data.serviceCategory === 'package' ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-lg shadow-blue-100' : 'bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200'}`}
                       >
                         Package
                       </button>
                        <button 
                          onClick={() => updateField('serviceCategory', 'addon')}
                          className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${data.serviceCategory === 'addon' ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-lg shadow-blue-100' : 'bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200'}`}
                        >
                          Add-on Service
                        </button>
                     </div>

                     <h4 className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.2em] pt-4">Duration Type</h4>
                     <div className="flex gap-2">
                        <button 
                          onClick={() => updateField('durationType', 'monthly')}
                          className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${data.durationType === 'monthly' ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-lg shadow-blue-100' : 'bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200'}`}
                        >
                          Monthly
                        </button>
                        <button 
                          onClick={() => {
                            updateField('durationType', 'one-time');
                            updateField('monthsPayingNow', 1);
                            updateField('startMonth', 1);
                          }}
                          className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${data.durationType === 'one-time' ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-lg shadow-blue-100' : 'bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200'}`}
                        >
                          One-Time
                        </button>
                     </div>

                    <h4 className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.2em] pt-4">
                      {data.serviceCategory === 'package' ? 'Select Package' : 'Service Name'}
                    </h4>
                    <div className="grid grid-cols-1 gap-6">
                      {data.serviceCategory === 'package' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {PACKAGE_OPTIONS.map(opt => (
                            <button 
                              key={opt.name}
                              onClick={() => {
                                updateField('pkgName', opt.name);
                                updateField('monthlyRate', opt.rate);
                                updateField('agreedRate', opt.rate);
                              }}
                              className={`p-4 rounded-2xl border transition-all text-center ${data.pkgName === opt.name ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-50' : 'border-zinc-200 bg-white hover:border-zinc-300'}`}
                            >
                              <div className={`text-xs font-black uppercase tracking-widest ${opt.color}`}>{opt.name}</div>
                              <div className="text-[10px] text-zinc-400 mt-1">₹{opt.rate}/mo</div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input 
                            value={data.pkgName}
                            onChange={e => updateField('pkgName', e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="e.g., WhatsApp Marketing, SEO Audit..."
                          />
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Contract Duration</label>
                          <select 
                            value={data.duration}
                            onChange={e => updateField('duration', parseInt(e.target.value))}
                            className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                          >
                            {[1, 2, 3, 4, 6, 9, 12].map(d => <option key={d} value={d}>{d} Month{d > 1 ? 's' : ''}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Initial Monthly Rate (₹)</label>
                          <input 
                            type="number"
                            value={data.monthlyRate}
                            onChange={e => updateField('monthlyRate', parseInt(e.target.value) || 0)}
                            className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className={`grid grid-cols-2 gap-4 transition-all ${data.durationType === 'one-time' ? 'opacity-40 pointer-events-none' : ''}`}>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Months Paying Now</label>
                          <select 
                            value={data.monthsPayingNow}
                            onChange={e => updateField('monthsPayingNow', parseInt(e.target.value))}
                            className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                          >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(i => <option key={i} value={i}>{i} Month{i > 1 ? 's' : ''}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Starting Month #</label>
                          <select 
                            value={data.startMonth}
                            onChange={e => updateField('startMonth', parseInt(e.target.value))}
                            className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                          >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(i => <option key={i} value={i}>Month {i}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Purchased Price (₹)</label>
                          <input 
                            type="number"
                            value={data.agreedRate}
                            onChange={e => updateField('agreedRate', parseInt(e.target.value) || 0)}
                            className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Amount Paid (₹)</label>
                          <input 
                            type="number"
                            value={data.amountPaid}
                            onChange={e => updateField('amountPaid', parseInt(e.target.value) || 0)}
                            className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 flex items-start gap-3">
                         <Info className="w-5 h-5 text-orange-400 shrink-0 mt-1" />
                         <p className="text-[11px] text-orange-600 leading-relaxed">
                           Invoice will cover <strong>{getPeriodText()}</strong>. Duration is calculated automatically for the PDF table using Pioneers billing standard.
                         </p>
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}

              {activeTab === 'payment' && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-10"
                >
                  <section className="space-y-4">
                    <h4 className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.2em]">Status & Methods</h4>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="flex gap-2">
                        {['unpaid', 'paid', 'partial'].map(s => (
                          <button 
                            key={s}
                            onClick={() => updateField('status', s as any)}
                            className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${data.status === s ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-lg shadow-blue-100' : 'bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Payment Method</label>
                        <div className="flex flex-wrap gap-2">
                          {['upi', 'card', 'cheque', 'bank', 'cash'].map(m => (
                            <button 
                              key={m}
                              onClick={() => updateField('paymentMethod', m as any)}
                              className={`px-6 py-3 rounded-xl text-xs font-bold transition-all border ${data.paymentMethod === m ? 'bg-zinc-900 text-white border-zinc-900 shadow-xl' : 'bg-zinc-50 text-zinc-500 border-zinc-100 hover:bg-zinc-100'}`}
                            >
                              {m.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 p-6 bg-zinc-50 rounded-[32px] border border-zinc-100">
                        <div className="col-span-2 flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-2xl mb-2">
                           <div className="flex items-center gap-3">
                              <Building className="w-5 h-5 text-[#2563eb]" />
                              <div>
                                 <h4 className="text-[10px] font-black uppercase text-zinc-900 leading-none">Bank Details</h4>
                                 <p className="text-[8px] text-zinc-400 mt-1 uppercase tracking-widest">Show on PDF</p>
                              </div>
                           </div>
                           <button 
                             onClick={() => updateField('showBankDetails', !data.showBankDetails)}
                             className={`w-12 h-6 rounded-full transition-all relative ${data.showBankDetails ? 'bg-blue-600' : 'bg-zinc-200'}`}
                           >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${data.showBankDetails ? 'left-7' : 'left-1'}`} />
                           </button>
                        </div>

                        {data.showBankDetails && (
                           <>
                             <div className="space-y-1">
                                <label className="text-[9px] font-bold text-zinc-400 uppercase">Bank Name</label>
                                <input value={data.bankName} onChange={e => updateField('bankName', e.target.value)} className="w-full bg-white border border-zinc-200 p-2 rounded-xl text-xs font-bold" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[9px] font-bold text-zinc-400 uppercase">A/C Number</label>
                                <input value={data.accountNumber} onChange={e => updateField('accountNumber', e.target.value)} className="w-full bg-white border border-zinc-200 p-2 rounded-xl text-xs font-bold" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[9px] font-bold text-zinc-400 uppercase">IFSC Code</label>
                                <input value={data.ifscCode} onChange={e => updateField('ifscCode', e.target.value)} className="w-full bg-white border border-zinc-200 p-2 rounded-xl text-xs font-bold" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[9px] font-bold text-zinc-400 uppercase">UPI ID</label>
                                <input value={data.upiId} onChange={e => updateField('upiId', e.target.value)} className="w-full bg-white border border-zinc-200 p-2 rounded-xl text-xs font-bold" />
                             </div>
                           </>
                        )}
                        
                        {data.paymentMethod === 'upi' && (
                          <div className="col-span-2 space-y-2 pt-2 border-t border-zinc-100 mt-2">
                            <label className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Client Payment Reference</label>
                            <div className="grid grid-cols-2 gap-2">
                              <input 
                                value={data.paymentDetails.upiTxn || ''}
                                placeholder="Txn ID"
                                onChange={e => updatePaymentDetail('upiTxn', e.target.value)}
                                className="w-full bg-white border border-zinc-200 p-3 rounded-xl text-xs font-bold"
                              />
                              <input 
                                value={data.paymentDetails.upiApp || ''}
                                placeholder="UPI App"
                                onChange={e => updatePaymentDetail('upiApp', e.target.value)}
                                className="w-full bg-white border border-zinc-200 p-3 rounded-xl text-xs font-bold"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Real-time Preview Section */}
          <div className="hidden lg:flex flex-1 bg-zinc-100/50 p-12 overflow-y-auto justify-center">
            <div className="w-full max-w-[500px] bg-white shadow-2xl rounded-sm aspect-[1/1.414] flex flex-col border border-zinc-200 origin-top scale-[0.95] overflow-hidden">
              {/* Paper Preview Content */}
                        {/* Premium Header */}
              <div className="bg-[#0f172a] p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-[#2563eb] rounded-lg flex items-center justify-center text-white shadow-lg shrink-0">
                      <span className="font-syne font-black text-xl">P</span>
                   </div>
                   <div>
                      <h2 className="font-syne font-black text-lg tracking-tight leading-none">PIONEERS</h2>
                      <p className="text-[6px] font-bold text-slate-400 mt-1 tracking-[0.2em]">DIGITAL MARKETING AGENCY</p>
                   </div>
                </div>
                <div className="text-right">
                   <h1 className="font-syne font-black text-2xl tracking-tighter opacity-10">INVOICE</h1>
                </div>
              </div>

              <div className="p-10 flex flex-col gap-10 flex-1 relative">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
                  <span className="text-[150px] font-black rotate-45">P</span>
                </div>

                {/* Meta Info Grid */}
                <div className="grid grid-cols-3 gap-6 relative z-10">
                  <div className="space-y-2">
                    <div className="text-[7px] font-black text-zinc-300 uppercase tracking-widest">Issued From</div>
                    <div className="font-bold text-[10px] text-[#0f172a] mb-1">{data.agencyName}</div>
                    <div className="text-[8px] text-zinc-400 leading-relaxed whitespace-pre-wrap">{data.agencyAddress}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[7px] font-black text-zinc-300 uppercase tracking-widest">Bill To</div>
                    <div className="font-bold text-[10px] text-[#0f172a] mb-1">{data.clientName || 'Client Business Name'}</div>
                    <div className="text-[8px] text-zinc-400 leading-relaxed whitespace-pre-wrap">{data.clientAddress || 'Address will appear here'}</div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-[7px] font-black text-zinc-300 uppercase tracking-widest">Invoice Details</div>
                    <div className="font-bold text-[10px] text-blue-600 mb-1">{data.invoiceNumber}</div>
                    <div className="text-[8px] text-zinc-500 font-medium">Date: {data.invoiceDate}</div>
                    <div className="text-[8px] text-zinc-500 font-medium">Due: {data.dueDate}</div>
                    <div className="text-[8px] font-bold text-blue-600 mt-2 block italic">{getPeriodText()}</div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="flex-1 relative z-10">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-y border-zinc-100">
                         <th className="text-[7px] text-zinc-400 font-black uppercase text-left py-3 px-2">Description</th>
                         <th className="text-[7px] text-zinc-400 font-black uppercase text-right py-3 px-2">Package Price</th>
                         <th className="text-[7px] text-zinc-400 font-black uppercase text-right py-3 px-2">Purchased Price</th>
                         <th className="text-[7px] text-zinc-400 font-black uppercase text-center py-3 px-2">Duration</th>
                         <th className="text-[7px] text-zinc-400 font-black uppercase text-right py-3 px-2">Amount Paid</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-zinc-50">
                        <td className="py-4 px-2">
                          <div className="text-[10px] font-bold text-[#0f172a]">
                            {data.serviceCategory === 'package' ? `${data.pkgName} Package` : 'Add-on Service'}: Digital Marketing
                          </div>
                          <div className="text-[8px] text-zinc-400 mt-1 italic leading-relaxed">Pioneers Standard Excellence</div>
                        </td>
                        <td className="text-right font-bold text-[10px] text-zinc-400 px-2 line-through">₹{data.monthlyRate.toLocaleString()}</td>
                        <td className="text-right font-bold text-[10px] text-[#0f172a] px-2">₹{data.agreedRate.toLocaleString()}</td>
                        <td className="text-center text-[10px] text-zinc-500">
                          {data.durationType === 'one-time' ? 'One-Time' : `${data.monthsPayingNow} ${data.monthsPayingNow > 1 ? 'Months' : 'Month'}`}
                        </td>
                        <td className="text-right font-bold text-[10px] text-emerald-600 px-2">₹{data.amountPaid.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footer Section with Totals and Stamp */}
                <div className="mt-auto relative z-10">
                   {/* Status Stamp Overlay */}
                   <div className="absolute left-0 bottom-24 -rotate-12 opacity-20 pointer-events-none">
                      <div className={`border-4 px-6 py-2 rounded-xl text-2xl font-black uppercase tracking-widest ${data.status === 'paid' ? 'border-emerald-500 text-emerald-500' : 'border-rose-500 text-rose-500'}`}>
                         {data.status}
                      </div>
                   </div>

                   <div className="flex justify-end mb-8">
                      <div className="w-48 space-y-2">
                         <div className="flex justify-between text-[9px]">
                            <span className="text-zinc-400 font-medium">Subtotal</span>
                            <span className="text-[#0f172a] font-bold">₹{data.subtotal.toLocaleString()}</span>
                         </div>
                         {data.discount > 0 && (
                           <div className="flex justify-between text-[9px]">
                              <span className="text-zinc-400 font-medium text-rose-500">Discount</span>
                              <span className="text-rose-500 font-bold">-₹{data.discount.toLocaleString()}</span>
                           </div>
                         )}
                         <div className="flex justify-between text-[9px] pt-1">
                            <span className="text-zinc-400 font-medium text-emerald-600">Amount Paid</span>
                            <span className="text-emerald-600 font-bold">-₹{data.amountPaid.toLocaleString()}</span>
                         </div>
                         <div className="bg-[#2563eb] text-white p-3 rounded-lg flex justify-between items-center mt-4">
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-80">Remaining Due</span>
                            <span className="text-sm font-black">₹{data.amountRemaining.toLocaleString()}</span>
                         </div>
                      </div>
                   </div>

                   <div className="pt-8 border-t border-zinc-100 flex justify-between items-end grayscale-[0.5] opacity-50">
                      <div className="space-y-1">
                         <p className="text-[6px] font-bold text-zinc-400 uppercase tracking-widest">Pioneers Digital Marketing Agency</p>
                         <p className="text-[6px] text-zinc-400 font-medium italic">Confidentiality & Results Guaranteed</p>
                      </div>
                      <div className="text-right">
                         <div className="w-16 h-px bg-zinc-300 mb-2 ml-auto"></div>
                         <p className="text-[6px] font-bold text-zinc-400 uppercase leading-none">{data.agencyCEO}</p>
                         <p className="text-[5px] text-zinc-300 mt-1 uppercase tracking-tighter">Auth. Signatory</p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Finishing Footer Bar */}
              <div className="bg-slate-800 h-2 w-full mt-auto"></div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
