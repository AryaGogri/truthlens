import React, { useEffect, useState } from 'react';
import { FileText, ShieldCheck, ShieldAlert, Percent, Award, ArrowUpRight, TrendingUp } from 'lucide-react';
import { DatasetMetrics } from '../types';

interface KpiRowProps {
  metrics: DatasetMetrics;
}

// Custom animated counter hook
function useCountUp(endValue: number | null, duration: number = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (endValue === null || isNaN(endValue)) return;
    
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out quad
      const easedProgress = progress * (2 - progress);
      setCount(Math.floor(easedProgress * endValue));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(endValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [endValue, duration]);

  return count;
}

export const KpiRow: React.FC<KpiRowProps> = ({ metrics }) => {
  const {
    totalArticles,
    realCount,
    fakeCount,
    fakePercentage,
    hasPerformanceData,
    accuracy
  } = metrics;

  const animTotal = useCountUp(totalArticles);
  const animReal = useCountUp(realCount);
  const animFake = useCountUp(fakeCount);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 mb-6">
      
      {/* 1. Total Articles */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel glass-panel-hover border border-slate-800/90 relative overflow-hidden group flex flex-col justify-between min-h-[140px]">
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Articles
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="font-syne font-extrabold text-3xl sm:text-4xl text-slate-100 mb-1 tracking-tight tabular-nums">
            {animTotal.toLocaleString()}
          </div>
        </div>
        <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 pt-2 border-t border-slate-800/60">
          <DatabaseIcon className="w-3.5 h-3.5 text-cyan-400 inline shrink-0" />
          <span>Ingested & Processed</span>
        </div>
      </div>

      {/* 2. Real News Count */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel glass-panel-hover border border-emerald-500/25 relative overflow-hidden group flex flex-col justify-between min-h-[140px]">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Verified Real
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="font-syne font-extrabold text-3xl sm:text-4xl text-emerald-300 mb-1 tracking-tight tabular-nums">
            {animReal.toLocaleString()}
          </div>
        </div>
        <div className="text-[11px] text-emerald-400/90 font-medium flex items-center justify-between pt-2 border-t border-emerald-500/15">
          <span>{totalArticles > 0 ? ((realCount / totalArticles) * 100).toFixed(1) : 0}% of Dataset</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-300">Real</span>
        </div>
      </div>

      {/* 3. Fake News Count */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel glass-panel-hover border border-rose-500/25 relative overflow-hidden group flex flex-col justify-between min-h-[140px]">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
              Flagged Fake
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="font-syne font-extrabold text-3xl sm:text-4xl text-rose-300 mb-1 tracking-tight tabular-nums">
            {animFake.toLocaleString()}
          </div>
        </div>
        <div className="text-[11px] text-rose-400/90 font-medium flex items-center justify-between pt-2 border-t border-rose-500/15">
          <span>{fakePercentage}% of Dataset</span>
          <span className="px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-[10px] font-bold text-rose-300">Fake</span>
        </div>
      </div>

      {/* 4. Fake Ratio Meter */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel glass-panel-hover border border-amber-500/25 relative overflow-hidden group flex flex-col justify-between min-h-[140px]">
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Misinformation Density
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="font-syne font-extrabold text-3xl sm:text-4xl text-amber-300 mb-1 tracking-tight tabular-nums">
            {fakePercentage}%
          </div>
        </div>
        {/* Progress Bar */}
        <div className="pt-2 border-t border-amber-500/15">
          <div className="w-full bg-slate-800/90 rounded-full h-2 overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(fakePercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5. Overall Model Accuracy */}
      <div className={`p-5 sm:p-6 rounded-2xl glass-panel glass-panel-hover border relative overflow-hidden group flex flex-col justify-between min-h-[140px] ${
        hasPerformanceData ? 'border-teal-500/30' : 'border-slate-800/60 opacity-70'
      }`}>
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">
              Model Accuracy
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          {hasPerformanceData && accuracy !== null ? (
            <div className="font-syne font-extrabold text-3xl sm:text-4xl text-teal-300 mb-1 tracking-tight tabular-nums">
              {(accuracy * 100).toFixed(1)}%
            </div>
          ) : (
            <div className="font-syne font-bold text-2xl text-slate-500 mb-1">
              N/A
            </div>
          )}
        </div>

        {hasPerformanceData && accuracy !== null ? (
          <div className="text-[11px] text-teal-400/90 font-medium flex items-center gap-1.5 pt-2 border-t border-teal-500/15">
            <TrendingUp className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>Ground Truth Verified</span>
          </div>
        ) : (
          <p className="text-[10px] text-slate-500 font-medium pt-2 border-t border-slate-800/60">
            Requires 'Predicted' column
          </p>
        )}
      </div>

    </div>
  );
};

function DatabaseIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  );
}
