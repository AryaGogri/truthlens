import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Layers, BarChart2, Filter } from 'lucide-react';
import { SubjectBreakdown } from '../types';

interface SubjectChartProps {
  data: SubjectBreakdown[];
}

export const SubjectChart: React.FC<SubjectChartProps> = ({ data }) => {
  const [chartMode, setChartMode] = useState<'grouped' | 'stacked'>('grouped');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(d => 
    d.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const realVal = payload.find((p: any) => p.dataKey === 'real')?.value || 0;
      const fakeVal = payload.find((p: any) => p.dataKey === 'fake')?.value || 0;
      const total = realVal + fakeVal;
      const fakeRatio = total > 0 ? ((fakeVal / total) * 100).toFixed(1) : '0';

      return (
        <div className="glass-panel p-3.5 rounded-xl border border-slate-700 shadow-2xl text-xs space-y-2">
          <div className="font-syne font-bold text-slate-100 text-sm border-b border-slate-800 pb-1.5 flex items-center justify-between gap-3">
            <span>{label}</span>
            <span className="font-mono text-slate-400 text-xs">{total} Total</span>
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
            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between gap-4 text-amber-300 font-sans">
              <span>Fake Ratio:</span>
              <span className="font-bold font-mono">{fakeRatio}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl glass-panel border border-slate-800/90 flex flex-col h-full shadow-xl">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400 shrink-0">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h3 className="font-syne font-bold text-lg sm:text-xl text-slate-100 tracking-tight">
              Distribution by Subject / Category
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Comparative volume of Real vs Flagged Fake news across domain topics
          </p>
        </div>

        {/* View Toggles & Search */}
        <div className="flex items-center gap-2">
          {/* Search Subject Filter */}
          {data.length > 5 && (
            <div className="relative">
              <input
                type="text"
                placeholder="Filter category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-32 sm:w-40 px-3 py-1.5 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
              />
            </div>
          )}

          {/* Grouped / Stacked Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setChartMode('grouped')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                chartMode === 'grouped'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Grouped
            </button>
            <button
              onClick={() => setChartMode('stacked')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                chartMode === 'stacked'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Stacked
            </button>
          </div>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="w-full h-[320px] pt-2">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="subject"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                angle={-15}
                textAnchor="end"
                interval={0}
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
                formatter={(value) => (
                  <span className="text-slate-300 font-medium text-xs capitalize">
                    {value === 'real' ? 'Verified Real' : 'Flagged Fake'}
                  </span>
                )}
              />
              <Bar
                dataKey="real"
                name="real"
                fill="#10b981"
                stackId={chartMode === 'stacked' ? 'a' : undefined}
                radius={chartMode === 'grouped' ? [6, 6, 0, 0] : [0, 0, 0, 0]}
              />
              <Bar
                dataKey="fake"
                name="fake"
                fill="#f43f5e"
                stackId={chartMode === 'stacked' ? 'a' : undefined}
                radius={chartMode === 'stacked' ? [6, 6, 0, 0] : [6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
            No subjects match your filter term "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
};
