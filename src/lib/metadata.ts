import { Metadata } from 'next';

export const DEFAULT_METADATA: Metadata = {
  title: 'QuizLab - Tests Interactivos & Curiosidades',
  description:
    'Descubre quién eres, prueba tu conocimiento y aprende hechos sorprendentes. Tests personalizados, virales y útiles.',
  keywords: [
    'tests interactivos',
    'personalidad',
    'trivia',
    'curiosidades',
    'viral',
    'quizzes',
  ],
  openGraph: {
    title: 'QuizLab',
    description:
      'El sitio de tests más adictivo. Personalidad, trivias, curiosidades y tests útiles.',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuizLab - Tests Interactivos',
    description: 'Descubre quién eres con nuestros tests virales',
    images: [`${process.env.NEXT_PUBLIC_BASE_URL}/og-image.png`],
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
};

export const generateQuizMetadata = (
  title: string,
  description: string,
  slug: string
): Metadata => ({
  title: `${title} | QuizLab`,
  description,
  keywords: ['test', 'quiz', 'interactivo'],
  openGraph: {
    title: `${title} | QuizLab`,
    description,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/quiz/${slug}/og.png`,
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
});
