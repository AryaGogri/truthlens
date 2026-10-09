import React, { useState } from 'react';
import { Type, Search, ShieldCheck, ShieldAlert, Sparkles, SlidersHorizontal } from 'lucide-react';
import { KeywordAnalysis, KeywordItem } from '../types';

interface KeywordPanelProps {
  keywords: KeywordAnalysis;
}

export const KeywordPanel: React.FC<KeywordPanelProps> = ({ keywords }) => {
  const [activeTab, setActiveTab] = useState<'fake' | 'real'>('fake');
  const [filterTerm, setFilterTerm] = useState('');
  const [viewStyle, setViewStyle] = useState<'bars' | 'cloud'>('bars');

  const listToDisplay = activeTab === 'fake' ? keywords.fakeKeywords : keywords.realKeywords;

  const filteredKeywords = listToDisplay.filter(k => 
    k.word.toLowerCase().includes(filterTerm.toLowerCase())
  );

  const maxCount = listToDisplay.length > 0 ? Math.max(...listToDisplay.map(k => k.count)) : 1;

  return (
    <div className="p-6 sm:p-7 rounded-3xl glass-panel border border-slate-800/90 flex flex-col h-full shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <Type className="w-4 h-4" />
            </div>
            <h3 className="font-syne font-bold text-lg sm:text-xl text-slate-100 tracking-tight">
              Distinctive Keywords & Vocabulary
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Top token frequencies after English stopword filtering
          </p>
        </div>

        {/* Tab Toggle: Fake vs Real */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('fake')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'fake'
                  ? 'bg-rose-500 text-slate-950 font-bold shadow-md shadow-rose-950/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Fake News Tokens</span>
            </button>
            <button
              onClick={() => setActiveTab('real')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'real'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Real News Tokens</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-controls: Search & View Style */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search keywords..."
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
          />
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <button
            onClick={() => setViewStyle('bars')}
            className={`px-2.5 py-1 rounded-lg border ${
              viewStyle === 'bars' ? 'bg-slate-800 text-teal-300 border-slate-700' : 'border-transparent hover:text-slate-200'
            }`}
          >
            Ranked List
          </button>
          <button
            onClick={() => setViewStyle('cloud')}
            className={`px-2.5 py-1 rounded-lg border ${
              viewStyle === 'cloud' ? 'bg-slate-800 text-teal-300 border-slate-700' : 'border-transparent hover:text-slate-200'
            }`}
          >
            Word Tag Cloud
          </button>
        </div>
      </div>

      {/* Keywords Display Area */}
      <div className="flex-1 overflow-y-auto max-h-[300px] pr-1">
        {filteredKeywords.length > 0 ? (
          viewStyle === 'bars' ? (
            <div className="space-y-2">
              {filteredKeywords.map((item, idx) => {
                const percentage = Math.round((item.count / maxCount) * 100);
                const isFake = activeTab === 'fake';

                return (
                  <div key={idx} className="group p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 transition-all flex items-center gap-3">
                    <span className="font-mono text-[10px] text-slate-500 w-5 text-right font-bold">
                      #{idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-200 group-hover:text-white capitalize">
                          {item.word}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {item.count} occurrences
                        </span>
                      </div>
                      <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isFake
                              ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          }`}
                          style={{ width: `${Math.max(percentage, 4)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Word Cloud View */
            <div className="flex flex-wrap gap-2 p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
              {filteredKeywords.map((item, idx) => {
                const ratio = item.count / maxCount;
                const fontSize = Math.max(11, Math.min(22, 11 + ratio * 12));
                const isFake = activeTab === 'fake';

                return (
                  <span
                    key={idx}
                    style={{ fontSize: `${fontSize}px` }}
                    className={`px-2.5 py-1 rounded-xl font-medium border transition-all hover:scale-105 cursor-pointer ${
                      isFake
                        ? 'bg-rose-950/40 border-rose-500/30 text-rose-300 hover:border-rose-400'
                        : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:border-emerald-400'
                    }`}
                  >
                    {item.word} <span className="text-[10px] opacity-60 font-mono">({item.count})</span>
                  </span>
                );
              })}
            </div>
          )
        ) : (
          <div className="h-40 flex items-center justify-center text-slate-500 text-xs">
            No keywords found matching "{filterTerm}".
          </div>
        )}
      </div>

    </div>
  );
};
