import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadScreen } from './components/UploadScreen';
import { AnalyzingOverlay } from './components/AnalyzingOverlay';
import { MissingColumnNotice } from './components/MissingColumnNotice';
import { KpiRow } from './components/KpiRow';
import { SubjectChart } from './components/SubjectChart';
import { TimelineChart } from './components/TimelineChart';
import { KeywordPanel } from './components/KeywordPanel';
import { ConfusionMatrixPanel } from './components/ConfusionMatrixPanel';
import { ArticleExplorer } from './components/ArticleExplorer';
import { ArticleModal } from './components/ArticleModal';
import { FilterSidebar, FilterState } from './components/FilterSidebar';
import { NavTabs, DashboardPage } from './components/NavTabs';

import { AnalysisResult, RawArticle } from './types';
import {
  parseCSVFile,
  calculateMetrics,
  calculateSubjectBreakdown,
  calculateTimelineData,
  extractKeywords
} from './utils/csvParser';
import { SAMPLE_CSV_CONTENT } from './data/sampleDataset';
import { RotateCcw, FilterX } from 'lucide-react';

export default function App() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<RawArticle | null>(null);

  // Active View Page Tab ('overview' | 'trends' | 'model')
  const [activeTab, setActiveTab] = useState<DashboardPage>('overview');

  // Mobile drawer filter toggle
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    fromDate: '',
    toDate: '',
    selectedSubjects: [],
    minConfidence: 0,
    labelFilter: 'All'
  });

  const [defaultFilters, setDefaultFilters] = useState<FilterState>({
    fromDate: '',
    toDate: '',
    selectedSubjects: [],
    minConfidence: 0,
    labelFilter: 'All'
  });

  // When analysis result changes, initialize default filter bounds
  useEffect(() => {
    if (!analysisResult) return;

    const subjects = Array.from(
      new Set<string>(analysisResult.articles.map(a => a.subject || 'General'))
    );

    const validDates = analysisResult.articles
      .map(a => a.parsedDate)
      .filter((d): d is Date => d !== null && d !== undefined);

    let minDateStr = '';
    let maxDateStr = '';

    if (validDates.length > 0) {
      const minTime = Math.min(...validDates.map(d => d.getTime()));
      const maxTime = Math.max(...validDates.map(d => d.getTime()));
      minDateStr = new Date(minTime).toISOString().split('T')[0];
      maxDateStr = new Date(maxTime).toISOString().split('T')[0];
    }

    const initial: FilterState = {
      fromDate: minDateStr,
      toDate: maxDateStr,
      selectedSubjects: subjects,
      minConfidence: 0,
      labelFilter: 'All'
    };

    setDefaultFilters(initial);
    setFilters(initial);
  }, [analysisResult]);

  // Handle uploading CSV file
  const handleFileUpload = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const [result] = await Promise.all([
        parseCSVFile(file, file.name, file.size),
        new Promise((resolve) => setTimeout(resolve, 2200))
      ]);

      setAnalysisResult(result);
      setActiveTab('overview');
    } catch (err: any) {
      setError(err.message || 'Failed to process CSV file.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle loading sample dataset
  const handleLoadSample = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const [result] = await Promise.all([
        parseCSVFile(SAMPLE_CSV_CONTENT, 'truthlens_sample_fake_news.csv', SAMPLE_CSV_CONTENT.length),
        new Promise((resolve) => setTimeout(resolve, 2000))
      ]);

      setAnalysisResult(result);
      setActiveTab('overview');
    } catch (err: any) {
      setError(err.message || 'Failed to process sample dataset.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetDataset = () => {
    setAnalysisResult(null);
    setError(null);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  // Filter Articles
  const filteredArticles = useMemo(() => {
    if (!analysisResult) return [];

    return analysisResult.articles.filter((article) => {
      // 1. Date Range
      if (article.parsedDate) {
        const artDateStr = article.parsedDate.toISOString().split('T')[0];
        if (filters.fromDate && artDateStr < filters.fromDate) return false;
        if (filters.toDate && artDateStr > filters.toDate) return false;
      }

      // 2. Subject Filter
      if (
        filters.selectedSubjects.length > 0 &&
        !filters.selectedSubjects.includes(article.subject || 'General')
      ) {
        return false;
      }

      // 3. Confidence Threshold Filter
      const confPct = Math.round((article.confidence || 0) * (article.confidence <= 1 ? 100 : 1));
      if (confPct < filters.minConfidence) {
        return false;
      }

      // 4. Label Filter
      if (filters.labelFilter !== 'All') {
        if (article.label !== filters.labelFilter) return false;
      }

      return true;
    });
  }, [analysisResult, filters]);

  // Derived Filtered Metrics
  const filteredMetrics = useMemo(() => {
    if (!analysisResult) return null;
    return calculateMetrics(filteredArticles, analysisResult.mapping);
  }, [filteredArticles, analysisResult]);

  const filteredSubjectBreakdown = useMemo(() => {
    return calculateSubjectBreakdown(filteredArticles);
  }, [filteredArticles]);

  const filteredTimelineData = useMemo(() => {
    return calculateTimelineData(filteredArticles);
  }, [filteredArticles]);

  const filteredKeywords = useMemo(() => {
    return extractKeywords(filteredArticles);
  }, [filteredArticles]);

  // Calculate active filters count for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.fromDate && filters.fromDate !== defaultFilters.fromDate) count++;
    if (filters.toDate && filters.toDate !== defaultFilters.toDate) count++;
    if (filters.selectedSubjects.length < defaultFilters.selectedSubjects.length) count++;
    if (filters.minConfidence > defaultFilters.minConfidence) count++;
    if (filters.labelFilter !== 'All') count++;
    return count;
  }, [filters, defaultFilters]);

  // Export Filtered Analysis Report
  const handleExportReport = () => {
    if (!analysisResult || !filteredMetrics) return;

    const { fileName } = analysisResult;
    const reportText = `=====================================================
TRUTHLENS MISINFORMATION & FAKE NEWS BI REPORT (FILTERED)
=====================================================
Dataset File: ${fileName}
Total Articles Analyzed (Filtered): ${filteredArticles.length} of ${analysisResult.rowCount}
Active Filters: ${activeFilterCount > 0 ? `${activeFilterCount} active filters applied` : 'None (Full Dataset)'}
Report Date: ${new Date().toLocaleString()}

-----------------------------------------------------
1. CORE FILTERED DATASET METRICS
-----------------------------------------------------
- Filtered Articles: ${filteredMetrics.totalArticles}
- Verified Real Articles: ${filteredMetrics.realCount} (${((filteredMetrics.realCount / (filteredMetrics.totalArticles || 1)) * 100).toFixed(1)}%)
- Flagged Fake Articles: ${filteredMetrics.fakeCount} (${filteredMetrics.fakePercentage}%)
- Misinformation Density: ${filteredMetrics.fakePercentage}%

-----------------------------------------------------
2. MODEL EVALUATION & CONFUSION MATRIX
-----------------------------------------------------
${filteredMetrics.hasPerformanceData ? `
- Overall Model Accuracy: ${filteredMetrics.accuracy !== null ? (filteredMetrics.accuracy * 100).toFixed(1) + '%' : 'N/A'}
- Precision: ${filteredMetrics.precision !== null ? (filteredMetrics.precision * 100).toFixed(1) + '%' : 'N/A'}
- Recall / Sensitivity: ${filteredMetrics.recall !== null ? (filteredMetrics.recall * 100).toFixed(1) + '%' : 'N/A'}
- F1 Score: ${filteredMetrics.f1Score !== null ? filteredMetrics.f1Score.toFixed(3) : 'N/A'}

Matrix Breakdown:
  - True Positives (Actual Fake, Predicted Fake): ${filteredMetrics.truePositives}
  - True Negatives (Actual Real, Predicted Real): ${filteredMetrics.trueNegatives}
  - False Positives (Actual Real, Predicted Fake): ${filteredMetrics.falsePositives}
  - False Negatives (Actual Fake, Predicted Real): ${filteredMetrics.falseNegatives}
` : 'Performance metrics unavailable (missing Predicted column).'}

-----------------------------------------------------
3. TOP DISTINCTIVE FAKE NEWS KEYWORDS (FILTERED)
-----------------------------------------------------
${filteredKeywords.fakeKeywords.slice(0, 15).map((k, i) => `${i + 1}. ${k.word} (${k.count} occurrences)`).join('\n')}

-----------------------------------------------------
4. TOP DISTINCTIVE REAL NEWS KEYWORDS (FILTERED)
-----------------------------------------------------
${filteredKeywords.realKeywords.slice(0, 15).map((k, i) => `${i + 1}. ${k.word} (${k.count} occurrences)`).join('\n')}

=====================================================
Generated by TruthLens BI Engine
=====================================================
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `truthlens_filtered_report_${Date.now()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasConfidenceColumn = Boolean(
    analysisResult?.mapping.confidenceKey ||
    analysisResult?.articles.some(a => a.confidence !== undefined)
  );

  return (
    <div className="min-h-screen bg-[#090d16] text-[#e2e8f0] flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* Sticky Header */}
      <Header
        analysisResult={analysisResult}
        onNewUploadClick={handleResetDataset}
        onLoadSampleClick={handleLoadSample}
        onExportReport={analysisResult ? handleExportReport : undefined}
      />

      {/* Analyzing Processing Animation Overlay */}
      {isAnalyzing && (
        <AnalyzingOverlay fileName={analysisResult?.fileName || 'dataset.csv'} />
      )}

      {/* Main View */}
      {!analysisResult ? (
        /* 1. Landing / Upload Screen */
        <UploadScreen
          onFileUpload={handleFileUpload}
          onLoadSample={handleLoadSample}
          error={error}
          clearError={() => setError(null)}
        />
      ) : (
        /* 2. Three-Page Dashboard with Persistent Global Filter Sidebar */
        <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-300">
          
          {/* Top Page Navigation Tabs Bar */}
          <NavTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            filteredCount={filteredArticles.length}
            totalCount={analysisResult.rowCount}
            activeFilterCount={activeFilterCount}
            onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
          />

          {/* Main Content Area with Persistent Sidebar */}
          <div className="flex-1 max-w-[1536px] w-full mx-auto flex items-start px-4 sm:px-6 lg:px-8 py-6 gap-6 sm:gap-8">
            
            {/* PERSISTENT GLOBAL FILTER SIDEBAR */}
            <FilterSidebar
              articles={analysisResult.articles}
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={handleResetFilters}
              defaultFilters={defaultFilters}
              hasConfidenceColumn={hasConfidenceColumn}
              isOpenMobile={isMobileFiltersOpen}
              onCloseMobile={() => setIsMobileFiltersOpen(false)}
              filteredCount={filteredArticles.length}
              totalCount={analysisResult.rowCount}
            />

            {/* DYNAMIC PAGE VIEW CONTENT */}
            <main className="flex-1 min-w-0 space-y-6">
              
              {/* Missing Column Graceful Notice */}
              <MissingColumnNotice analysisResult={analysisResult} />

              {/* Zero Filter Matches State */}
              {filteredArticles.length === 0 ? (
                <div className="p-12 rounded-3xl glass-panel border border-amber-500/30 flex flex-col items-center justify-center text-center space-y-4 my-8">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <FilterX className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-syne font-bold text-lg text-slate-100 mb-1">
                      No Articles Match Active Filters
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md">
                      Your current filter settings (date range, subject checklist, or confidence threshold) excluded all articles in the dataset.
                    </p>
                  </div>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* PAGE 1: OVERVIEW */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      
                      {/* KPI Stat Cards Row */}
                      {filteredMetrics && <KpiRow metrics={filteredMetrics} />}

                      {/* Fake vs Real by Subject Chart (Full Page Focus) */}
                      <div className="w-full">
                        <SubjectChart data={filteredSubjectBreakdown} />
                      </div>

                    </div>
                  )}

                  {/* PAGE 2: TRENDS & LANGUAGE */}
                  {activeTab === 'trends' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
                      
                      {/* Publication Trend Over Time Chart */}
                      <div className="lg:col-span-12">
                        <TimelineChart data={filteredTimelineData} />
                      </div>

                      {/* Top Distinctive Keywords Panel */}
                      <div className="lg:col-span-12">
                        <KeywordPanel keywords={filteredKeywords} />
                      </div>

                    </div>
                  )}

                  {/* PAGE 3: MODEL & DATA */}
                  {activeTab === 'model' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      
                      {/* Confusion Matrix & Model Performance Panel */}
                      {filteredMetrics && (
                        <ConfusionMatrixPanel metrics={filteredMetrics} />
                      )}

                      {/* Full Article Explorer Table */}
                      <div className="w-full">
                        <ArticleExplorer
                          articles={filteredArticles}
                          onSelectArticle={(art) => setSelectedArticle(art)}
                        />
                      </div>

                    </div>
                  )}
                </>
              )}

            </main>

          </div>

          {/* Article Detailed Inspector Modal */}
          <ArticleModal
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
          />

        </div>
      )}

    </div>
  );
}
