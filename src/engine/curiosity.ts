import { Quiz, ResultPacket } from '@/types';

export const calculateCuriosity = (
  quiz: Quiz,
  answers: Map<string, string>
): ResultPacket => {
  const selectedResult = quiz.results[0];
  const curiosityScore = Math.min(100, answers.size * 20 + Math.random() * 30);

  const rarityLabel =
    curiosityScore > 80
      ? 'Eres un amante genuino de las curiosidades'
      : curiosityScore > 50
        ? 'Te encanta aprender hechos nuevos'
        : 'Descubriste algo nuevo hoy';

  return {
    result: selectedResult,
    confidence: curiosityScore,
    confidenceLevel: curiosityScore > 70 ? 'high' : 'medium',
    rarityLabel,
    type: 'curiosity',
  };
};
