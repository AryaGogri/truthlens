import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Sparkles, CheckCircle2, HelpCircle, ArrowRight, AlertCircle, FileText, Download, Database } from 'lucide-react';
import { SAMPLE_CSV_CONTENT } from '../data/sampleDataset';

interface UploadScreenProps {
  onFileUpload: (file: File) => void;
  onLoadSample: () => void;
  error: string | null;
  clearError: () => void;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({
  onFileUpload,
  onLoadSample,
  error,
  clearError
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    clearError();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv') || droppedFile.type === 'text/csv') {
        onFileUpload(droppedFile);
      } else {
        alert('Please upload a valid .csv file.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError();
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handleDownloadSampleCSV = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'truthlens_fake_news_dataset_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col justify-between items-center px-4 py-8 lg:py-12 overflow-hidden">
      {/* Background Kinetic Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-teal-600/20 via-emerald-600/10 to-cyan-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-gradient-to-br from-rose-600/10 to-amber-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
        
        {/* Investigative Journalism / BI Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-teal-500/30 text-xs font-semibold text-teal-300 shadow-xl shadow-teal-950/20 mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Data Mining & Business Intelligence Engine</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </div>

        {/* Hero Headline */}
        <h1 className="font-syne font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-100 tracking-tight leading-[1.1] max-w-4xl mb-6">
          Expose the patterns behind <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-teal-300 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            misinformation & fake news
          </span>
        </h1>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed mb-10">
          Upload any article classification dataset to instantly compute confusion matrices, keyword distinctive rank frequencies, category breakdowns, and timeline propagation trends.
        </p>

        {/* Error State Banner */}
        {error && (
          <div className="w-full max-w-2xl mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-sm flex items-start gap-3 text-left shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-rose-300">File Processing Error: </span>
              {error}
            </div>
            <button
              onClick={clearError}
              className="text-xs text-rose-400 hover:text-rose-200 underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Drag & Drop Zone */}
        <div className="w-full max-w-2xl mb-8">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative group cursor-pointer p-8 sm:p-12 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center border-2 border-dashed ${
              isDragging
                ? 'bg-teal-950/40 border-teal-400 scale-[1.01] shadow-2xl shadow-teal-500/20'
                : 'glass-panel border-slate-700/80 hover:border-teal-500/60 hover:bg-slate-900/80'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".csv"
              className="hidden"
            />

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 via-slate-800 to-slate-900 border border-teal-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-teal-950/40">
              <Upload className="w-8 h-8 text-teal-400 group-hover:text-teal-300 transition-colors" />
            </div>

            <h3 className="font-syne font-bold text-xl text-slate-100 mb-2">
              Drop your CSV dataset here, or <span className="text-teal-400 underline decoration-teal-500/40 underline-offset-4">browse files</span>
            </h3>

            <p className="text-xs text-slate-400 max-w-md mb-6">
              Supports standard dataset schemas with automatic column header detection.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800">
              <span className="text-teal-400 font-semibold">Auto-Detects:</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Title</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Text</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Subject</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Date</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Label</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Predicted</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Confidence</span>
            </div>
          </div>
        </div>

        {/* Demo Dataset CTA & Sample CSV Download */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <button
            onClick={onLoadSample}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2.5 transition-all shadow-xl shadow-teal-950/60 hover:shadow-teal-500/25 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Load Interactive Sample Dataset</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownloadSampleCSV}
            className="px-5 py-3 rounded-xl glass-panel hover:bg-slate-800 text-slate-200 font-medium text-sm flex items-center gap-2 transition-all border border-slate-700/80 active:scale-95"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Download Sample .CSV File</span>
          </button>

          <button
            onClick={() => setShowFormatModal(!showFormatModal)}
            className="px-4 py-3 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Expected Schema Info</span>
          </button>
        </div>

        {/* Schema Format Helper Popover / Details */}
        {showFormatModal && (
          <div className="w-full max-w-2xl p-6 rounded-2xl glass-panel border border-slate-700 text-left mb-10 text-xs text-slate-300 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-syne font-bold text-sm text-slate-100 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-teal-400" />
                TruthLens Fuzzy Column Header Matching
              </h4>
              <button
                onClick={() => setShowFormatModal(false)}
                className="text-slate-500 hover:text-slate-300 font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-400">
              The engine automatically maps column headers regardless of exact casing or naming convention:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="text-teal-400 font-semibold">Title / Headline:</span> title, headline, news_title
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="text-teal-400 font-semibold">Text / Content:</span> text, content, body, article
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="text-teal-400 font-semibold">Subject / Category:</span> subject, category, topic, tag
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="text-teal-400 font-semibold">Date / Timestamp:</span> date, published, time, created_at
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="text-teal-400 font-semibold">Ground Truth Label:</span> label, actual, class, is_fake
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="text-teal-400 font-semibold">Model Prediction:</span> predicted, prediction, output
              </div>
            </div>
            <div className="p-3 rounded-lg bg-teal-950/30 border border-teal-500/20 text-teal-300 text-[11px] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-400" />
              <span>Missing optional columns (like Date or Predicted) won't cause errors; non-applicable chart panels will simply adjust automatically.</span>
            </div>
          </div>
        )}

        {/* Feature Highlights Bento Row */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-5 rounded-2xl glass-panel border border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-3">
              <Database className="w-4 h-4" />
            </div>
            <h4 className="font-syne font-bold text-sm text-slate-200 mb-1">Client-Side Privacy</h4>
            <p className="text-xs text-slate-400">
              100% in-browser processing via WebAssembly parsing. Your articles and raw datasets never leave your machine.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-syne font-bold text-sm text-slate-200 mb-1">Distinctive Word Extract</h4>
            <p className="text-xs text-slate-400">
              Automatically strips English stopwords to isolate high-frequency clickbait tokens vs verified reporting keywords.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="font-syne font-bold text-sm text-slate-200 mb-1">Confusion Matrix & Metrics</h4>
            <p className="text-xs text-slate-400">
              Generates Precision, Recall, F1 Score, and Specificity metrics when actual & predicted label columns are present.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
