import { describe, it, expect } from 'vitest';
import {
  calculateCPM,
  calculateCPMFromMicros,
  estimateRevenue,
  estimateRevenueMicros,
  calculateConversionRate,
  calculateCompletionRate,
  calculateShareRate,
  analyzeFunnelMetrics,
  calculateUserLifetimeValue,
} from '@/lib/monetization';

describe('CPM calculations', () => {
  it('calculateCPM: (revenue / impressions) * 1000', () => {
    expect(calculateCPM(5, 1000)).toBe(5); // $5 over 1000 impressions => $5 CPM
  });

  it('calculateCPM: returns 0 when there are no impressions', () => {
    expect(calculateCPM(5, 0)).toBe(0);
  });

  it('calculateCPMFromMicros converts micros correctly', () => {
    // 5,000,000 micros = $5 over 1000 impressions => $5 CPM
    expect(calculateCPMFromMicros(5_000_000, 1000)).toBe(5);
  });

  it('calculateCPMFromMicros: returns 0 when there are no impressions', () => {
    expect(calculateCPMFromMicros(5_000_000, 0)).toBe(0);
  });
});

describe('Revenue estimation', () => {
  it('estimateRevenue uses default CPM of 2.5', () => {
    // 1000 impressions * 2.5 / 1000 = 2.5
    expect(estimateRevenue(1000)).toBe(2.5);
  });

  it('estimateRevenue honors a custom CPM', () => {
    expect(estimateRevenue(2000, 4)).toBe(8);
  });

  it('estimateRevenueMicros returns integer micros', () => {
    // $2.5 => 2,500,000 micros
    expect(estimateRevenueMicros(1000)).toBe(2_500_000);
    expect(Number.isInteger(estimateRevenueMicros(1234, 3.3))).toBe(true);
  });
});

describe('Rate calculations', () => {
  it('conversion rate', () => {
    expect(calculateConversionRate(25, 100)).toBe(25);
    expect(calculateConversionRate(5, 0)).toBe(0);
  });

  it('completion rate', () => {
    expect(calculateCompletionRate(40, 100)).toBe(40);
    expect(calculateCompletionRate(40, 0)).toBe(0);
  });

  it('share rate', () => {
    expect(calculateShareRate(10, 50)).toBe(20);
    expect(calculateShareRate(10, 0)).toBe(0);
  });
});

describe('analyzeFunnelMetrics', () => {
  const userFlow = {
    total_users: 100,
    quiz_starters: 80,
    quiz_completers: 60,
    result_viewers: 50,
    product_viewers: 30,
    cart_adders: 20,
    checkout_starters: 10,
    converters: 5,
  } as any;

  it('produces one entry per funnel step', () => {
    const result = analyzeFunnelMetrics(userFlow);
    expect(result.funnel_steps).toHaveLength(7);
  });

  it('computes overall conversion rate from total users', () => {
    const result = analyzeFunnelMetrics(userFlow);
    expect(result.overall_conversion_rate).toBe(5); // 5/100 * 100
  });

  it('flags critical drop-offs with a valid severity', () => {
    const result = analyzeFunnelMetrics(userFlow);
    for (const drop of result.critical_drop_offs) {
      expect(['low', 'medium', 'high']).toContain(drop.severity);
      expect(drop.drop_off_rate).toBeGreaterThan(20);
    }
  });

  it('handles zero users without dividing by zero', () => {
    const empty = {
      total_users: 0,
      quiz_starters: 0,
      quiz_completers: 0,
      result_viewers: 0,
      product_viewers: 0,
      cart_adders: 0,
      checkout_starters: 0,
      converters: 0,
    } as any;
    const result = analyzeFunnelMetrics(empty);
    expect(result.overall_conversion_rate).toBe(0);
  });
});

describe('calculateUserLifetimeValue', () => {
  it('computes revenue per user and per converter', () => {
    const ltv = calculateUserLifetimeValue(10, 1000, 100);
    expect(ltv.revenue_per_user).toBe(10); // 1000 / 100
    expect(ltv.revenue_per_converter).toBe(100); // 1000 / 10
    expect(ltv.estimated_ltv_usd).toBe(300); // 100 * 3
  });

  it('guards against division by zero', () => {
    const ltv = calculateUserLifetimeValue(0, 0, 0);
    expect(ltv.revenue_per_user).toBe(0);
    expect(ltv.revenue_per_converter).toBe(0);
    expect(ltv.estimated_ltv_usd).toBe(0);
  });
});
