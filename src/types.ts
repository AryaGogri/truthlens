export type LabelType = 'Real' | 'Fake' | 'Unknown';

export interface RawArticle {
  id: string;
  title: string;
  text: string;
  subject: string;
  date: string;
  label: LabelType;
  predicted: LabelType;
  confidence: number; // 0 to 1 or 0 to 100
  parsedDate?: Date | null;
  rawRow: Record<string, any>;
}

export interface ColumnMapping {
  titleKey: string | null;
  textKey: string | null;
  subjectKey: string | null;
  dateKey: string | null;
  labelKey: string | null;
  predictedKey: string | null;
  confidenceKey: string | null;
}

export interface DatasetMetrics {
  totalArticles: number;
  realCount: number;
  fakeCount: number;
  unknownCount: number;
  fakePercentage: number;
  
  // Model performance metrics (if actual & predicted exist)
  hasPerformanceData: boolean;
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1Score: number | null;
  truePositives: number; // True Fake (or True Real depending on convention, let's treat Fake as positive class for detection)
  trueNegatives: number;
  falsePositives: number; // Predicted Fake, actually Real
  falseNegatives: number; // Predicted Real, actually Fake
}

export interface SubjectBreakdown {
  subject: string;
  real: number;
  fake: number;
  total: number;
  fakeRatio: number;
}

export interface TimelineDataPoint {
  dateKey: string; // e.g. "2023-05" or "2023"
  label: string; // formatted e.g. "May 2023"
  real: number;
  fake: number;
  total: number;
}

export interface KeywordItem {
  word: string;
  count: number;
  frequency: number;
}

export interface KeywordAnalysis {
  fakeKeywords: KeywordItem[];
  realKeywords: KeywordItem[];
}

export interface AnalysisResult {
  fileName: string;
  fileSize: number;
  rowCount: number;
  articles: RawArticle[];
  mapping: ColumnMapping;
  detectedColumns: string[];
  missingColumns: string[];
  metrics: DatasetMetrics;
  subjectBreakdown: SubjectBreakdown[];
  timelineData: TimelineDataPoint[];
  keywords: KeywordAnalysis;
}
