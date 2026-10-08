import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { APPRAISAL_MOCK_ITEMS } from '@/lib/valuation-data';
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  Calendar,
  MapPin,
  FileText,
  UserCheck,
  TrendingUp,
  AlertCircle,
  Share2,
} from 'lucide-react';

export const metadata = {
  title: 'Appraisal Detail | AIVY Cloud Valuation',
  description: 'Detailed asset valuation dossier, fair market value range, and audit history timeline.',
};

export default async function AppraisalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appraisal = APPRAISAL_MOCK_ITEMS.find((item) => item.id === id) || APPRAISAL_MOCK_ITEMS[0];

  if (!appraisal) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-[#A1E3FF]/30 text-sky-950 border border-[#A1E3FF]">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-sky-700" />
            Certified Final
          </span>
        );
      case 'IN_REVIEW':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-[#FECF6A]/30 text-amber-950 border border-[#FECF6A]">
            <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
            Under Committee Review
          </span>
        );
      case 'INSPECTION':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-[#FFC3A0]/30 text-rose-950 border border-[#FFC3A0]">
            <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-rose-700" />
            Physical Audit in Progress
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Draf Initial
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Navigation Breadcrumb & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {appraisal.assetName}
            </h1>
            {getStatusBadge(appraisal.status)}
          </div>
          <div className="flex items-center space-x-3 text-xs text-slate-500">
            <span className="font-mono bg-white/70 px-2 py-0.5 rounded-lg border border-slate-200/80">
              {appraisal.assetCode}
            </span>
            <span>•</span>
            <span className="flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {appraisal.location}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            type="button"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl bg-white/80 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Share</span>
          </button>
          <a
            href={`/api/export/pdf/session-demo-01`}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-[#FF9A8B] hover:bg-[#FFC3A0] text-slate-900 text-xs sm:text-sm font-bold shadow-soft transition-all active:scale-98"
            download
          >
            <Download className="w-4 h-4 text-slate-900" />
            <span>Download Valuation Dossier</span>
          </a>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Valuation Result & Asset Details */}
        <div className="lg:col-span-2 space-y-7">
          {/* Card 1: Valuation Result Hero Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF9A8B]">
                  Certified Valuation Result
                </span>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
                  ${appraisal.valuationAmount.toLocaleString('en-US')} <span className="text-lg font-bold text-slate-500">USD</span>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400">Baseline Book Value</span>
                <div className="text-base font-bold text-slate-700">
                  ${appraisal.bookValue.toLocaleString('en-US')} USD
                </div>
                <div className="text-[11px] font-semibold text-emerald-700">
                  +{(((appraisal.valuationAmount - appraisal.bookValue) / appraisal.bookValue) * 100).toFixed(1)}% Unrealized Appreciation
                </div>
              </div>
            </div>

            {/* Valuation Range Distribution */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                <span>Conservative Range: ${(appraisal.valuationRange.low / 1000000).toFixed(2)}M</span>
                <span className="text-slate-900 font-bold">Base Valuation: ${(appraisal.valuationRange.mid / 1000000).toFixed(2)}M</span>
                <span>Optimistic Ceiling: ${(appraisal.valuationRange.high / 1000000).toFixed(2)}M</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 flex">
                <div className="w-1/4 h-full bg-[#A1E3FF] rounded-l-full" />
                <div className="w-1/2 h-full bg-[#FF9A8B]" />
                <div className="w-1/4 h-full bg-[#FECF6A] rounded-r-full" />
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                95% Confidence Interval based on 12-month trailing transactional comps & cash-flow yield.
              </p>
            </div>

            {/* Methodology & Notes */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFF5F2]/50 via-[#FFFDF9] to-[#F0FAFF]/50 border border-slate-100 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                <FileText className="w-4 h-4 text-[#FF9A8B]" />
                <span>Methodology Applied: {appraisal.methodology}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {appraisal.summaryNotes}
              </p>
            </div>
          </div>

          {/* Card 2: Asset Specification Details */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Asset Registry Profile
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                <span className="text-slate-400 block mb-1">Asset Category</span>
                <span className="font-bold text-slate-800 text-sm">{appraisal.category}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                <span className="text-slate-400 block mb-1">Valuation Request Date</span>
                <span className="font-bold text-slate-800 text-sm">{appraisal.requestDate}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                <span className="text-slate-400 block mb-1">Geographic Jurisdiction</span>
                <span className="font-bold text-slate-800 text-sm">{appraisal.location}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                <span className="text-slate-400 block mb-1">Reporting Standard</span>
                <span className="font-bold text-slate-800 text-sm">IFRS 13 & International Valuation Standards</span>
              </div>
            </div>
          </div>

          {/* Card 3: History Timeline */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Appraisal Progression Timeline
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Full multi-stage verifiable audit log from initiation to certification.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700">
                Stage {appraisal.timeline.filter((t) => t.completed).length} of {appraisal.timeline.length}
              </span>
            </div>

            {/* Step Timeline */}
            <div className="relative pl-6 space-y-7 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {appraisal.timeline.map((step, idx) => (
                <div key={step.title} className="relative group">
                  {/* Indicator Dot */}
                  <div
                    className={`absolute -left-6 top-0 w-4 h-4 rounded-full border-2 transition ${
                      step.completed
                        ? 'bg-emerald-500 border-white shadow-xs'
                        : step.current
                        ? 'bg-[#FF9A8B] border-white shadow-soft ring-4 ring-[#FF9A8B]/20'
                        : 'bg-slate-300 border-white'
                    }`}
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {step.title}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {step.date}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                    <div className="text-[11px] font-medium text-slate-400 pt-0.5">
                      Actor: <span className="text-slate-700">{step.actor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Appraiser Info & Certification Seals */}
        <div className="space-y-6">
          {/* Appraiser Profile Card */}
          <div className="glass-card rounded-3xl p-6 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Assigned Lead Appraiser
            </h3>
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF9A8B] via-[#FFC3A0] to-[#A1E3FF] flex items-center justify-center font-black text-slate-900 text-sm shadow-soft">
                ER
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">
                  {appraisal.appraiserName}
                </div>
                <div className="text-xs text-slate-500">{appraisal.appraiserRole}</div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5 flex items-center">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Licensed & Bonded
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Accreditation:</span>
                <span className="font-semibold text-slate-800">RICS / ASA Accredited</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Digital Signature:</span>
                <span className="font-mono text-[10px] text-slate-800">SHA256: 9b8f...4e1a</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quality Score:</span>
                <span className="font-bold text-emerald-700">100% Peer Verified</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Workflow Management
            </h3>
            <div className="space-y-2">
              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-soft transition flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Sign & Finalize Certificate</span>
              </button>
              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
              >
                Request Appraisal Revision
              </button>
            </div>
          </div>

          {/* Standards & Regulatory Stamp */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#FFF5F2] via-[#FFFDF9] to-[#F0FAFF] border border-[#FF9A8B]/30 space-y-2.5">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-[#FF9A8B]" />
              <span>Audit Trail Integrity</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every appraisal calculation in AIVY is cryptographically timestamped and stored in immutable cloud audit vaults.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
