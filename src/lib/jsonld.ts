import { Quiz } from '@/types';

export const generateQuizSchema = (quiz: Quiz, baseUrl: string) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: quiz.title,
    description: quiz.description,
    url: `${baseUrl}/quiz/${quiz.slug}`,
    image: `${baseUrl}/quiz/${quiz.slug}/og.png`,
    datePublished: quiz.createdAt || new Date().toISOString(),
    estimatedDuration: `PT${quiz.timeMinutes}M`,
    numberOfQuestions: quiz.questions.length,
    quizType: quiz.type,
  };
};
