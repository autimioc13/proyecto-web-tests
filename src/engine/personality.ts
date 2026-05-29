import { Quiz, ResultPacket, ResultOption } from '@/types';

interface ScoreMap {
  [resultId: string]: number;
}

export const calculatePersonality = (
  quiz: Quiz,
  answers: Map<string, string>
): ResultPacket => {
  const scores: ScoreMap = {};
  quiz.results.forEach((r) => {
    scores[r.id || 'default'] = 0;
  });

  answers.forEach((optionId, questionId) => {
    const question = quiz.questions.find((q) => q.id === questionId);
    if (!question) return;

    const option = question.options.find((o) => o.id === optionId);
    if (!option || !option.values) return;

    Object.entries(option.values).forEach(([resultId, points]) => {
      scores[resultId] = (scores[resultId] || 0) + points;
    });
  });

  let maxResultId = Object.keys(scores)[0];
  let maxScore = scores[maxResultId];

  Object.entries(scores).forEach(([id, score]) => {
    if (score > maxScore) {
      maxScore = score;
      maxResultId = id;
    }
  });

  const selectedResult = quiz.results.find((r) => r.id === maxResultId) ||
    quiz.results[0] || {
      emoji: '❓',
      title: 'Desconocido',
      description: 'No pudimos determinar tu resultado',
      shareText: 'Realicé un test pero obtuve un resultado inesperado',
    };

  const sorted = Object.values(scores).sort((a, b) => b - a);
  const gap = maxScore - (sorted[1] || 0);
  const maxPossibleGap = quiz.questions.length * 5;
  const confidence = Math.min(100, (gap / maxPossibleGap) * 100);

  let secondaryProfile: ResultOption | undefined;
  if (confidence < 30 && sorted[1] > 0) {
    const secondMaxResultId = Object.entries(scores).sort(
      ([, a], [, b]) => b - a
    )[1]?.[0];
    if (secondMaxResultId) {
      secondaryProfile = quiz.results.find((r) => r.id === secondMaxResultId);
    }
  }

  const rarityPercent = 100 - Math.round((1 / quiz.results.length) * 100);
  const rarityLabel = `Solo el ${Math.max(10, rarityPercent)}% obtiene "${selectedResult.title}"`;

  return {
    result: selectedResult,
    confidence: Math.round(confidence),
    confidenceLevel:
      confidence >= 70 ? 'high' : confidence >= 40 ? 'medium' : 'low',
    secondaryProfile,
    rarityLabel,
    type: 'personality',
  };
};
