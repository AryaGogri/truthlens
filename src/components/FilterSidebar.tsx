import React, { useState, useMemo } from 'react';
import {
  Filter,
  RotateCcw,
  Calendar,
  Layers,
  Sliders,
  CheckSquare,
  Square,
  Search,
  X,
  Tag,
  ShieldAlert,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { RawArticle, LabelType } from '../types';

export interface FilterState {
  fromDate: string; // YYYY-MM-DD
  toDate: string;   // YYYY-MM-DD
  selectedSubjects: string[];
  minConfidence: number; // 0 to 100
  labelFilter: 'All' | 'Real' | 'Fake' | 'Unknown';
}

interface FilterSidebarProps {
  articles: RawArticle[];
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  defaultFilters: FilterState;
  hasConfidenceColumn: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  filteredCount: number;
  totalCount: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  articles,
  filters,
  onFilterChange,
  onResetFilters,
  defaultFilters,
  hasConfidenceColumn,
  isOpenMobile,
  onCloseMobile,
  filteredCount,
  totalCount
}) => {
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectCollapsed, setSubjectCollapsed] = useState(false);
  const [dateCollapsed, setDateCollapsed] = useState(false);
  const [confidenceCollapsed, setConfidenceCollapsed] = useState(false);

  // Derive distinct subjects with item counts from original articles
  const subjectCounts = useMemo(() => {
    const map: Record<string, number> = {};
    articles.forEach(a => {
      const subj = a.subject || 'General';
      map[subj] = (map[subj] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [articles]);

  const filteredSubjectsList = useMemo(() => {
    if (!subjectSearch.trim()) return subjectCounts;
    return subjectCounts.filter(s =>
      s.name.toLowerCase().includes(subjectSearch.toLowerCase())
    );
  }, [subjectCounts, subjectSearch]);

  // Derive Date bounds string for guidance
  const dateBounds = useMemo(() => {
    const validDates = articles
      .map(a => a.parsedDate)
      .filter((d): d is Date => d !== null && d !== undefined);

    if (validDates.length === 0) return null;

    const minTime = Math.min(...validDates.map(d => d.getTime()));
    const maxTime = Math.max(...validDates.map(d => d.getTime()));

    return {
      min: new Date(minTime).toISOString().split('T')[0],
      max: new Date(maxTime).toISOString().split('T')[0],
      minFormatted: new Date(minTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      maxFormatted: new Date(maxTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
  }, [articles]);

  // Calculate number of active non-default filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.fromDate && filters.fromDate !== defaultFilters.fromDate) count++;
    if (filters.toDate && filters.toDate !== defaultFilters.toDate) count++;
    if (filters.selectedSubjects.length < subjectCounts.length) count++;
    if (filters.minConfidence > defaultFilters.minConfidence) count++;
    if (filters.labelFilter !== 'All') count++;
    return count;
  }, [filters, defaultFilters, subjectCounts.length]);

  const handleSelectAllSubjects = () => {
    onFilterChange({
      ...filters,
      selectedSubjects: subjectCounts.map(s => s.name)
    });
  };

  const handleDeselectAllSubjects = () => {
    onFilterChange({
      ...filters,
      selectedSubjects: []
    });
  };

  const toggleSubject = (subjectName: string) => {
    const exists = filters.selectedSubjects.includes(subjectName);
    const updated = exists
      ? filters.selectedSubjects.filter(s => s !== subjectName)
      : [...filters.selectedSubjects, subjectName];

    onFilterChange({
      ...filters,
      selectedSubjects: updated
    });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0d1322] border-r border-slate-800/90 text-slate-200 w-full overflow-y-auto custom-scrollbar">
      {/* Sidebar Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/90 flex items-center justify-between sticky top-0 bg-[#0d1322]/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-inner">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-syne font-bold text-slate-100 text-sm tracking-wide">
              Global Filters
            </h3>
            <p className="text-[11px] text-slate-400">
              Showing <span className="font-mono text-teal-300 font-semibold">{filteredCount}</span> of {totalCount} articles
            </p>
          </div>
        </div>

        {/* Active Filter Counter & Reset Button */}
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono text-[11px] font-semibold animate-in fade-in">
              {activeFilterCount} active
            </span>
          )}

          <button
            onClick={onResetFilters}
            disabled={activeFilterCount === 0}
            className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-all ${
              activeFilterCount > 0
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-teal-500/40 active:scale-95'
                : 'bg-slate-900/50 text-slate-600 border-slate-800/50 cursor-not-allowed'
            }`}
            title="Reset all filters to default"
          >
            <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline text-[11px]">Reset</span>
          </button>

          {/* Close button for mobile drawer */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6 flex-1">
        
        {/* 1. DATE RANGE FILTER */}
        <div className="space-y-3 pb-5 border-b border-slate-800/80">
          <button
            onClick={() => setDateCollapsed(!dateCollapsed)}
            className="w-full flex items-center justify-between text-xs font-syne font-bold uppercase tracking-wider text-slate-300 hover:text-white group"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span>Date Range</span>
              {(filters.fromDate !== defaultFilters.fromDate || filters.toDate !== defaultFilters.toDate) && (
                <span className="w-2 h-2 rounded-full bg-teal-400" />
              )}
            </div>
            {dateCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          {!dateCollapsed && (
            <div className="space-y-3 pt-1">
              {dateBounds && (
                <p className="text-[11px] text-slate-400 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800/80 font-mono">
                  Data bounds: {dateBounds.minFormatted} – {dateBounds.maxFormatted}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) => onFilterChange({ ...filters, fromDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                    To
                  </label>
                  <input
                    type="date"
                    value={filters.toDate}
                    onChange={(e) => onFilterChange({ ...filters, toDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              {(filters.fromDate !== defaultFilters.fromDate || filters.toDate !== defaultFilters.toDate) && (
                <button
                  onClick={() => onFilterChange({ ...filters, fromDate: defaultFilters.fromDate, toDate: defaultFilters.toDate })}
                  className="text-[11px] text-teal-400 hover:text-teal-300 font-medium hover:underline flex items-center gap-1"
                >
                  Clear date range
                </button>
              )}
            </div>
          )}
        </div>

        {/* 2. GROUND TRUTH / LABEL FILTER */}
        <div className="space-y-2.5 pb-5 border-b border-slate-800/80">
          <label className="flex items-center gap-2 text-xs font-syne font-bold uppercase tracking-wider text-slate-300">
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            <span>Article Classification</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium">
            {(['All', 'Real', 'Fake'] as const).map((lbl) => (
              <button
                key={lbl}
                onClick={() => onFilterChange({ ...filters, labelFilter: lbl })}
                className={`py-1 px-2 rounded-lg transition-all text-center text-[11px] font-semibold ${
                  filters.labelFilter === lbl
                    ? lbl === 'Fake'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : lbl === 'Real'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-teal-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {lbl === 'All' ? 'All' : lbl}
              </button>
            ))}
          </div>
        </div>

        {/* 3. CONFIDENCE THRESHOLD FILTER */}
        {hasConfidenceColumn && (
          <div className="space-y-3 pb-5 border-b border-slate-800/80">
            <button
              onClick={() => setConfidenceCollapsed(!confidenceCollapsed)}
              className="w-full flex items-center justify-between text-xs font-syne font-bold uppercase tracking-wider text-slate-300 hover:text-white"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Min Confidence</span>
                {filters.minConfidence > 0 && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                )}
              </div>
              {confidenceCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            {!confidenceCollapsed && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Threshold:</span>
                  <span className="font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                    &ge; {filters.minConfidence}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={filters.minConfidence}
                  onChange={(e) => onFilterChange({ ...filters, minConfidence: parseInt(e.target.value) })}
                  className="w-full accent-teal-400 bg-slate-900 cursor-pointer h-1.5 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0% (All)</span>
                  <span>50%</span>
                  <span>100% (High)</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. SUBJECT / CATEGORY MULTI-SELECT CHECKLIST */}
        <div className="space-y-3">
          <button
            onClick={() => setSubjectCollapsed(!subjectCollapsed)}
            className="w-full flex items-center justify-between text-xs font-syne font-bold uppercase tracking-wider text-slate-300 hover:text-white"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Subjects / Categories</span>
              <span className="text-[10px] text-slate-400 font-mono font-normal">
                ({filters.selectedSubjects.length}/{subjectCounts.length})
              </span>
            </div>
            {subjectCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          {!subjectCollapsed && (
            <div className="space-y-2 pt-1">
              {/* Quick Select All / Deselect All */}
              <div className="flex items-center justify-between text-[11px]">
                <button
                  onClick={handleSelectAllSubjects}
                  className="text-teal-400 hover:underline font-medium"
                >
                  Select all
                </button>
                <button
                  onClick={handleDeselectAllSubjects}
                  className="text-slate-400 hover:text-slate-200 hover:underline font-medium"
                >
                  Deselect all
                </button>
              </div>

              {/* Subject Search */}
              {subjectCounts.length > 5 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search subject..."
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              )}

              {/* Checklist items */}
              <div className="max-h-52 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {filteredSubjectsList.map((s) => {
                  const isChecked = filters.selectedSubjects.includes(s.name);
                  return (
                    <button
                      key={s.name}
                      onClick={() => toggleSubject(s.name)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors group text-left ${
                        isChecked
                          ? 'bg-slate-900/90 text-slate-100 hover:bg-slate-800'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        {isChecked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 group-hover:text-slate-400" />
                        )}
                        <span className="truncate">{s.name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded flex-shrink-0">
                        {s.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-72 lg:w-80 flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] rounded-2xl overflow-hidden my-4 ml-4 lg:ml-6 border border-slate-800/80 shadow-2xl">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Drawer */}
      {isOpenMobile && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in"
            onClick={onCloseMobile}
          />
          <div className="relative w-80 max-w-[85vw] h-full bg-[#0d1322] shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
