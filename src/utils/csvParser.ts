import Papa from 'papaparse';
import {
  RawArticle,
  ColumnMapping,
  DatasetMetrics,
  SubjectBreakdown,
  TimelineDataPoint,
  KeywordAnalysis,
  KeywordItem,
  AnalysisResult,
  LabelType
} from '../types';

// English Stopwords
const COMMON_STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
  'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'whatever', 'when', 'when\'s', 'where', 'where\'s',
  'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you',
  'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves', 'said', 'says', 'new', 'one',
  'two', 'also', 'according', 'state', 'report', 'reports', 'people', 'year', 'years', 'first', 'time', 'like',
  'just', 'make', 'now', 'will', 'may', 'can', 'get', 'use', 'using', 'would', 'could', 'claims', 'claimed'
]);

/**
 * Fuzzy Header Detector
 */
export function detectColumns(headers: string[]): ColumnMapping {
  const norm = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const findKey = (candidates: string[]): string | null => {
    for (const header of headers) {
      const cleanHeader = norm(header);
      if (candidates.some(c => cleanHeader === c || cleanHeader.includes(c))) {
        return header;
      }
    }
    return null;
  };

  return {
    titleKey: findKey(['title', 'headline', 'header', 'subject_line', 'news_title']),
    textKey: findKey(['text', 'content', 'body', 'article', 'description', 'full_text', 'news_text']),
    subjectKey: findKey(['subject', 'category', 'topic', 'class_name', 'tag', 'section', 'genre']),
    dateKey: findKey(['date', 'published', 'published_date', 'time', 'timestamp', 'created_at', 'day']),
    labelKey: findKey(['label', 'class', 'actual', 'ground_truth', 'target', 'is_fake', 'type', 'truth']),
    predictedKey: findKey(['predicted', 'prediction', 'pred', 'model_label', 'output', 'classified']),
    confidenceKey: findKey(['confidence', 'score', 'probability', 'prob', 'p_fake', 'confidence_score'])
  };
}

/**
 * Normalizes label strings into 'Real', 'Fake', or 'Unknown'
 */
export function normalizeLabel(val: any): LabelType {
  if (val === undefined || val === null) return 'Unknown';
  const str = String(val).trim().toLowerCase();
  
  if (['1', 'fake', 'false', 'f', 'fake news', 'untrue', 'misinformation', 'bogus', 'rumor'].includes(str)) {
    return 'Fake';
  }
  if (['0', 'real', 'true', 't', 'legit', 'genuine', 'authentic', 'fact', 'truth'].includes(str)) {
    return 'Real';
  }
  if (str.includes('fake') || str.includes('false')) return 'Fake';
  if (str.includes('real') || str.includes('true')) return 'Real';
  return 'Unknown';
}

/**
 * Normalizes confidence score into 0-1 range or percentage
 */
function parseConfidence(val: any): number {
  if (val === undefined || val === null || val === '') return 0.85;
  const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return 0.85;
  if (num > 1 && num <= 100) return num / 100;
  if (num >= 0 && num <= 1) return num;
  return 0.85;
}

/**
 * Parse Date with fallback
 */
function parseArticleDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;

  // Try parsing common formats e.g. "December 31, 2022" or "31-12-2022"
  const cleanStr = dateStr.trim();
  const matchedYear = cleanStr.match(/\b(20[0-9]{2}|19[0-9]{2})\b/);
  if (matchedYear) {
    const year = parseInt(matchedYear[1]);
    return new Date(year, 0, 1);
  }
  return null;
}

/**
 * Extract distinct keywords for Fake vs Real
 */
