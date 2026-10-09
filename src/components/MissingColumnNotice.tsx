import React, { useState } from 'react';
import { Info, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { AnalysisResult } from '../types';

interface MissingColumnNoticeProps {
  analysisResult: AnalysisResult;
}

export const MissingColumnNotice: React.FC<MissingColumnNoticeProps> = ({ analysisResult }) => {
  const [expanded, setExpanded] = useState(false);
  const { detectedColumns, missingColumns, mapping } = analysisResult;

  if (missingColumns.length === 0) return null;

  return (
    <div className="w-full mb-6 p-4 rounded-2xl glass-panel border border-amber-500/30 bg-amber-950/20 text-xs text-amber-200 shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="font-semibold text-amber-300">Graceful Schema Adaptation: </span>
            <span>
              {missingColumns.length} optional column{missingColumns.length > 1 ? 's' : ''} not found ({missingColumns.join(', ')}). Corresponding dashboard panels adjusted automatically.
            </span>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 flex items-center gap-1 font-medium transition-colors shrink-0"
        >
          <span>{expanded ? 'Hide Details' : 'View Mapping'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-3 border-t border-amber-500/20 grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
          <div>
            <span className="font-semibold text-emerald-400 flex items-center gap-1 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Detected Columns ({detectedColumns.length}):
            </span>
            <ul className="space-y-1 pl-4 text-slate-300 font-mono list-disc">
              {detectedColumns.map((col, idx) => (
                <li key={idx}>{col}</li>
              ))}
            </ul>
          </div>

          <div>
            <span className="font-semibold text-amber-400 flex items-center gap-1 mb-2">
              <Info className="w-3.5 h-3.5" /> Missing Optional Columns ({missingColumns.length}):
            </span>
            <ul className="space-y-1 pl-4 text-slate-300 font-mono list-disc">
              {missingColumns.map((col, idx) => (
                <li key={idx}>
                  {col} —{' '}
                  <span className="text-slate-400 font-sans">
                    {col === 'Model Prediction'
                      ? 'Confusion matrix & performance panel omitted.'
                      : col === 'Date'
                      ? 'Publication timeline chart omitted.'
                      : 'Default fallback value assigned.'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
