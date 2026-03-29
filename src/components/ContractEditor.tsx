import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Save, FileText, Settings, List, CreditCard, ShieldCheck, ChevronRight, ChevronDown, GripVertical, Info } from 'lucide-react';
import { ContractData, MonthPlan, ServiceItem, AddOnService, TermCondition, PaymentInstalment } from '../types';

interface ContractEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: ContractData;
  onSave: (data: ContractData) => void;
}

type TabType = 'general' | 'plans' | 'addons' | 'payment' | 'terms' | 'agency';

export default function ContractEditor({ isOpen, onClose, initialData, onSave }: ContractEditorProps) {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [data, setData] = useState<ContractData>(initialData);
  const [hasManuallyEditedTotal, setHasManuallyEditedTotal] = useState(false);

  // Auto-calculate Total Value if not manually edited
  useEffect(() => {
    if (hasManuallyEditedTotal) return;
    
    const monthlyText = (data.monthlyValue || '0').replace(/,/g, '');
    const monthly = parseInt(monthlyText, 10);
    const months = data.plans?.length || 0;
    
    if (!isNaN(monthly) && months > 0) {
      const calculatedTotal = (monthly * months).toLocaleString();
      if ((data.totalValue || '').replace(/,/g, '') !== calculatedTotal.replace(/,/g, '')) {
        setData(prev => ({ ...prev, totalValue: calculatedTotal }));
      }
    }
  }, [data.monthlyValue, data.plans?.length, hasManuallyEditedTotal]);

  const handleUpdateGeneral = (field: keyof ContractData, value: string) => {
    if (field === 'totalValue') {
      setHasManuallyEditedTotal(true);
    }
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPlan = () => {
    const newPlan: MonthPlan = {
      title: `MONTH ${data.plans?.length ? data.plans.length + 1 : 1} - New Phase`,
      subtitle: 'New Phase Subtitle',
      price: '0',
      services: [{ id: '1', name: 'New Service', details: 'Service Details', included: true }]
    };
    setData(prev => ({ ...prev, plans: [...(prev.plans || []), newPlan] }));
  };

  const handleRemovePlan = (index: number) => {
    setData(prev => {
      const remainingPlans = prev.plans?.filter((_, i) => i !== index) || [];
      // Re-index titles IF they follow the "MONTH X" pattern
      const reindexedPlans = remainingPlans.map((plan, i) => {
        if (plan.title.startsWith('MONTH ')) {
          const parts = plan.title.split('—');
          const description = parts.length > 1 ? parts[1].trim() : '';
          return {
            ...plan,
            title: `MONTH ${i + 1}${description ? ` — ${description}` : ''}`
          };
        }
        return plan;
      });
      return { ...prev, plans: reindexedPlans };
    });
  };

  const handleUpdatePlan = (index: number, field: keyof MonthPlan, value: any) => {
    setData(prev => {
      const newPlans = [...(prev.plans || [])];
      newPlans[index] = { ...newPlans[index], [field]: value };
      return { ...prev, plans: newPlans };
    });
  };

  const handleAddService = (planIndex: number) => {
    setData(prev => {
      const newPlans = [...(prev.plans || [])];
      const services = [...(newPlans[planIndex].services || [])];
      services.push({ id: (services.length + 1).toString(), name: 'New Service', details: 'Service Details', included: true });
      newPlans[planIndex] = { ...newPlans[planIndex], services };
      return { ...prev, plans: newPlans };
    });
  };

  const handleRemoveService = (planIndex: number, serviceIndex: number) => {
    setData(prev => {
      const newPlans = [...(prev.plans || [])];
      const services = prev.plans![planIndex].services.filter((_, i) => i !== serviceIndex);
      newPlans[planIndex] = { ...newPlans[planIndex], services };
      return { ...prev, plans: newPlans };
    });
  };

  const handleUpdateService = (planIndex: number, serviceIndex: number, field: keyof ServiceItem, value: any) => {
    setData(prev => {
      const newPlans = [...(prev.plans || [])];
      const services = [...(newPlans[planIndex].services || [])];
      services[serviceIndex] = { ...services[serviceIndex], [field]: value };
      newPlans[planIndex] = { ...newPlans[planIndex], services };
      return { ...prev, plans: newPlans };
    });
  };

  const handleAddAddOn = () => {
    const newAddOn: AddOnService = { id: Date.now().toString(), name: 'New Add-on', included: 'Included details', price: '0' };
    setData(prev => ({ ...prev, addOnServices: [...(prev.addOnServices || []), newAddOn] }));
  };

  const handleRemoveAddOn = (index: number) => {
    setData(prev => ({ ...prev, addOnServices: prev.addOnServices?.filter((_, i) => i !== index) }));
  };

  const handleUpdateAddOn = (index: number, field: keyof AddOnService, value: string) => {
    setData(prev => {
      const newAddOns = [...(prev.addOnServices || [])];
      newAddOns[index] = { ...newAddOns[index], [field]: value };
      return { ...prev, addOnServices: newAddOns };
    });
  };

  const handleAddTerm = () => {
    const newTerm: TermCondition = { id: `${(data.termsAndConditions?.length || 0) + 1}.`, title: 'New Term', details: 'Term details' };
    setData(prev => ({ ...prev, termsAndConditions: [...(prev.termsAndConditions || []), newTerm] }));
  };

  const handleRemoveTerm = (index: number) => {
    setData(prev => ({ ...prev, termsAndConditions: prev.termsAndConditions?.filter((_, i) => i !== index) }));
  };

  const handleUpdateTerm = (index: number, field: keyof TermCondition, value: string) => {
    setData(prev => {
      const newTerms = [...(prev.termsAndConditions || [])];
      newTerms[index] = { ...newTerms[index], [field]: value };
      return { ...prev, termsAndConditions: newTerms };
    });
  };

  const handleAddInstalment = () => {
    const newInstalment: PaymentInstalment = { id: Date.now().toString(), name: 'New Instalment', due: 'Due date', amount: '0' };
    setData(prev => ({ ...prev, paymentSchedule: [...(prev.paymentSchedule || []), newInstalment] }));
  };

  const handleRemoveInstalment = (index: number) => {
    setData(prev => ({ ...prev, paymentSchedule: prev.paymentSchedule?.filter((_, i) => i !== index) }));
  };

  const handleUpdateInstalment = (index: number, field: keyof PaymentInstalment, value: string) => {
    setData(prev => {
      const newSchedule = [...(prev.paymentSchedule || [])];
      newSchedule[index] = { ...newSchedule[index], [field]: value };
      return { ...prev, paymentSchedule: newSchedule };
    });
  };

  const tabs = [
    { id: 'general', label: 'General Info', icon: FileText },
    { id: 'plans', label: 'Monthly Plans', icon: List },
    { id: 'addons', label: 'Add-ons', icon: Plus },
    { id: 'payment', label: 'Payment Schedule', icon: CreditCard },
    { id: 'terms', label: 'Terms & Conditions', icon: ShieldCheck },
    { id: 'agency', label: 'Agency Details', icon: Settings },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-6xl h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-zinc-200"
      >
        {/* Header */}
        <div className="px-10 py-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Contract Editor</h2>
              <p className="text-zinc-500 text-sm">Customize every detail of your service agreement.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => onSave(data)}
              className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Generate PDF
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-72 border-r border-zinc-100 p-6 space-y-2 bg-zinc-50/30">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-indigo-600 shadow-sm border border-zinc-200 translate-x-1' 
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-indigo-600' : 'text-zinc-400'}`} />
                {tab.label}
                {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-10 bg-white">
            <AnimatePresence mode="wait">
              {activeTab === 'general' && (
                <motion.div 
                  key="general"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Client Name</label>
                      <input 
                        type="text" 
                        value={data.clientName}
                        onChange={(e) => handleUpdateGeneral('clientName', e.target.value)}
                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-zinc-900 transition-all"
                        placeholder="e.g. Acme Corp"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Client Type (e.g. Pharmaceutical Manufacturer)</label>
                      <input 
                        type="text" 
                        value={data.clientType || ''}
                        onChange={(e) => handleUpdateGeneral('clientType', e.target.value)}
                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-zinc-900 transition-all"
                        placeholder="e.g. Pharmaceutical Manufacturer"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Contact Person</label>
                      <input 
                        type="text" 
                        value={data.contactPerson}
                        onChange={(e) => handleUpdateGeneral('contactPerson', e.target.value)}
                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-zinc-900 transition-all"
                        placeholder="e.g. Dr. Sudhir Rajurkar"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Contact Number</label>
                      <input 
                        type="text" 
                        value={data.contactNumber}
                        onChange={(e) => handleUpdateGeneral('contactNumber', e.target.value)}
                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-zinc-900 transition-all"
                        placeholder="e.g. 9422175793"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Location</label>
                      <input 
                        type="text" 
                        value={data.location}
                        onChange={(e) => handleUpdateGeneral('location', e.target.value)}
                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-zinc-900 transition-all"
                        placeholder="e.g. Parbhani"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Ad Budget Note (e.g. Meta Ads budget separate)</label>
                      <input 
                        type="text" 
                        value={data.adBudgetNote || ''}
                        onChange={(e) => handleUpdateGeneral('adBudgetNote', e.target.value)}
                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-zinc-900 transition-all"
                        placeholder="e.g. Advertisement (ad) budget is NOT included in the package price."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Package Name</label>
                      <input 
                        type="text" 
                        value={data.packageName}
                        onChange={(e) => handleUpdateGeneral('packageName', e.target.value)}
                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-zinc-900 transition-all"
                        placeholder="e.g. Premium Growth Package"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Duration</label>
                      <input 
                        type="text" 
                        value={data.duration}
                        onChange={(e) => handleUpdateGeneral('duration', e.target.value)}
                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-zinc-900 transition-all"
                        placeholder="e.g. 3 Months"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Monthly Value (₹)</label>
                      <input 
                        type="text" 
                        value={data.monthlyValue}
                        onChange={(e) => handleUpdateGeneral('monthlyValue', e.target.value)}
                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-zinc-900 transition-all"
                        placeholder="e.g. 15,000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Total Value (₹)</label>
                      <input 
                        type="text" 
                        value={data.totalValue}
                        onChange={(e) => handleUpdateGeneral('totalValue', e.target.value)}
                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-zinc-900 transition-all"
                        placeholder="e.g. 45,000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Agreement Number</label>
                      <input 
                        type="text" 
                        value={data.agreementNumber}
                        onChange={(e) => handleUpdateGeneral('agreementNumber', e.target.value)}
                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-zinc-900 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Agreement Date</label>
                      <input 
                        type="text" 
                        value={data.agreementDate}
                        onChange={(e) => handleUpdateGeneral('agreementDate', e.target.value)}
                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-zinc-900 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Validity (Days)</label>
                      <input 
                        type="text" 
                        value={data.validityDays}
                        onChange={(e) => handleUpdateGeneral('validityDays', e.target.value)}
                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-zinc-900 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Footer Note</label>
                    <textarea 
                      value={data.footerNote}
                      onChange={(e) => handleUpdateGeneral('footerNote', e.target.value)}
                      className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-zinc-900 transition-all min-h-[120px]"
                      placeholder="Add a custom note for the bottom of the contract..."
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === 'plans' && (
                <motion.div 
                  key="plans"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  {data.plans?.map((plan, pIndex) => (
                    <div key={pIndex} className="bg-zinc-50/50 rounded-[32px] border border-zinc-200 overflow-hidden shadow-sm">
                      <div className="px-8 py-6 bg-white border-b border-zinc-100 flex items-center justify-between">
                        <div className="flex-1 grid grid-cols-3 gap-6">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Phase Title</label>
                            <input 
                              type="text" 
                              value={plan.title}
                              onChange={(e) => handleUpdatePlan(pIndex, 'title', e.target.value)}
                              className="w-full text-lg font-bold text-zinc-900 bg-transparent border-none p-0 focus:ring-0 outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Subtitle</label>
                            <input 
                              type="text" 
                              value={plan.subtitle}
                              onChange={(e) => handleUpdatePlan(pIndex, 'subtitle', e.target.value)}
                              className="w-full text-sm text-zinc-500 bg-transparent border-none p-0 focus:ring-0 outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Price (₹)</label>
                            <input 
                              type="text" 
                              value={plan.price}
                              onChange={(e) => handleUpdatePlan(pIndex, 'price', e.target.value)}
                              className="w-full text-lg font-bold text-indigo-600 bg-transparent border-none p-0 focus:ring-0 outline-none"
                            />
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemovePlan(pIndex)}
                          className="ml-6 p-3 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="p-8 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Services Included</h4>
                          <button 
                            onClick={() => handleAddService(pIndex)}
                            className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
                          >
                            <Plus className="w-3 h-3" /> Add Service
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {plan.services.map((service, sIndex) => (
                            <div key={sIndex} className="flex items-start gap-4 bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm group">
                              <div className="mt-3 text-zinc-300 group-hover:text-zinc-400 transition-colors">
                                <GripVertical className="w-4 h-4" />
                              </div>
                              <div className="flex-1 grid grid-cols-12 gap-4">
                                <div className="col-span-1 flex items-center justify-center">
                                  <input 
                                    type="checkbox" 
                                    checked={service.included}
                                    onChange={(e) => handleUpdateService(pIndex, sIndex, 'included', e.target.checked)}
                                    className="w-5 h-5 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500"
                                  />
                                </div>
                                <div className="col-span-4">
                                  <input 
                                    type="text" 
                                    value={service.name}
                                    onChange={(e) => handleUpdateService(pIndex, sIndex, 'name', e.target.value)}
                                    className="w-full text-sm font-bold text-zinc-900 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="Service Name"
                                  />
                                </div>
                                <div className="col-span-7 flex flex-col">
                                  <textarea 
                                    value={service.details}
                                    onChange={(e) => handleUpdateService(pIndex, sIndex, 'details', e.target.value)}
                                    rows={3}
                                    className="w-full text-sm text-zinc-600 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-y"
                                    placeholder="Service Details / Description (use new lines for multi-line entries)"
                                  />
                                </div>
                              </div>
                              <button 
                                onClick={() => handleRemoveService(pIndex, sIndex)}
                                className="mt-2.5 p-2 text-zinc-300 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={handleAddPlan}
                    className="w-full py-8 rounded-[32px] border-2 border-dashed border-zinc-200 text-zinc-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex flex-col items-center gap-2 group"
                  >
                    <div className="p-3 bg-zinc-50 rounded-2xl group-hover:bg-indigo-100 transition-all">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-bold">Add Another Monthly Phase</span>
                  </button>
                </motion.div>
              )}

              {activeTab === 'addons' && (
                <motion.div 
                  key="addons"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900">Add-on Services</h3>
                      <p className="text-zinc-500 text-sm">Optional services that can be added to the base plan.</p>
                    </div>
                    <button 
                      onClick={handleAddAddOn}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Add New Add-on
                    </button>
                  </div>

                  <div className="space-y-4">
                    {data.addOnServices?.map((addon, index) => (
                      <div key={index} className="bg-white p-6 rounded-[24px] border border-zinc-200 shadow-sm flex items-start gap-6 group">
                        <div className="flex-1 grid grid-cols-12 gap-6">
                          <div className="col-span-4 space-y-2">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Service Name</label>
                            <input 
                              type="text" 
                              value={addon.name}
                              onChange={(e) => handleUpdateAddOn(index, 'name', e.target.value)}
                              className="w-full px-5 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-zinc-900"
                            />
                          </div>
                          <div className="col-span-5 space-y-2">
                             <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Description</label>
                             <textarea
                               value={addon.included}
                               onChange={(e) => handleUpdateAddOn(index, 'included', e.target.value)}
                               rows={2}
                               className="w-full px-5 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-600 resize-y"
                             />
                           </div>
                          <div className="col-span-3 space-y-2">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Quantity</label>
                            <input 
                              type="text" 
                              value={addon.quantity || ''}
                              onChange={(e) => handleUpdateAddOn(index, 'quantity', e.target.value)}
                              className="w-full px-5 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-600"
                              placeholder="e.g. 1 shoot"
                            />
                          </div>
                          <div className="col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Price (₹)</label>
                            <input 
                              type="text" 
                              value={addon.price}
                              onChange={(e) => handleUpdateAddOn(index, 'price', e.target.value)}
                              className="w-full px-5 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-600"
                            />
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveAddOn(index)}
                          className="mt-8 p-3 text-zinc-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'payment' && (
                <motion.div 
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900">Payment Schedule</h3>
                      <p className="text-zinc-500 text-sm">Define the payment instalments for this contract.</p>
                    </div>
                    <button 
                      onClick={handleAddInstalment}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Add Instalment
                    </button>
                  </div>

                  <div className="space-y-4">
                    {data.paymentSchedule?.map((item, index) => (
                      <div key={index} className="bg-white p-6 rounded-[24px] border border-zinc-200 shadow-sm flex items-start gap-6 group">
                        <div className="flex-1 grid grid-cols-12 gap-6">
                          <div className="col-span-4 space-y-2">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Instalment Name</label>
                            <input 
                              type="text" 
                              value={item.name}
                              onChange={(e) => handleUpdateInstalment(index, 'name', e.target.value)}
                              className="w-full px-5 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-zinc-900"
                            />
                          </div>
                          <div className="col-span-5 space-y-2">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Due Date / Condition</label>
                            <input 
                              type="text" 
                              value={item.due}
                              onChange={(e) => handleUpdateInstalment(index, 'due', e.target.value)}
                              className="w-full px-5 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-600"
                            />
                          </div>
                          <div className="col-span-3 space-y-2">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Amount (₹)</label>
                            <input 
                              type="text" 
                              value={item.amount}
                              onChange={(e) => handleUpdateInstalment(index, 'amount', e.target.value)}
                              className="w-full px-5 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-600"
                            />
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveInstalment(index)}
                          className="mt-8 p-3 text-zinc-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'terms' && (
                <motion.div 
                  key="terms"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900">Terms & Conditions</h3>
                      <p className="text-zinc-500 text-sm">Legal terms and payment policies for this agreement.</p>
                    </div>
                    <button 
                      onClick={handleAddTerm}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Add New Term
                    </button>
                  </div>

                  <div className="space-y-4">
                    {data.termsAndConditions?.map((term, index) => (
                      <div key={index} className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-4 group relative">
                        <div className="flex items-center gap-4">
                          <input 
                            type="text" 
                            value={term.id}
                            onChange={(e) => handleUpdateTerm(index, 'id', e.target.value)}
                            className="w-12 text-sm font-black text-indigo-600 bg-indigo-50 border-none rounded-lg px-2 py-1 text-center focus:ring-0"
                          />
                          <input 
                            type="text" 
                            value={term.title}
                            onChange={(e) => handleUpdateTerm(index, 'title', e.target.value)}
                            className="flex-1 text-lg font-bold text-zinc-900 bg-transparent border-none p-0 focus:ring-0 outline-none"
                            placeholder="Term Title"
                          />
                        </div>
                        <textarea 
                          value={term.details}
                          onChange={(e) => handleUpdateTerm(index, 'details', e.target.value)}
                          className="w-full text-sm text-zinc-600 bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px]"
                          placeholder="Term Details"
                        />
                        <button 
                          onClick={() => handleRemoveTerm(index)}
                          className="absolute top-6 right-6 p-3 text-zinc-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'agency' && (
                <motion.div 
                  key="agency"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-start gap-4 mb-4">
                    <Info className="w-6 h-6 text-indigo-600 mt-1" />
                    <p className="text-sm text-indigo-900 leading-relaxed">
                      These details will appear in the header and footer of your contract. 
                      Make sure they are accurate as they represent your legal entity.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Agency Name</label>
                      <input 
                        type="text" 
                        value={data.agencyName}
                        onChange={(e) => handleUpdateGeneral('agencyName', e.target.value)}
                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-zinc-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Agency Type</label>
                      <input 
                        type="text" 
                        value={data.agencyType}
                        onChange={(e) => handleUpdateGeneral('agencyType', e.target.value)}
                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-zinc-900"
                        placeholder="e.g. Digital Marketing Agency"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Agency Email</label>
                      <input 
                        type="email" 
                        value={data.agencyEmail}
                        onChange={(e) => handleUpdateGeneral('agencyEmail', e.target.value)}
                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-zinc-900"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Agency Address</label>
                      <input 
                        type="text" 
                        value={data.agencyAddress}
                        onChange={(e) => handleUpdateGeneral('agencyAddress', e.target.value)}
                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-zinc-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Agency CEO / Signatory</label>
                      <input 
                        type="text" 
                        value={data.agencyCEO}
                        onChange={(e) => handleUpdateGeneral('agencyCEO', e.target.value)}
                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-zinc-900"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
