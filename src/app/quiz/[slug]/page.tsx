import { getQuizBySlug, getAllQuizzes } from '@/data/helpers';
import { generateQuizMetadata } from '@/lib/metadata';
import { generateQuizSchema } from '@/lib/jsonld';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const QuizEngine = dynamic(() => import('@/components/QuizEngine'), {
  ssr: false,
});

export async function generateStaticParams() {
  const quizzes = await getAllQuizzes();
  return quizzes.map((quiz) => ({
    slug: quiz.slug,
  }));
}

interface QuizPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: QuizPageProps): Promise<Metadata> {
  const { slug } = await params;
  const quiz = await getQuizBySlug(slug);

  if (!quiz) notFound();

  return generateQuizMetadata(quiz.title, quiz.description, slug);
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { slug } = await params;
  const quiz = await getQuizBySlug(slug);

  if (!quiz) notFound();

  const schema = generateQuizSchema(quiz, process.env.NEXT_PUBLIC_BASE_URL || '');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <QuizEngine quiz={quiz} />
        </div>
      </div>
    </>
  );
}
