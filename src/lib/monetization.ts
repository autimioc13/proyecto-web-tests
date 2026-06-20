// src/lib/monetization.ts
import { MonetizationEntry, QuizAnalytics, UserFlowMetrics, DailyMetrics } from '@/types/analytics';

const DEFAULT_CPM_RATE = 2.5; // $2.50 per 1000 impressions
const IMPRESSION_MULTIPLIER = 1000000; // Convert to micros

/**
 * Calculate CPM (Cost Per Mille) - actual rate from revenue and impressions
 * Formula: (Revenue / Impressions) * 1000
 */
export function calculateCPM(
  totalRevenueUSD: number,
  impressionCount: number
): number {
  if (impressionCount === 0) return 0;
  return (totalRevenueUSD / impressionCount) * 1000;
}

/**
 * Calculate CPM from micros
 * Formula: (Revenue in micros / Impressions) * 1000 / 1000000
 */
export function calculateCPMFromMicros(
  totalRevenueMicros: number,
  impressionCount: number
): number {
  if (impressionCount === 0) return 0;
  return (totalRevenueMicros / IMPRESSION_MULTIPLIER / impressionCount) * 1000;
}

/**
 * Estimate revenue based on impressions and CPM rate
 * Formula: (Impressions * CPM) / 1000
 */
export function estimateRevenue(
  impressionCount: number,
  cpmRate: number = DEFAULT_CPM_RATE
): number {
  return (impressionCount * cpmRate) / 1000;
}

/**
 * Estimate revenue in micros
 */
export function estimateRevenueMicros(
  impressionCount: number,
  cpmRate: number = DEFAULT_CPM_RATE
): number {
  const usdRevenue = estimateRevenue(impressionCount, cpmRate);
  return Math.round(usdRevenue * IMPRESSION_MULTIPLIER);
}

/**
 * Calculate conversion rate
 * Formula: (Conversions / Total Events) * 100
 */
export function calculateConversionRate(
  conversions: number,
  totalEvents: number
): number {
  if (totalEvents === 0) return 0;
  return (conversions / totalEvents) * 100;
}

/**
 * Calculate completion rate
 * Formula: (Completions / Starts) * 100
 */
export function calculateCompletionRate(
  completions: number,
  starts: number
): number {
  if (starts === 0) return 0;
  return (completions / starts) * 100;
}

/**
 * Calculate share rate
 * Formula: (Shares / Completions) * 100
 */
export function calculateShareRate(
  shares: number,
  completions: number
): number {
  if (completions === 0) return 0;
  return (shares / completions) * 100;
}

/**
 * Calculate funnel conversion step
 */
export function calculateFunnelConversion(
  entriesAtStep: number,
  totalEntries: number
): number {
  if (totalEntries === 0) return 0;
  return (entriesAtStep / totalEntries) * 100;
}

/**
 * Generate monetization report for a date range
 */