export function extractKeywords(articles: RawArticle[]): KeywordAnalysis {
  const fakeCounts: Record<string, number> = {};
  const realCounts: Record<string, number> = {};

  articles.forEach(art => {
    const content = `${art.title} ${art.text}`.toLowerCase();
    const words = content.match(/[a-z]{3,}/g) || [];
    const targetMap = art.label === 'Fake' ? fakeCounts : (art.label === 'Real' ? realCounts : null);

    if (!targetMap) return;

    const seenInArticle = new Set<string>();
    words.forEach(w => {
      if (!COMMON_STOPWORDS.has(w) && !seenInArticle.has(w)) {
        seenInArticle.add(w);
        targetMap[w] = (targetMap[w] || 0) + 1;
      }
    });
  });

  const mapToSortedArray = (counts: Record<string, number>, total: number): KeywordItem[] => {
    return Object.entries(counts)
      .map(([word, count]) => ({
        word,
        count,
        frequency: total > 0 ? parseFloat((count / total).toFixed(3)) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);
  };

  const fakeTotal = articles.filter(a => a.label === 'Fake').length;
  const realTotal = articles.filter(a => a.label === 'Real').length;

  return {
    fakeKeywords: mapToSortedArray(fakeCounts, fakeTotal),
    realKeywords: mapToSortedArray(realCounts, realTotal)
  };
}

/**
 * Calculate Dataset Metrics and Confusion Matrix
 */
export function calculateMetrics(articles: RawArticle[], mapping: ColumnMapping): DatasetMetrics {
  const totalArticles = articles.length;
  let realCount = 0;
  let fakeCount = 0;
  let unknownCount = 0;

  articles.forEach(a => {
    if (a.label === 'Real') realCount++;
    else if (a.label === 'Fake') fakeCount++;
    else unknownCount++;
  });

  const fakePercentage = totalArticles > 0 ? parseFloat(((fakeCount / totalArticles) * 100).toFixed(1)) : 0;

  const hasPerformanceData = Boolean(mapping.labelKey && mapping.predictedKey);

  let tp = 0; // Actual Fake, Predicted Fake
  let tn = 0; // Actual Real, Predicted Real
  let fp = 0; // Actual Real, Predicted Fake
  let fn = 0; // Actual Fake, Predicted Real

  if (hasPerformanceData) {
    articles.forEach(a => {
      if (a.label === 'Fake' && a.predicted === 'Fake') tp++;
      else if (a.label === 'Real' && a.predicted === 'Real') tn++;
      else if (a.label === 'Real' && a.predicted === 'Fake') fp++;
      else if (a.label === 'Fake' && a.predicted === 'Real') fn++;
    });
  }

  const evaluatedCount = tp + tn + fp + fn;

  const accuracy = evaluatedCount > 0 ? parseFloat(((tp + tn) / evaluatedCount).toFixed(4)) : null;
  const precision = (tp + fp) > 0 ? parseFloat((tp / (tp + fp)).toFixed(4)) : null;
  const recall = (tp + fn) > 0 ? parseFloat((tp / (tp + fn)).toFixed(4)) : null;
  const f1Score = (precision !== null && recall !== null && (precision + recall) > 0)
    ? parseFloat((2 * (precision * recall) / (precision + recall)).toFixed(4))
    : null;

  return {
    totalArticles,
    realCount,
    fakeCount,
    unknownCount,
    fakePercentage,
    hasPerformanceData,
    accuracy,
    precision,
    recall,
    f1Score,
    truePositives: tp,
    trueNegatives: tn,
    falsePositives: fp,
    falseNegatives: fn
  };
}

/**
 * Group Articles by Subject
 */
export function calculateSubjectBreakdown(articles: RawArticle[]): SubjectBreakdown[] {
  const subjectMap: Record<string, { real: number; fake: number; total: number }> = {};

  articles.forEach(a => {
    const subj = a.subject || 'General / Unclassified';
    if (!subjectMap[subj]) {
      subjectMap[subj] = { real: 0, fake: 0, total: 0 };
    }
    subjectMap[subj].total += 1;
    if (a.label === 'Real') subjectMap[subj].real += 1;
    else if (a.label === 'Fake') subjectMap[subj].fake += 1;
  });

  return Object.entries(subjectMap)
    .map(([subject, counts]) => ({
      subject,
      real: counts.real,
      fake: counts.fake,
      total: counts.total,
      fakeRatio: counts.total > 0 ? parseFloat(((counts.fake / counts.total) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Group Articles by Date Timeline (Auto-bucketed by Month or Year)
 */
export function calculateTimelineData(articles: RawArticle[]): TimelineDataPoint[] {
  const validDatedArticles = articles.filter(a => a.parsedDate !== null);

  if (validDatedArticles.length === 0) {
    return [];
  }

  // Determine date span to decide month vs year grouping
  const timestamps = validDatedArticles.map(a => a.parsedDate!.getTime());
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  const yearDiff = (maxTime - minTime) / (1000 * 60 * 60 * 24 * 365);

  const groupByYear = yearDiff > 3;

  const timelineMap: Record<string, { label: string; real: number; fake: number; total: number }> = {};

  validDatedArticles.forEach(a => {
    const d = a.parsedDate!;
    let key: string;
    let labelStr: string;

    if (groupByYear) {
      key = `${d.getFullYear()}`;
      labelStr = key;
    } else {
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      key = `${d.getFullYear()}-${monthStr}`;
      const monthName = d.toLocaleString('en-US', { month: 'short' });
      labelStr = `${monthName} ${d.getFullYear()}`;
    }

    if (!timelineMap[key]) {
      timelineMap[key] = { label: labelStr, real: 0, fake: 0, total: 0 };
    }
    timelineMap[key].total += 1;
    if (a.label === 'Real') timelineMap[key].real += 1;
    else if (a.label === 'Fake') timelineMap[key].fake += 1;
  });

  return Object.entries(timelineMap)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([dateKey, val]) => ({
      dateKey,
      label: val.label,
      real: val.real,
      fake: val.fake,
      total: val.total
    }));
}

/**
 * Full CSV Parsing Engine using PapaParse
 */
export function parseCSVFile(
  fileOrString: File | string,
  fileName: string = 'dataset.csv',
  fileSize: number = 0
): Promise<AnalysisResult> {
  return new Promise((resolve, reject) => {
    const onComplete = (results: Papa.ParseResult<Record<string, any>>) => {
      try {
        if (!results.data || results.data.length === 0) {
          reject(new Error('CSV file is empty or could not be parsed correctly.'));
          return;
        }

        const headers = results.meta.fields || Object.keys(results.data[0] || {});
        if (headers.length === 0) {
          reject(new Error('No header columns found in CSV file.'));
          return;
        }

        const mapping = detectColumns(headers);

        const detectedColumns: string[] = [];
        const missingColumns: string[] = [];

        if (mapping.titleKey) detectedColumns.push(`Title (${mapping.titleKey})`);
        else missingColumns.push('Title');

        if (mapping.textKey) detectedColumns.push(`Text (${mapping.textKey})`);
        else missingColumns.push('Text');

        if (mapping.subjectKey) detectedColumns.push(`Subject (${mapping.subjectKey})`);
        else missingColumns.push('Subject');

        if (mapping.dateKey) detectedColumns.push(`Date (${mapping.dateKey})`);
        else missingColumns.push('Date');

        if (mapping.labelKey) detectedColumns.push(`Ground Truth Label (${mapping.labelKey})`);
        else missingColumns.push('Ground Truth Label');

        if (mapping.predictedKey) detectedColumns.push(`Model Prediction (${mapping.predictedKey})`);
        else missingColumns.push('Model Prediction');

        if (mapping.confidenceKey) detectedColumns.push(`Confidence Score (${mapping.confidenceKey})`);
        else missingColumns.push('Confidence Score');

        // Parse Rows into RawArticle objects
        const articles: RawArticle[] = [];

        results.data.forEach((row, idx) => {
          // Skip empty trailing rows
          if (!row || Object.values(row).every(v => v === null || v === '')) return;

          const title = mapping.titleKey && row[mapping.titleKey] ? String(row[mapping.titleKey]).trim() : `Article #${idx + 1}`;
          const text = mapping.textKey && row[mapping.textKey] ? String(row[mapping.textKey]).trim() : title;
          const subject = mapping.subjectKey && row[mapping.subjectKey] ? String(row[mapping.subjectKey]).trim() : 'General';
          const dateRaw = mapping.dateKey && row[mapping.dateKey] ? String(row[mapping.dateKey]).trim() : '';

          const parsedDate = parseArticleDate(dateRaw);

          let rawLabelVal = mapping.labelKey ? row[mapping.labelKey] : undefined;
          let rawPredVal = mapping.predictedKey ? row[mapping.predictedKey] : undefined;

          // If label exists but predicted doesn't, or vice versa, fallback sensibly
          let label = normalizeLabel(rawLabelVal);
          let predicted = normalizeLabel(rawPredVal);

          if (label === 'Unknown' && predicted !== 'Unknown') {
            label = predicted;
          } else if (predicted === 'Unknown' && label !== 'Unknown') {
            predicted = label;
          }

          const confidence = mapping.confidenceKey
            ? parseConfidence(row[mapping.confidenceKey])
            : (label === predicted ? 0.92 : 0.68);

          articles.push({
            id: `art-${idx + 1}`,
            title,
            text,
            subject,
            date: dateRaw || (parsedDate ? parsedDate.toISOString().split('T')[0] : 'N/A'),
            label,
            predicted,
            confidence,
            parsedDate,
            rawRow: row
          });
        });

        if (articles.length === 0) {
          reject(new Error('No valid article data rows found in CSV file.'));
          return;
        }

        const metrics = calculateMetrics(articles, mapping);
        const subjectBreakdown = calculateSubjectBreakdown(articles);
        const timelineData = calculateTimelineData(articles);
        const keywords = extractKeywords(articles);

        resolve({
          fileName,
          fileSize: fileSize || (typeof fileOrString === 'string' ? fileOrString.length : fileOrString.size),
          rowCount: articles.length,
          articles,
          mapping,
          detectedColumns,
          missingColumns,
          metrics,
          subjectBreakdown,
          timelineData,
          keywords
        });
      } catch (err: any) {
        reject(new Error(err.message || 'Error processing CSV dataset.'));
      }
    };

    if (typeof fileOrString === 'string') {
      Papa.parse(fileOrString, {
        header: true,
        skipEmptyLines: true,
        complete: onComplete,
        error: (err) => reject(new Error(err.message))
      });
    } else {
      Papa.parse(fileOrString, {
        header: true,
        skipEmptyLines: true,
        complete: onComplete,
        error: (err) => reject(new Error(err.message))
      });
    }
  });
}
