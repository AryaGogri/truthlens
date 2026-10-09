import React from 'react';
import { LayoutDashboard, TrendingUp, BrainCircuit, Filter, Sparkles } from 'lucide-react';

export type DashboardPage = 'overview' | 'trends' | 'model';

interface NavTabsProps {
  activeTab: DashboardPage;
  onTabChange: (tab: DashboardPage) => void;
  filteredCount: number;
  totalCount: number;
  activeFilterCount: number;
  onOpenMobileFilters: () => void;
}

export const NavTabs: React.FC<NavTabsProps> = ({
  activeTab,
  onTabChange,
  filteredCount,
  totalCount,
  activeFilterCount,
  onOpenMobileFilters,
}) => {
  const tabs = [
    {
      id: 'overview' as DashboardPage,
      label: 'Overview',
      subtitle: 'KPIs & Subject Breakdown',
      icon: LayoutDashboard,
    },
    {
      id: 'trends' as DashboardPage,
      label: 'Trends & Language',
      subtitle: 'Timeline & Keywords',
      icon: TrendingUp,
    },
    {
      id: 'model' as DashboardPage,
      label: 'Model & Data',
      subtitle: 'Confusion Matrix & Explorer',
      icon: BrainCircuit,
    },
  ];

  return (
    <div className="w-full bg-[#0b0f19]/90 border-b border-slate-800/80 sticky top-[61px] z-30 backdrop-blur-md px-4 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800/90 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap group ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold shadow-lg shadow-teal-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform ${
                    isActive ? 'text-slate-950 scale-110' : 'text-slate-400 group-hover:text-teal-400'
                  }`}
                />
                <div className="flex flex-col items-start text-left">
                  <span className="font-syne font-bold leading-tight">{tab.label}</span>
                  <span
                    className={`text-[10px] hidden lg:inline font-normal ${
                      isActive ? 'text-slate-900/80' : 'text-slate-500'
                    }`}
                  >
                    {tab.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Filter Toggle on Mobile + Filtered Status Banner */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          
          {/* Mobile Filter Drawer Button */}
          <button
            onClick={onOpenMobileFilters}
            className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 active:scale-95 transition-all"
          >
            <Filter className="w-3.5 h-3.5 text-teal-400" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 font-mono text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Dataset Filter Counter Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="font-mono">
              <strong className="text-teal-300">{filteredCount.toLocaleString()}</strong> / {totalCount.toLocaleString()} articles
            </span>
            {filteredCount < totalCount && (
              <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                Filtered
              </span>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
