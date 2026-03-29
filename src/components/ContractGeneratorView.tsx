import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Loader2, CheckCircle2, AlertCircle, Plus, Play, LayoutGrid } from 'lucide-react';
import ContractEditor from './ContractEditor';
import { ContractData } from '../types';
import { ContractGenerator } from '../../contractGenerator';

export default function ContractGeneratorView() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [lastGeneratedUrl, setLastGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initialData: ContractData = {
    clientName: 'LR Pharmaceuticals',
    clientType: 'Pharmaceutical Manufacturer',
    email: 'contact@pharmaco.com',
    contactPerson: 'Dr Sudhir Rajurkar',
    contactNumber: '9422175793',
    agencyName: 'PIONEERS',
    agencyAddress: 'Mantri Complex, Basmat Road, Parbhani 431401',
    agencyEmail: 'pdmasolutions@gmail.com',
    agencyCEO: 'Madhav Sharma',
    agreementNumber: 'PDA-2026-007',
    agreementDate: '27 March 2026',
    validityDays: '15',
    adBudgetNote: 'Advertisement (ad) budget is NOT included in the package price. Ad spend will be billed separately based on the agreed monthly budget.',
    packageName: 'Premium Plan',
    duration: '3 Months',
    location: 'Parbhani',
    monthlyValue: '15,000',
    totalValue: '45,000',
    footerNote: '',
    plans: [
      {
        title: 'MONTH 1 — Brand Foundation & Discovery',
        subtitle: '',
        price: '15,000',
        services: [
          { id: '1', name: 'Meta Ads (Facebook + Instagram)', details: 'Awareness — Brand awareness campaign (B2B targeting)', included: true },
          { id: '2', name: 'Reels (5 per month)', details: 'Company Introduction Reel — A professional reel showcasing the company\'s background, vision, manufacturing unit, and team to build brand credibility.\n\nProduct Range Showcase Reel — A comprehensive visual presentation of the complete product portfolio including medicines, supplements, and healthcare products.\n\nManufacturing Process Reel — A behind-the-scenes reel highlighting the factory, quality control processes, lab operations, and production standards.', included: true },
          { id: '3', name: 'Graphics / Posts', details: '8 branded posts\n\nBrand Introduction Post — Company logo, tagline, and brief overview in a professional design.', included: true },
          { id: '4', name: 'Google My Business Setup', details: 'Full GMB setup — location, photos, description, category', included: true },
          { id: '5', name: 'Branding Kit', details: 'Visiting Card / Logo (Any one digital design)', included: true },
          { id: '6', name: 'Bi-Weekly Performance Reports', details: 'Reports every week — reach, engagement, ad performance', included: true },
          { id: '7', name: 'WhatsApp Support', details: 'Direct communication with Pioneers team via WhatsApp', included: true },
        ]
      },
      {
        title: 'MONTH 2 — Engagement & Lead Generation',
        subtitle: '',
        price: '15,000',
        services: [
          { id: '1', name: 'Meta Ads (Facebook + Instagram)', details: 'Ads for Distributor/retailer inquiry', included: true },
          { id: '2', name: 'Reels (5 per month)', details: 'Doctor / Chemist Testimonial Reel — A professional endorsement reel featuring a doctor, chemist, or healthcare professional sharing their experience with the brand\'s products.\n\nProduct Benefits Reel — An in-depth reel focusing on one key product — covering active ingredients, clinical benefits, and usage instructions.', included: true },
          { id: '3', name: 'Graphics / Posts (8 per month)', details: '8 posts\n\nDoctor Quote / Endorsement Graphic — A professional testimonial card featuring a doctor\'s recommendation.\n\nChemist / Distributor Feature Post — Acknowledging and featuring a partner chemist or distributor.', included: true },
          { id: '4', name: 'Bi-Weekly Performance Reports', details: 'Reports every week with insights & recommendations', included: true },
          { id: '5', name: 'WhatsApp Support', details: 'Ongoing communication & content approvals via WhatsApp', included: true },
        ]
      },
      {
        title: 'MONTH 3 — CONVERSION & BUSINESS GROWTH',
        subtitle: '',
        price: '15,000',
        services: [
          { id: '1', name: 'Meta Ads (Facebook + Instagram)', details: 'Sales objective ads optimization', included: true },
          { id: '2', name: 'Reels (5 per month)', details: 'Distributor / Dealership Opportunity Reel — A targeted B2B reel encouraging chemists and distributors to partner with the company, highlighting margins and support.', included: true },
          { id: '3', name: 'Graphics / Posts (8 per month)', details: 'Flash Scheme Graphic — A limited-time offer for chemists or distributors with urgency-driven design.\n\nTop 5 Products Graphic — Bestselling products showcase in a ranked or featured format.', included: true },
          { id: '4', name: 'Bi-Weekly Performance Reports', details: 'Final 3-month performance summary report included', included: true },
          { id: '5', name: 'WhatsApp Support', details: 'Ongoing communication & final handoff / renewal discussion', included: true },
        ]
      }
    ],
    addOnServices: [
      { id: '1', name: 'Video Shoot', included: 'One Premium HD Shoot for The Brand', price: '6000/per shoot', quantity: '1 shoot' },
      { id: '2', name: 'WhatsApp Marketing Setup', included: 'Whatsapp bulk message Setup', price: '2000/per month', quantity: '1 month' },
      { id: '3', name: 'Website Development (5-Page)', included: 'Five Pages Website for the business', price: '12,000/one time payment', quantity: '1 project' }
    ],
    termsAndConditions: [
      { id: '1.', title: 'All services are rendered on a monthly basis. Continuity of service depends on timely payment as per the instalment schedule.', details: '' },
      { id: '2.', title: 'Advertisement (ad) budget is NOT included in the package price. Ad spend will be billed separately based on the agreed monthly budget.', details: '' },
      { id: '3.', title: 'Content and creatives require client approval within 48 hours of submission. Delays may affect the monthly content calendar.', details: '' },
      { id: '4.', title: 'A minimum lock-in period of 3 months applies. Early termination will require settlement of any outstanding balance.', details: '' },
      { id: '5.', title: 'Pioneers Digital Marketing Agency retains the right to use content created for portfolio and case study purposes unless explicitly restricted.', details: '' },
      { id: '6.', title: 'This estimate is valid for 15 days from the date of issue. Post validity, prices may be revised.', details: '' },
    ]
  };

  const [contractData, setContractData] = useState<ContractData>(initialData);

  const handleGenerate = async (data: ContractData, testId?: string) => {
    setIsGenerating(true);
    if (testId) setGeneratingId(testId);
    setError(null);
    try {
      // Update local state with the final data from editor
      setContractData(data);

      // Client-side PDF generation
      const generator = new ContractGenerator();
      const pdf = generator.generate(data);
      
      const sanitizedName = (data.clientName || 'Client')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^\w-]/g, '')
        .replace(/_+/g, '_');
      
      const filename = `${sanitizedName}_service_agreement.pdf`;
      setLastGeneratedFilename(filename);

      // Build a properly-typed PDF blob so the browser honours the filename
      const pdfArrayBuffer = pdf.output('arraybuffer');
      const blob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });

      // Revoke the previous stored URL before creating a new one
      if (lastGeneratedUrl) window.URL.revokeObjectURL(lastGeneratedUrl);
      const persistentUrl = window.URL.createObjectURL(blob);
      setLastGeneratedUrl(persistentUrl);

      // Trigger download with the correct filename
      const link = document.createElement('a');
      link.href = persistentUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 200);
      
      setIsEditorOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
      setGeneratingId(null);
    }
  };



  const [lastGeneratedFilename, setLastGeneratedFilename] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-[32px] p-6 md:p-10 border border-zinc-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 mb-8 text-center md:text-left">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 shrink-0">
            <FileText className="w-7 h-7 md:w-8 md:h-8" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Contract Generator</h2>
            <p className="text-zinc-500 text-sm">Generate professional service agreements for any client instantly.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setIsEditorOpen(true)}
            className="flex flex-col items-center justify-center p-6 md:p-8 rounded-[24px] border-2 border-dashed border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group col-span-full py-12 md:py-16"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all mb-4">
              <Plus className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <span className="text-lg md:text-xl font-bold text-zinc-900 text-center px-4">Create New Service Agreement</span>
            <span className="text-xs md:text-sm text-zinc-500 mt-2 text-center px-6">Customize client details, services, and payment terms</span>
          </button>

          {lastGeneratedUrl && (
            <div className="p-8 rounded-[24px] border border-emerald-100 bg-emerald-50/30 flex flex-col items-center justify-center col-span-full">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="font-bold text-emerald-900">Contract Ready</span>
              <button 
                onClick={() => {
                  if (lastGeneratedUrl && lastGeneratedFilename) {
                    const a = document.createElement('a');
                    a.href = lastGeneratedUrl;
                    a.download = lastGeneratedFilename;
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => document.body.removeChild(a), 200);
                  }
                }}
                className="mt-4 flex items-center gap-2 text-sm font-bold text-emerald-700 hover:underline"
              >
                <Download className="w-4 h-4" /> Download Last PDF
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center gap-3 text-rose-600">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </div>

      <div className="bg-indigo-900 rounded-[32px] p-10 text-white overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2">Agency Professionalism</h3>
          <p className="text-indigo-200 text-sm max-w-lg">
            Every contract is generated with PIONEERS branding and high-quality typography. 
            Ensure your client details are accurate before generating the final agreement.
          </p>
        </div>
        <FileText className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
      </div>

      {isEditorOpen && (
        <ContractEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          initialData={contractData}
          onSave={handleGenerate}
        />
      )}

      {isGenerating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 shadow-2xl">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="font-bold text-zinc-900">Generating Professional PDF...</p>
          </div>
        </div>
      )}
    </div>
  );
}
