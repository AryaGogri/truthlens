import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertTriangle,
  Calendar,
  Tag,
  FileText
} from 'lucide-react';
import { RawArticle, LabelType } from '../types';

interface ArticleExplorerProps {
  articles: RawArticle[];
  onSelectArticle: (article: RawArticle) => void;
}

type SortField = 'title' | 'subject' | 'date' | 'label' | 'confidence';

export const ArticleExplorer: React.FC<ArticleExplorerProps> = ({
  articles,
  onSelectArticle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedLabel, setSelectedLabel] = useState<string>('ALL'); // ALL, Real, Fake, Mismatch
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Get distinct subjects
  const subjects = useMemo(() => {
    const set = new Set<string>();
    articles.forEach(a => {
      if (a.subject) set.add(a.subject);
    });
    return Array.from(set).sort();
  }, [articles]);

  // Filter articles
  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.text.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSubject =
        selectedSubject === 'ALL' || a.subject === selectedSubject;

      let matchesLabel = true;
      if (selectedLabel === 'Real') matchesLabel = a.label === 'Real';
      else if (selectedLabel === 'Fake') matchesLabel = a.label === 'Fake';
      else if (selectedLabel === 'Mismatch') matchesLabel = a.label !== a.predicted;

      return matchesSearch && matchesSubject && matchesLabel;
    });
  }, [articles, searchTerm, selectedSubject, selectedLabel]);

  // Sort articles
  const sortedArticles = useMemo(() => {
    return [...filteredArticles].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'date') {
        valA = a.parsedDate ? a.parsedDate.getTime() : 0;
        valB = b.parsedDate ? b.parsedDate.getTime() : 0;
      }

      if (typeof valA === 'string') {
        const comp = valA.localeCompare(valB);
        return sortDirection === 'asc' ? comp : -comp;
      }

      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }, [filteredArticles, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedArticles.length / pageSize) || 1;
  const paginatedArticles = sortedArticles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl glass-panel border border-slate-800/90 flex flex-col h-full shadow-xl">
      
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-syne font-bold text-lg sm:text-xl text-slate-100 tracking-tight">
              Article Explorer & Forensic Table
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Interactive searchable corpus of all ingested dataset articles
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search headline or text..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-44 sm:w-60 pl-8 pr-3 py-1.5 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
            />
          </div>

          {/* Label Filter */}
          <select
            value={selectedLabel}
            onChange={e => {
              setSelectedLabel(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500/50 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="Real">Verified Real</option>
            <option value="Fake">Flagged Fake</option>
            <option value="Mismatch">Classification Mismatch ⚠️</option>
          </select>

          {/* Subject Filter */}
          {subjects.length > 0 && (
            <select
              value={selectedSubject}
              onChange={e => {
                setSelectedSubject(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500/50 font-medium max-w-[150px] truncate"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map((s, idx) => (
                <option key={idx} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Data Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40 mb-4">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
            <tr>
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-200 transition-colors"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Article Title & Content</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              <th
                className="py-3 px-3 cursor-pointer hover:text-slate-200 transition-colors hidden sm:table-cell"
                onClick={() => handleSort('subject')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Subject</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              <th
                className="py-3 px-3 cursor-pointer hover:text-slate-200 transition-colors hidden md:table-cell"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              <th
                className="py-3 px-3 cursor-pointer hover:text-slate-200 transition-colors"
                onClick={() => handleSort('label')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Ground Truth</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              <th className="py-3 px-3 hidden lg:table-cell">
                Model Prediction
              </th>

              <th
                className="py-3 px-3 text-right cursor-pointer hover:text-slate-200 transition-colors hidden xl:table-cell"
                onClick={() => handleSort('confidence')}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Confidence</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              <th className="py-3 px-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 font-sans">
            {paginatedArticles.length > 0 ? (
              paginatedArticles.map(art => {
                const isMismatch = art.label !== art.predicted;

                return (
                  <tr
                    key={art.id}
                    onClick={() => onSelectArticle(art)}
                    className="hover:bg-slate-900/70 transition-colors cursor-pointer group"
                  >
                    {/* Title & Preview */}
                    <td className="py-3 px-4 max-w-sm sm:max-w-md">
                      <div className="font-semibold text-slate-100 group-hover:text-teal-300 transition-colors line-clamp-1">
                        {art.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {art.text}
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="py-3 px-3 hidden sm:table-cell whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-mono">
                        {art.subject}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 hidden md:table-cell whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {art.date}
                    </td>

                    {/* Ground Truth Label */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {art.label === 'Real' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-semibold text-[10px]">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>Real</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-950/60 border border-rose-500/30 text-rose-300 font-semibold text-[10px]">
                          <ShieldAlert className="w-3 h-3 text-rose-400" />
                          <span>Fake</span>
                        </span>
                      )}
                    </td>

                    {/* Predicted Label */}
                    <td className="py-3 px-3 hidden lg:table-cell whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${
                          art.predicted === 'Real'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                        }`}>
                          {art.predicted}
                        </span>

                        {isMismatch && (
                          <span
                            className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30"
                            title="Classification Mismatch"
                          >
                            MISMATCH ⚠️
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Confidence Score */}
                    <td className="py-3 px-3 text-right hidden xl:table-cell whitespace-nowrap font-mono text-slate-300">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 bg-slate-800 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-teal-400 h-full rounded-full"
                            style={{ width: `${Math.round(art.confidence * 100)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold">
                          {(art.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSelectArticle(art);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-teal-300 transition-colors"
                        title="Inspect Article"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                  No articles found matching your active filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          <span>
            Showing{' '}
            <strong className="text-slate-200">
              {filteredArticles.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-200">
              {Math.min(currentPage * pageSize, filteredArticles.length)}
            </strong>{' '}
            of <strong className="text-slate-200">{filteredArticles.length}</strong> articles
          </span>

          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="ml-2 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-mono text-slate-300 px-2">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
