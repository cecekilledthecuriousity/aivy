import React from 'react';
import Link from 'next/link';
import {
  APPRAISAL_MOCK_ITEMS,
} from '@/lib/valuation-data';
import { ValuationTrendChart } from '@/components/charts/valuation-trend-chart';
import {
  Boxes,
  DollarSign,
  Clock,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Building2,
  Cpu,
  Zap,
  Truck,
} from 'lucide-react';

export const metadata = {
  title: 'Portfolio Dashboard | AIVY Cloud Appraisal',
  description: 'Enterprise valuation overview, portfolio asset trends, and real-time appraisal workflows.',
};

export default function DashboardPage() {
  const totalAssets = 248;
  const totalValuation = '$184.6M';
  const pendingCount = APPRAISAL_MOCK_ITEMS.filter((i) => i.status !== 'COMPLETED').length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Commercial Real Estate':
        return Building2;
      case 'Industrial Machinery':
        return Cpu;
      case 'Enterprise Software & IP':
        return Boxes;
      case 'Renewable Energy':
        return Zap;
      case 'Corporate Fleet':
        return Truck;
      default:
        return Boxes;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#A1E3FF]/30 text-sky-950 border border-[#A1E3FF]">
            Certified
          </span>
        );
      case 'IN_REVIEW':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#FECF6A]/30 text-amber-950 border border-[#FECF6A]">
            In Review
          </span>
        );
      case 'INSPECTION':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#FFC3A0]/30 text-rose-950 border border-[#FFC3A0]">
            Audit / Inspection
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Valuation Overview
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time portfolio fair market value, audit trails, and active asset appraisals.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assets or codes..."
              className="pl-10 pr-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#FF9A8B] transition shadow-xs w-60"
            />
          </div>

          <Link
            href="/appraisals/aivy-8841"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#FF9A8B] hover:bg-[#FFC3A0] text-slate-900 font-bold text-xs sm:text-sm rounded-2xl shadow-soft hover:shadow-md transition-all active:scale-98"
          >
            <Plus className="w-4 h-4 text-slate-900" />
            <span>New Appraisal</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Total Assets */}
        <div className="glass-card rounded-3xl p-6 relative overflow-hidden transition hover:translate-y-[-2px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Managed Assets
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#A1E3FF]/30 text-sky-950 flex items-center justify-center">
              <Boxes className="w-5 h-5 text-sky-800" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalAssets}
            </span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              +12 Q3
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Active industrial, real estate, and IP registries across 6 regions.
          </p>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#A1E3FF]/15 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 2: Total Valuation Portfolio */}
        <div className="glass-card rounded-3xl p-6 relative overflow-hidden transition hover:translate-y-[-2px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Portfolio Valuation
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FF9A8B]/30 text-rose-950 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-rose-800" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalValuation}
            </span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              +8.4% YoY
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Fair Market Value (FMV) assessed under IFRS 13 & IVSC guidance.
          </p>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#FF9A8B]/15 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 3: Pending Appraisals */}
        <div className="glass-card rounded-3xl p-6 relative overflow-hidden transition hover:translate-y-[-2px] sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Appraisals
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FECF6A]/30 text-amber-950 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-800" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {pendingCount}
            </span>
            <span className="inline-flex items-center text-xs font-bold text-amber-800 bg-[#FECF6A]/20 px-2 py-0.5 rounded-lg border border-[#FECF6A]/40">
              3 High Priority
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Average turnaround time 4.2 business days per certified report.
          </p>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#FECF6A]/15 rounded-full blur-xl pointer-events-none" />
        </div>
      </section>

      {/* Valuation Trends Line Chart */}
      <section>
        <ValuationTrendChart />
      </section>

      {/* Recent Appraisals Table Section */}
      <section className="glass-card rounded-3xl p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Recent Appraisals & Valuations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Latest audited asset valuation files and committee reviews.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white/70 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filter Class</span>
            </button>
            <span className="text-xs text-slate-400">
              Showing 5 of {APPRAISAL_MOCK_ITEMS.length}
            </span>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Asset Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Valuation (FMV)</th>
                <th className="py-3 px-4">Lead Appraiser</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {APPRAISAL_MOCK_ITEMS.map((item) => {
                const Icon = getCategoryIcon(item.category);
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-white/80 transition-colors group"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FF9A8B]/20 group-hover:text-[#FF9A8B] transition">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <Link
                            href={`/appraisals/${item.id}`}
                            className="font-bold text-slate-900 hover:text-[#FF9A8B] transition line-clamp-1"
                          >
                            {item.assetName}
                          </Link>
                          <div className="text-xs text-slate-400 font-mono">
                            {item.assetCode}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs font-medium text-slate-600">
                      {item.category}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="font-extrabold text-slate-900">
                        ${(item.valuationAmount / 1000000).toFixed(2)}M
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Book: ${(item.bookValue / 1000000).toFixed(2)}M
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-xs font-semibold text-slate-800">
                        {item.appraiserName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.appraiserRole}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/appraisals/${item.id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:border-[#FF9A8B] hover:bg-[#FF9A8B]/10 transition shadow-2xs"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="w-3 h-3 ml-0.5 text-slate-400" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