export function generateMonetizationReport(
  entries: MonetizationEntry[],
  startDate: Date,
  endDate: Date
): {
  period: { start: Date; end: Date };
  total_impressions: number;
  total_completions: number;
  total_conversions: number;
  total_revenue_usd: number;
  total_revenue_micros: number;
  avg_cpm: number;
  completion_rate: number;
  conversion_rate: number;
  daily_breakdown: DailyMetrics[];
} {
  const filteredEntries = entries.filter(
    (entry) =>
      entry.date >= startDate && entry.date <= endDate
  );

  const totalImpressions = filteredEntries.reduce(
    (sum, entry) => sum + entry.impression_count,
    0
  );
  const totalCompletions = filteredEntries.reduce(
    (sum, entry) => sum + entry.completion_count,
    0
  );
  const totalConversions = filteredEntries.reduce(
    (sum, entry) => sum + entry.conversion_count,
    0
  );
  const totalRevenueMicros = filteredEntries.reduce(
    (sum, entry) => sum + entry.total_revenue_micros,
    0
  );

  const totalRevenueUSD = totalRevenueMicros / IMPRESSION_MULTIPLIER;
  const avgCPM = calculateCPMFromMicros(totalRevenueMicros, totalImpressions);
  const completionRate = calculateCompletionRate(totalCompletions, totalImpressions);
  const conversionRate = calculateConversionRate(totalConversions, totalImpressions);

  // Build daily breakdown
  const dailyMap = new Map<string, DailyMetrics>();
  filteredEntries.forEach((entry) => {
    const dateKey = entry.date.toISOString().split('T')[0];
    const existing = dailyMap.get(dateKey) || {
      date: entry.date,
      impressions: 0,
      completions: 0,
      conversions: 0,
      revenue_micros: 0,
      avg_cpm: 0,
    };

    existing.impressions += entry.impression_count;
    existing.completions += entry.completion_count;
    existing.conversions += entry.conversion_count;
    existing.revenue_micros += entry.total_revenue_micros;
    existing.avg_cpm = calculateCPMFromMicros(existing.revenue_micros, existing.impressions);

    dailyMap.set(dateKey, existing);
  });

  const daily_breakdown = Array.from(dailyMap.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  return {
    period: { start: startDate, end: endDate },
    total_impressions: totalImpressions,
    total_completions: totalCompletions,
    total_conversions: totalConversions,
    total_revenue_usd: totalRevenueUSD,
    total_revenue_micros: totalRevenueMicros,
    avg_cpm: avgCPM,
    completion_rate: completionRate,
    conversion_rate: conversionRate,
    daily_breakdown,
  };
}

/**
 * Generate per-quiz analytics report
 */
export function generateQuizAnalyticsReport(
  quiz: QuizAnalytics
): {
  quiz_id: string;
  quiz_title?: string;
  silo: string;
  stats: {
    total_starts: number;
    total_completions: number;
    total_abandonments: number;
    total_shares: number;
    total_impressions: number;
    completion_rate: number;
    share_rate: number;
    total_revenue_usd: number;
    total_revenue_micros: number;
    avg_cpm: number;
  };
  performance_indicators: {
    is_high_performer: boolean;
    reason: string;
  };
} {
  const completionRate = calculateCompletionRate(quiz.total_completions, quiz.total_starts);
  const shareRate = calculateShareRate(quiz.total_shares, quiz.total_completions);
  const revenueUSD = quiz.total_revenue_micros / IMPRESSION_MULTIPLIER;

  const isHighPerformer = completionRate > 30 || shareRate > 20;
  const reason = completionRate > 30 ? 'High completion rate' : 'High share rate';

  return {
    quiz_id: quiz.quiz_id,
    quiz_title: quiz.quiz_title,
    silo: quiz.silo,
    stats: {
      total_starts: quiz.total_starts,
      total_completions: quiz.total_completions,
      total_abandonments: quiz.total_abandonments,
      total_shares: quiz.total_shares,
      total_impressions: quiz.total_impressions,
      completion_rate: completionRate,
      share_rate: shareRate,
      total_revenue_usd: revenueUSD,
      total_revenue_micros: quiz.total_revenue_micros,
      avg_cpm: quiz.avg_cpm,
    },
    performance_indicators: {
      is_high_performer: isHighPerformer,
      reason,
    },
  };
}

/**
 * Analyze funnel metrics from user flow
 */
export function analyzeFunnelMetrics(
  userFlow: UserFlowMetrics
): {
  funnel_steps: {
    step: string;
    users: number;
    conversion_rate: number;
    drop_off_rate: number;
  }[];
  critical_drop_offs: {
    step: string;
    drop_off_rate: number;
    severity: 'low' | 'medium' | 'high';
  }[];
  overall_conversion_rate: number;
} {
  const steps = [
    { name: 'Quiz Starters', count: userFlow.quiz_starters },
    { name: 'Quiz Completers', count: userFlow.quiz_completers },
    { name: 'Result Viewers', count: userFlow.result_viewers },
    { name: 'Product Viewers', count: userFlow.product_viewers },
    { name: 'Cart Adders', count: userFlow.cart_adders },
    { name: 'Checkout Starters', count: userFlow.checkout_starters },
    { name: 'Converters', count: userFlow.converters },
  ];

  const funnelSteps = steps.map((step, index) => {
    const previousCount = index === 0 ? userFlow.total_users : steps[index - 1].count;
    const dropOffRate = previousCount === 0 ? 0 : ((previousCount - step.count) / previousCount) * 100;
    const conversionRate = userFlow.total_users === 0 ? 0 : (step.count / userFlow.total_users) * 100;

    return {
      step: step.name,
      users: step.count,
      conversion_rate: conversionRate,
      drop_off_rate: dropOffRate,
    };
  });

  const criticalDropOffs = funnelSteps
    .filter((step) => step.drop_off_rate > 20)
    .map((step) => ({
      step: step.step,
      drop_off_rate: step.drop_off_rate,
      severity: step.drop_off_rate > 50 ? 'high' : step.drop_off_rate > 30 ? 'medium' : 'low',
    })) as {
      step: string;
      drop_off_rate: number;
      severity: 'low' | 'medium' | 'high';
    }[];

  const overallConversionRate =
    userFlow.total_users === 0 ? 0 : (userFlow.converters / userFlow.total_users) * 100;

  return {
    funnel_steps: funnelSteps,
    critical_drop_offs: criticalDropOffs,
    overall_conversion_rate: overallConversionRate,
  };
}

/**
 * Estimate user value based on conversion data
 */
export function calculateUserLifetimeValue(
  totalConverters: number,
  totalRevenueUSD: number,
  totalUsers: number
): {
  revenue_per_user: number;
  revenue_per_converter: number;
  estimated_ltv_usd: number;
} {
  const revenuePerUser = totalUsers === 0 ? 0 : totalRevenueUSD / totalUsers;
  const revenuePerConverter = totalConverters === 0 ? 0 : totalRevenueUSD / totalConverters;

  // Estimate LTV assuming 3 conversions per user lifecycle
  const estimatedLTV = revenuePerConverter * 3;

  return {
    revenue_per_user: revenuePerUser,
    revenue_per_converter: revenuePerConverter,
    estimated_ltv_usd: estimatedLTV,
  };
}
