import React from 'react';
import { Cpu, HelpCircle, CheckCircle2, AlertOctagon, Target, Activity } from 'lucide-react';
import { DatasetMetrics } from '../types';

interface ConfusionMatrixPanelProps {
  metrics: DatasetMetrics;
}

export const ConfusionMatrixPanel: React.FC<ConfusionMatrixPanelProps> = ({ metrics }) => {
  const {
    hasPerformanceData,
    accuracy,
    precision,
    recall,
    f1Score,
    truePositives: tp,
    trueNegatives: tn,
    falsePositives: fp,
    falseNegatives: fn
  } = metrics;

  if (!hasPerformanceData) {
    return (
      <div className="p-6 rounded-3xl glass-panel border border-slate-800/90 flex flex-col items-center justify-center text-center h-full">
        <Cpu className="w-10 h-10 text-slate-600 mb-3" />
        <h4 className="font-syne font-bold text-slate-300 text-sm mb-1">
          Confusion Matrix Unavailable
        </h4>
        <p className="text-xs text-slate-500 max-w-sm">
          Both ground truth 'Label' and ML model 'Predicted' columns are required to construct the evaluation matrix.
        </p>
      </div>
    );
  }

  const totalEvaluated = tp + tn + fp + fn;

  // Calculate intensity ratios
  const tpRatio = totalEvaluated > 0 ? (tp / totalEvaluated) * 100 : 0;
  const tnRatio = totalEvaluated > 0 ? (tn / totalEvaluated) * 100 : 0;
  const fpRatio = totalEvaluated > 0 ? (fp / totalEvaluated) * 100 : 0;
  const fnRatio = totalEvaluated > 0 ? (fn / totalEvaluated) * 100 : 0;

  return (
    <div className="p-6 sm:p-7 rounded-3xl glass-panel border border-slate-800/90 flex flex-col h-full shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400 shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="font-syne font-bold text-lg sm:text-xl text-slate-100 tracking-tight">
              Model Performance Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            2x2 Confusion Matrix evaluating model predictions against actual labels
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-[11px] font-mono font-semibold text-teal-300 flex items-center gap-1.5 self-start sm:self-auto">
          <Activity className="w-3.5 h-3.5 text-teal-400" />
          <span>N = {totalEvaluated} Samples</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center flex-1">
        
        {/* 2x2 Matrix Display */}
        <div className="lg:col-span-7 space-y-2">
          
          {/* Top Column Labels */}
          <div className="grid grid-cols-3 text-center text-xs font-semibold text-slate-400 pl-16">
            <div className="text-rose-400">Predicted Fake</div>
            <div className="text-emerald-400">Predicted Real</div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            
            {/* Left Row Labels */}
            <div className="col-span-3 flex flex-col justify-around text-xs font-semibold text-slate-400 pr-2 text-right">
              <div className="text-rose-400 py-4">Actual Fake</div>
              <div className="text-emerald-400 py-4">Actual Real</div>
            </div>

            {/* Matrix Cells */}
            <div className="col-span-9 grid grid-cols-2 gap-2.5">
              
              {/* TP: True Fake */}
              <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 relative overflow-hidden group hover:border-rose-400 transition-colors">
                <div className="flex items-center justify-between text-[11px] text-rose-300 mb-1">
                  <span className="font-bold">True Positive (TP)</span>
                  <span className="font-mono font-semibold">{tpRatio.toFixed(1)}%</span>
                </div>
                <div className="font-syne font-extrabold text-2xl sm:text-3xl text-rose-200 tabular-nums">
                  {tp.toLocaleString()}
                </div>
                <p className="text-[10px] text-rose-400/90 mt-1 font-medium">
                  Correctly identified Fake news
                </p>
              </div>

              {/* FN: False Real */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 relative overflow-hidden group hover:border-amber-400 transition-colors">
                <div className="flex items-center justify-between text-[11px] text-amber-300 mb-1">
                  <span className="font-bold">False Negative (FN)</span>
                  <span className="font-mono font-semibold">{fnRatio.toFixed(1)}%</span>
                </div>
                <div className="font-syne font-extrabold text-2xl sm:text-3xl text-amber-200 tabular-nums">
                  {fn.toLocaleString()}
                </div>
                <p className="text-[10px] text-amber-400/90 mt-1 font-medium">
                  Fake news missed by model
                </p>
              </div>

              {/* FP: False Fake */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 relative overflow-hidden group hover:border-amber-400 transition-colors">
                <div className="flex items-center justify-between text-[11px] text-amber-300 mb-1">
                  <span className="font-bold">False Positive (FP)</span>
                  <span className="font-mono font-semibold">{fpRatio.toFixed(1)}%</span>
                </div>
                <div className="font-syne font-extrabold text-2xl sm:text-3xl text-amber-200 tabular-nums">
                  {fp.toLocaleString()}
                </div>
                <p className="text-[10px] text-amber-400/90 mt-1 font-medium">
                  Real news misflagged as Fake
                </p>
              </div>

              {/* TN: True Real */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 relative overflow-hidden group hover:border-emerald-400 transition-colors">
                <div className="flex items-center justify-between text-[11px] text-emerald-300 mb-1">
                  <span className="font-bold">True Negative (TN)</span>
                  <span className="font-mono font-semibold">{tnRatio.toFixed(1)}%</span>
                </div>
                <div className="font-syne font-extrabold text-2xl sm:text-3xl text-emerald-200 tabular-nums">
                  {tn.toLocaleString()}
                </div>
                <p className="text-[10px] text-emerald-400/90 mt-1 font-medium">
                  Correctly identified Real news
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Statistical Metrics Tiles */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">Accuracy</span>
            <div className="font-syne font-bold text-xl text-teal-300 my-0.5">
              {accuracy !== null ? `${(accuracy * 100).toFixed(1)}%` : 'N/A'}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">(TP+TN) / Total</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">Precision</span>
            <div className="font-syne font-bold text-xl text-emerald-300 my-0.5">
              {precision !== null ? `${(precision * 100).toFixed(1)}%` : 'N/A'}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">TP / (TP+FP)</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">Recall / Sensitivity</span>
            <div className="font-syne font-bold text-xl text-rose-300 my-0.5">
              {recall !== null ? `${(recall * 100).toFixed(1)}%` : 'N/A'}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">TP / (TP+FN)</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">F1 Score</span>
            <div className="font-syne font-bold text-xl text-cyan-300 my-0.5">
              {f1Score !== null ? f1Score.toFixed(3) : 'N/A'}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Harmonic Mean</span>
          </div>

        </div>

      </div>

    </div>
  );
};
