import React from 'react';
import { X, ShieldCheck, ShieldAlert, Calendar, Tag, AlertTriangle, Copy, Check, Sparkles } from 'lucide-react';
import { RawArticle } from '../types';

interface ArticleModalProps {
  article: RawArticle | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!article) return null;

  const isMismatch = article.label !== article.predicted;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${article.title}\n\n${article.text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090d16]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl glass-panel border border-slate-700 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-900/50">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {article.label === 'Real' ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ground Truth: Real</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 font-bold text-xs">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Ground Truth: Fake</span>
                </span>
              )}

              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono flex items-center gap-1">
                <Tag className="w-3 h-3 text-teal-400" />
                {article.subject}
              </span>

              {article.date && (
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {article.date}
                </span>
              )}
            </div>

            <h3 className="font-syne font-bold text-xl text-slate-100 leading-snug">
              {article.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          
          {/* Classification Stats Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Model Prediction</span>
              <span className={`font-mono font-bold text-sm ${
                article.predicted === 'Real' ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {article.predicted}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Classifier Confidence</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-teal-400 h-full rounded-full"
                    style={{ width: `${Math.round(article.confidence * 100)}%` }}
                  />
                </div>
                <span className="font-mono font-bold text-teal-300">
                  {(article.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Verification Status</span>
              {isMismatch ? (
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Model Error (Mismatch)
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Classification Match
                </span>
              )}
            </div>
          </div>

          {/* Full Text Display */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Full Article Text
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-slate-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {article.text}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
