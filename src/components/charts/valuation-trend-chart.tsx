'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { VALUATION_TREND_DATA } from '@/lib/valuation-data';
import { TrendingUp, Calendar } from 'lucide-react';

export function ValuationTrendChart() {
  const [timeframe, setTimeframe] = useState<'6M' | '1Y'>('1Y');

  const chartData = timeframe === '6M' ? VALUATION_TREND_DATA.slice(-6) : VALUATION_TREND_DATA;

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-7 space-y-6">
      {/* Header with Title and Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#FF9A8B]/20 text-slate-900 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#FF9A8B]" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Valuation Growth & Portfolio Trends
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Aggregated fair market valuation against indexed acquisition benchmarks (in $ Millions).
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-100/80 rounded-2xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTimeframe('6M')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
              timeframe === '6M'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Last 6 Months
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('1Y')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
              timeframe === '1Y'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Year to Date (10M)
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[280px] sm:h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {/* Sunrise Coral Gradient */}
              <linearGradient id="coralSunrise" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF9A8B" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#FF9A8B" stopOpacity={0.0} />
              </linearGradient>
              {/* Sky Blue Gradient */}
              <linearGradient id="skySunrise" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A1E3FF" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#A1E3FF" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="month"
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 10', 'dataMax + 10']}
              tickFormatter={(v) => `$${v}M`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-soft text-xs space-y-1.5">
                      <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Month: {label} 2026</span>
                      </div>
                      <div className="flex items-center justify-between space-x-4">
                        <span className="text-slate-600 flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FF9A8B] inline-block" />
                          <span>Fair Valuation:</span>
                        </span>
                        <span className="font-extrabold text-slate-900">
                          ${payload[0]?.value}M
                        </span>
                      </div>
                      <div className="flex items-center justify-between space-x-4">
                        <span className="text-slate-600 flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#A1E3FF] inline-block" />
                          <span>Acquisition Baseline:</span>
                        </span>
                        <span className="font-semibold text-slate-700">
                          ${payload[1]?.value}M
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
            />
            <Area
              type="monotone"
              dataKey="portfolioValue"
              name="Market Valuation ($M)"
              stroke="#FF9A8B"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#coralSunrise)"
            />
            <Area
              type="monotone"
              dataKey="benchmark"
              name="Acquisition Benchmark ($M)"
              stroke="#38BDF8"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#skySunrise)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
