import React from 'react';
import { ShieldAlert, FileText, Upload, Download, Sparkles, Database, Layers } from 'lucide-react';
import { AnalysisResult } from '../types';

interface HeaderProps {
  analysisResult: AnalysisResult | null;
  onNewUploadClick: () => void;
  onLoadSampleClick: () => void;
  onExportReport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  analysisResult,
  onNewUploadClick,
  onLoadSampleClick,
  onExportReport
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onNewUploadClick}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-emerald-600 to-cyan-700 p-0.5 shadow-lg shadow-teal-950/40 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0b0f17] rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-teal-400 group-hover:text-teal-300 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-syne font-bold text-xl tracking-tight text-slate-100 group-hover:text-white transition-colors">
                Truth<span className="text-teal-400">Lens</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                BI Engine v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Misinformation Intelligence & Fake News Analytics
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {analysisResult ? (
            <>
              {/* Dataset Metadata Badge */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <Database className="w-3.5 h-3.5 text-teal-400" />
                <span className="font-medium text-slate-200 truncate max-w-[140px]">
                  {analysisResult.fileName}
                </span>
                <span className="text-slate-500">•</span>
                <span className="font-mono text-teal-300">{analysisResult.rowCount.toLocaleString()} articles</span>
              </div>

              {/* Export Button */}
              {onExportReport && (
                <button
                  onClick={onExportReport}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                  title="Export Analysis Report"
                >
                  <Download className="w-3.5 h-3.5 text-teal-400" />
                  <span className="hidden md:inline">Export Report</span>
                </button>
              )}

              {/* Upload Different File Button */}
              <button
                onClick={onNewUploadClick}
                className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-teal-950/50 hover:shadow-teal-500/20 active:scale-95"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>New Dataset</span>
              </button>
            </>
          ) : (
            <>
              {/* Sample Dataset Loader Button */}
              <button
                onClick={onLoadSampleClick}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500/20 to-emerald-500/20 hover:from-teal-500/30 hover:to-emerald-500/30 text-teal-300 border border-teal-500/30 font-medium text-xs flex items-center gap-2 transition-all active:scale-95 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                <span>Try Sample Dataset</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
