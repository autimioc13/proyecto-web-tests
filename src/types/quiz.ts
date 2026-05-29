// src/types/quiz.ts

export type QuizType = 'personality' | 'trivia' | 'curiosity' | 'useful';
export type SiloSlug = 'personalidad' | 'trivia' | 'curiosidades' | 'util';

export interface SiloInfo {
  slug: SiloSlug;
  label: string;
  color: string;
  emoji: string;
  description?: string;
}

export interface Option {
  id: string;
  text: string;
  values?: Record<string, number>; // Para personality: { resultId: points }
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  correct?: string; // Para trivia: ID de la opción correcta
}

export interface ResultOption {
  id?: string;
  minScore?: number; // Para trivia/curiosity: umbral de puntuación
  emoji: string;
  title: string;
  description: string;
  shareText: string;
  offer?: {
    type: 'ad' | 'affiliate' | 'own_product';
    url: string;
    copy: string;
  };
}

export interface Quiz {
  slug: string;
  silo: SiloSlug;
  type: QuizType;
  title: string;
  description: string;
  timeMinutes: number;
  emoji: string;
  questions: Question[];
  results: ResultOption[];
  tags?: string[];
  createdAt?: string;
}

export interface ResultPacket {
  result: ResultOption;
  confidence: number; // 0-100
  confidenceLevel: 'low' | 'medium' | 'high';
  secondaryProfile?: ResultOption;
  rarityLabel: string; // "solo el X% obtiene esto"
  scoreBreakdown?: Record<string, number>;
  recommendation?: string;
  type: QuizType;
}

export interface AnalyticsEvent {
  eventName: 'quiz_start' | 'quiz_question_view' | 'quiz_complete' | 'quiz_abandon' | 'quiz_share' | 'quiz_restart' | 'ad_impression';
  quizSlug: string;
  timestamp: number;
  sessionId: string;
  metadata?: Record<string, any>;
}

export interface AggregatedMetrics {
  quizSlug: string;
  silo: SiloSlug;
  totalStarts: number;
  totalCompletes: number;
  totalAbandoms: number;
  totalShares: number;
  totalImpressions: number;
  completionRate: number;
  shareRate: number;
  rpm: number; // impresiones por resultado, multiplicado por CPM
  estRevenue: number; // en micros (1 USD = 1M)
}

export interface RecommendationScore {
  score: number;
  reason: string;
}
