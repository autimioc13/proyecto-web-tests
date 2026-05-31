import { getAllQuizzes, getTrendingQuizzes } from '@/data/helpers';
import { getAllSilos } from '@/data/silos';
import { fetchTestCategories } from '@/lib/api/tests';
import QuizCard from '@/components/QuizCard';
import TestCard from '@/components/tests/TestCard';
import AdSlot from '@/components/AdSlot';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function Home() {
  const allQuizzes = await getAllQuizzes();
  const trendingQuizzes = await getTrendingQuizzes(4);
  const silos = getAllSilos();
  const testCategories = await fetchTestCategories();

  return (
    <div className="space-y-16 py-12">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-slate-900 via-purple-800 to-slate-900 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Tests que revelan quién eres realmente
          </h1>
          <p className="text-lg sm:text-xl mb-8 text-purple-200 max-w-3xl mx-auto">
            Descubre tu personalidad, prueba tu conocimiento y aprende hechos sorprendentes con nuestros tests interactivos y virales.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-12">
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6 border border-white border-opacity-20">
              <div className="text-3xl font-bold text-purple-300">250+</div>
              <div className="text-sm text-purple-200 mt-2">Tests Disponibles</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6 border border-white border-opacity-20">
              <div className="text-3xl font-bold text-purple-300">1M+</div>
              <div className="text-sm text-purple-200 mt-2">Usuarios Activos</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6 border border-white border-opacity-20">
              <div className="text-3xl font-bold text-purple-300">98%</div>
              <div className="text-sm text-purple-200 mt-2">Satisfacción</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6 border border-white border-opacity-20">
              <div className="text-3xl font-bold text-purple-300">100%</div>
              <div className="text-sm text-purple-200 mt-2">Precisión Científica</div>
            </div>
          </div>

          <Link href="/personalidad" className="btn-primary bg-white text-purple-600 hover:bg-gray-100 inline-block">
            Comenzar Ahora →
          </Link>
        </div>
      </section>

      {/* TEST CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Categorías de Tests</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explora diferentes tipos de tests diseñados para descubrir aspectos únicos de tu personalidad e inteligencia.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testCategories.map((category) => (
            <TestCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* AD SLOT 1 */}
      <div className="max-w-7xl mx-auto px-4">
        <AdSlot slotId="home_top_banner" style="banner" />
      </div>

      {/* FEATURED TEST */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Test Destacado 🌟</h2>
        {trendingQuizzes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-1">
              <QuizCard quiz={trendingQuizzes[0]} />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4">{trendingQuizzes[0].title}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {trendingQuizzes[0].description}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                ⏱️ {trendingQuizzes[0].timeMinutes} minutos • {trendingQuizzes[0].questions.length}{' '}
                preguntas
              </p>
              <Link href={`/quiz/${trendingQuizzes[0].slug}`} className="btn-primary w-fit">
                Empezar Test →
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* AD SLOT 2 */}
      <div className="max-w-7xl mx-auto px-4">
        <AdSlot slotId="home_middle_banner" style="banner" />
      </div>

      {/* SILOS GRID */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Explora por Categoría</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {silos.map((silo) => (
            <Link key={silo.slug} href={`/${silo.slug}`}>
              <div className={`bg-gradient-to-br ${silo.color} text-white p-8 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer h-full flex flex-col justify-center`}>
                <div className="text-5xl mb-4">{silo.emoji}</div>
                <h3 className="text-2xl font-bold mb-2">{silo.label}</h3>
                <p className="text-sm opacity-90 mb-4">{silo.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TRENDING TESTS */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Tests Populares 🔥</h2>
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2">
            Ver más <ArrowRight size={20} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingQuizzes.slice(0, 4).map((quiz) => (
            <QuizCard key={quiz.slug} quiz={quiz} />
          ))}
        </div>
      </section>

      {/* AD SLOT 3 */}
      <div className="max-w-7xl mx-auto px-4">
        <AdSlot slotId="home_bottom_banner" style="banner" />
      </div>
    </div>
  );
}
