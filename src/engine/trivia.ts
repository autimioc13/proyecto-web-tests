import { Quiz, ResultPacket } from '@/types';

export const calculateTrivia = (
  quiz: Quiz,
  answers: Map<string, string>
): ResultPacket => {
  let correctCount = 0;

  answers.forEach((optionId, questionId) => {
    const question = quiz.questions.find((q) => q.id === questionId);
    if (question && question.correct === optionId) {
      correctCount++;
    }
  });

  const totalQuestions = quiz.questions.length;
  const scorePercent = (correctCount / totalQuestions) * 100;

  let selectedResult = quiz.results[quiz.results.length - 1];
  for (const result of quiz.results) {
    if (result.minScore === undefined || scorePercent >= result.minScore) {
      selectedResult = result;
      break;
    }
  }

  const percentile = Math.round(scorePercent + Math.random() * 10);
  const rarityLabel = `Top ${Math.max(10, 100 - Math.round(percentile))}% de jugadores`;

  return {
    result: selectedResult,
    confidence: scorePercent,
    confidenceLevel:
      scorePercent >= 70 ? 'high' : scorePercent >= 40 ? 'medium' : 'low',
    rarityLabel,
    scoreBreakdown: {
      'Correctas': correctCount,
      'Incorrectas': totalQuestions - correctCount,
      'Porcentaje': Math.round(scorePercent),
    },
    type: 'trivia',
  };
};
