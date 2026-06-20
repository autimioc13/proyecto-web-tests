import { getSiloInfo, getAllSilos } from '@/data/silos';
import { getQuizzesBySilo } from '@/data/helpers';
import QuizCard from '@/components/QuizCard';
import AdSlot from '@/components/AdSlot';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export async function generateStaticParams() {
  const silos = getAllSilos();
  return silos.map((silo) => ({
    silo: silo.slug,
  }));
}

interface SiloPageProps {
  params: Promise<{ silo: string }>;
}

export async function generateMetadata({ params }: SiloPageProps): Promise<Metadata> {
  const { silo: siloSlug } = await params;
  const silo = getSiloInfo(siloSlug);

  if (!silo) notFound();

  return {
    title: `${silo.label} | QuizLab`,
    description: silo.description,
    keywords: [`${silo.label}`, 'tests', 'quizzes'],
    openGraph: {
      title: `${silo.label} | QuizLab`,
      description: silo.description,
      type: 'website',
    },
  };
}

export default async function SiloPage({ params }: SiloPageProps) {
  const { silo: siloSlug } = await params;
  const silo = getSiloInfo(siloSlug);

  if (!silo) notFound();

  const quizzes = await getQuizzesBySilo(silo.slug as any);

  return (
    <div className="space-y-12 py-12">
      {/* HERO SECTION */}
      <section className={`bg-gradient-to-r ${silo.color} text-white py-16 px-4`}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-6xl mb-4">{silo.emoji}</div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{silo.label}</h1>
          <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto">{silo.description}</p>
          <p className="mt-6 text-sm opacity-75">
            {quizzes.length} test{quizzes.length !== 1 ? 's' : ''} disponible{quizzes.length !== 1 ? 's' : ''}
          </p>
        </div>
      </section>

      {/* AD SLOT */}
      <div className="max-w-7xl mx-auto px-4">
        <AdSlot slotId={`silo_${siloSlug}_top`} style="banner" />
      </div>

      {/* QUIZZES GRID */}
      <section className="max-w-7xl mx-auto px-4">
        {quizzes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.slug} quiz={quiz} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No hay tests disponibles en esta categoría aún.</p>
          </div>
        )}
      </section>

      {/* AD SLOT */}
      <div className="max-w-7xl mx-auto px-4">
        <AdSlot slotId={`silo_${siloSlug}_bottom`} style="banner" />
      </div>
    </div>
  );
}
