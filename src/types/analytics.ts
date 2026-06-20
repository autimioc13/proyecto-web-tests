// src/types/analytics.ts
import { Quiz, SiloSlug } from './quiz';

export type EventType =
  | 'quiz_started'
  | 'quiz_completed'
  | 'result_viewed'
  | 'product_viewed'
  | 'order_created'
  | 'ad_impression'
  | 'quiz_abandoned'
  | 'quiz_restarted'
  | 'quiz_shared'
  | 'product_added_to_cart'
  | 'cart_viewed'
  | 'checkout_started'
  | 'level_up'
  | 'quiz_question_view';

export interface AnalyticsEvent {
  id?: string;
  user_id?: string;
  event_type: EventType;
  quiz_id?: string;
  product_id?: string;
  order_id?: string;
  session_id: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at?: number | Date;
  timestamp?: number; // For backwards compatibility
}

export interface AnalyticsSession {
  id: string;
  user_id?: string;
  session_id: string;
  started_at: Date;
  ended_at?: Date;
  quiz_count: number;
  revenue_micros: number;
  page_views: number;
  events_count: number;
  metadata?: Record<string, any>;
}

export interface MonetizationEntry {
  id: string;
  date: Date;
  event_type: EventType;
  quiz_id?: string;
  impression_count: number;
  completion_count: number;
  click_count: number;
  conversion_count: number;
  cpm_rate: number;
  total_revenue_micros: number;
  metadata?: Record<string, any>;
}

export interface ConversionFunnel {
  id: string;
  user_id?: string;
  session_id: string;
  step_1_quiz_started?: Date;
  step_2_quiz_completed?: Date;
  step_3_result_viewed?: Date;
  step_4_product_viewed?: Date;
  step_5_product_added_to_cart?: Date;
  step_6_checkout_started?: Date;
  step_7_order_created?: Date;
  completed_steps: number;
  conversion_value_micros: number;
}

export interface AnalyticsMetrics {
  total_impressions: number;
  total_completions: number;
  total_conversions: number;
  total_revenue_micros: number;
  avg_cpm: number;
  conversion_rate: number;
  completion_rate: number;
  date_range: {
    start: Date;
    end: Date;
  };
}

export interface QuizAnalytics {
  quiz_id: string;
  silo: SiloSlug;
  quiz_title?: string;
  total_starts: number;
  total_completions: number;
  total_abandonments: number;
  total_shares: number;
  total_impressions: number;
  completion_rate: number;
  share_rate: number;
  total_revenue_micros: number;
  avg_cpm: number;
}

export interface UserFlowMetrics {
  total_users: number;
  quiz_starters: number;
  quiz_completers: number;
  result_viewers: number;
  product_viewers: number;
  cart_adders: number;
  checkout_starters: number;
  converters: number;
  funnel_drop_off: {
    step: string;
    drop_off_rate: number;
  }[];
}

export interface DailyMetrics {
  date: Date;
  impressions: number;
  completions: number;
  conversions: number;
  revenue_micros: number;
  avg_cpm: number;
}

// EventQueue type for batching
export interface EventQueueItem {
  event: AnalyticsEvent;
  timestamp: number;
}
