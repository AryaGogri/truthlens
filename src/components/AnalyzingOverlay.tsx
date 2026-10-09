import React, { useEffect, useState } from 'react';
import { ShieldAlert, Cpu, CheckCircle2, Search, FileText } from 'lucide-react';

interface AnalyzingOverlayProps {
  fileName?: string;
}

const STEPS = [
  'Detecting Column Schema & Fuzzy Headers...',
  'Standardizing Real / Fake Ground Truth Labels...',
  'Extracting Distinctive Term Frequencies & Stopwords...',
  'Calculating Category Breakdowns & Timeline Buckets...',
  'Computing Model Confusion Matrix & Accuracy Metrics...',
  'Rendering Interactive Bento BI Dashboard...'
];

export const AnalyzingOverlay: React.FC<AnalyzingOverlayProps> = ({ fileName }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 380);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#090d16]/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-3xl glass-panel border border-teal-500/30 flex flex-col items-center text-center shadow-2xl shadow-teal-950/60 relative overflow-hidden">
        
        {/* Animated Scanline Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/5 to-transparent animate-scanline pointer-events-none" />

        {/* Central Radar Pulse Indicator */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full bg-slate-900 border border-teal-500/40 flex items-center justify-center shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.15)_0,transparent_70%)] animate-ping" />
            <div className="w-16 h-16 rounded-full border border-teal-500/30 border-t-teal-400 animate-spin" />
            <ShieldAlert className="w-8 h-8 text-teal-400 absolute" />
          </div>
          <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/40 text-[10px] font-mono text-teal-300 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-teal-400 animate-pulse" />
            <span>MINING</span>
          </div>
        </div>

        {/* Status Text */}
        <h3 className="font-syne font-bold text-xl text-slate-100 mb-1">
          Analyzing Misinformation Signals
        </h3>

        {fileName && (
          <p className="text-xs text-slate-400 font-mono mb-6 truncate max-w-[280px]">
            {fileName}
          </p>
        )}

        {/* Step Progress Checklist */}
        <div className="w-full bg-slate-900/90 rounded-2xl p-4 border border-slate-800 text-left space-y-2.5 mb-6">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={idx}
                className={`flex items-center gap-2.5 text-xs transition-colors ${
                  isDone
                    ? 'text-teal-400 font-medium'
                    : isCurrent
                    ? 'text-slate-200 font-semibold animate-pulse'
                    : 'text-slate-600'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                ) : isCurrent ? (
                  <Search className="w-4 h-4 text-teal-400 shrink-0 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                )}
                <span className="truncate">{step}</span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-400 h-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
