import { Quiz, ResultPacket } from '@/types';

interface ScoreMap {
  [dimensionId: string]: number;
}

export const calculateUseful = (
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
      title: 'Perfil Mixto',
      description: 'Tu perfil combina múltiples dimensiones',
      shareText: 'Descubrí mi perfil en ' + quiz.title,
    };

  const confidence = Math.round((maxScore / (quiz.questions.length * 5)) * 100);
  const rarityLabel = `Tu perfil ${selectedResult.title} es único`;

  return {
    result: selectedResult,
    confidence: Math.min(100, confidence),
    confidenceLevel: confidence >= 70 ? 'high' : confidence >= 40 ? 'medium' : 'low',
    rarityLabel,
    scoreBreakdown: scores,
    recommendation: `Basado en tu perfil, te recomendamos explorar recursos sobre ${selectedResult.title.toLowerCase()}.`,
    type: 'useful',
  };
};
