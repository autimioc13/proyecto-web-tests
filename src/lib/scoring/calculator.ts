import { Question, TestSession } from '@/lib/types/test';

export interface ScoreResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  passed: boolean; // score >= 60
}

/**
 * Calculate score for a completed test
 */
export function calculateScore(
  questions: Question[],
  session: TestSession
): ScoreResult {
  let correctAnswers = 0;

  // Count correct answers
  questions.forEach((question) => {
    const userAnswerId = session.answers.get(question.id);
    if (userAnswerId === question.correctOptionId) {
      correctAnswers++;
    }
  });

  const totalQuestions = questions.length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  const grade = getGrade(score);
  const passed = score >= 60;

  return {
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    score,
    grade,
    passed,
  };
}

/**
 * Get letter grade from score (0-100)
 */
function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Get color for grade (for UI display)
 */
export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A':
      return 'text-green-400';
    case 'B':
      return 'text-blue-400';
    case 'C':
      return 'text-yellow-400';
    case 'D':
      return 'text-orange-400';
    case 'F':
      return 'text-red-400';
    default:
      return 'text-slate-400';
  }
}

/**
 * Get background color for grade
 */
export function getGradeBgColor(grade: string): string {
  switch (grade) {
    case 'A':
      return 'bg-green-900/30';
    case 'B':
      return 'bg-blue-900/30';
    case 'C':
      return 'bg-yellow-900/30';
    case 'D':
      return 'bg-orange-900/30';
    case 'F':
      return 'bg-red-900/30';
    default:
      return 'bg-slate-900/30';
  }
}
