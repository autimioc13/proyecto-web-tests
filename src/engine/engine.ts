import { Quiz, ResultPacket } from '@/types';
import { calculatePersonality } from './personality';
import { calculateTrivia } from './trivia';
import { calculateCuriosity } from './curiosity';
import { calculateUseful } from './useful';

export const calculateResult = (
  quiz: Quiz,
  answers: Map<string, string>
): ResultPacket => {
  switch (quiz.type) {
    case 'personality':
      return calculatePersonality(quiz, answers);
    case 'trivia':
      return calculateTrivia(quiz, answers);
    case 'curiosity':
      return calculateCuriosity(quiz, answers);
    case 'useful':
      return calculateUseful(quiz, answers);
    default:
      throw new Error(`Unknown quiz type: ${quiz.type}`);
  }
};
