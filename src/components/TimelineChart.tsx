import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { TimelineDataPoint } from '../types';

interface TimelineChartProps {
  data: TimelineDataPoint[];
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'split' | 'total'>('split');

  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-3xl glass-panel border border-slate-800/90 flex flex-col items-center justify-center text-center h-[380px]">
        <Calendar className="w-10 h-10 text-slate-600 mb-3" />
        <h4 className="font-syne font-bold text-slate-300 text-sm mb-1">No Date Metadata Detected</h4>
        <p className="text-xs text-slate-500 max-w-sm">
          The uploaded dataset does not contain valid publication date headers (e.g. 'date', 'published'). Publication trend timeline is unavailable.
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const realVal = payload.find((p: any) => p.dataKey === 'real')?.value || 0;
      const fakeVal = payload.find((p: any) => p.dataKey === 'fake')?.value || 0;
      const total = payload.find((p: any) => p.dataKey === 'total')?.value || (realVal + fakeVal);

      return (
        <div className="glass-panel p-3.5 rounded-xl border border-slate-700 shadow-2xl text-xs space-y-2">
          <div className="font-syne font-bold text-slate-100 text-sm border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
            <span>{label}</span>
            <span className="font-mono text-teal-400 text-xs">{total} Articles</span>
          </div>
          <div className="space-y-1 font-mono">
            <div className="flex items-center justify-between gap-4 text-emerald-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Real News:
              </span>
              <span className="font-bold">{realVal}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-rose-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Fake News:
              </span>
              <span className="font-bold">{fakeVal}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl glass-panel border border-slate-800/90 flex flex-col h-full shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-syne font-bold text-lg sm:text-xl text-slate-100 tracking-tight">
              Publication Trend Over Time
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Temporal propagation volume auto-bucketed by date intervals
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              viewMode === 'split'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Real vs Fake
          </button>
          <button
            onClick={() => setViewMode('total')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              viewMode === 'total'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Total Volume
          </button>
        </div>
      </div>

      {/* Area Chart Container */}
      <div className="w-full h-[320px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorFake" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
            />

            {viewMode === 'split' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="real"
                  name="Verified Real"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorReal)"
                />
                <Area
                  type="monotone"
                  dataKey="fake"
                  name="Flagged Fake"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorFake)"
                />
              </>
            ) : (
              <Area
                type="monotone"
                dataKey="total"
                name="Total Articles"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
