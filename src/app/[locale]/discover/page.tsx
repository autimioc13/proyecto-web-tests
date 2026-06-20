'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Zap, Grid3X3 } from 'lucide-react';
import QuizCard from '@/components/QuizCard';
import { Quiz, SiloSlug } from '@/types';

// Category data
const CATEGORIES: Array<{
  slug: SiloSlug;
  label: string;
  emoji: string;
  color: string;
  description: string;
}> = [
  {
    slug: 'personalidad',
    label: 'Personalidad',
    emoji: '🧠',
    color: 'from-purple-400 to-purple-600',
    description: 'Descubre tu tipo de personalidad',
  },
  {
    slug: 'trivia',
    label: 'Trivia',
    emoji: '🧠',
    color: 'from-blue-400 to-blue-600',
    description: 'Pon a prueba tus conocimientos',
  },
  {
    slug: 'curiosidades',
    label: 'Curiosidades',
    emoji: '💡',
    color: 'from-yellow-400 to-yellow-600',
    description: 'Aprende datos fascinantes',
  },
  {
    slug: 'util',
    label: 'Útil',
    emoji: '⚡',
    color: 'from-green-400 to-green-600',
    description: 'Contenido práctico y aplicable',
  },
  {
    slug: 'personalidad',
    label: 'Emociones',
    emoji: '❤️',
    color: 'from-red-400 to-red-600',
    description: 'Explora tu inteligencia emocional',
  },
  {
    slug: 'trivia',
    label: 'Historia',
    emoji: '📚',
    color: 'from-indigo-400 to-indigo-600',
    description: 'Viaja por la historia',
  },
];

interface DailyChallenge {
  quiz: Quiz;
  date: string;
  xpReward: number;
}

interface TrendingQuiz extends Quiz {
  trendScore: number;
  participantsToday: number;
}

export default function DiscoverPage() {
  const [trendingQuizzes, setTrendingQuizzes] = useState<TrendingQuiz[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, fetch trending quizzes from your API
        // For now, we'll set up the structure
        setTrendingQuizzes([]);
        setDailyChallenge(null);
      } catch (error) {
        console.error('Error fetching discover data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Descubre Quizzes</h1>
          <p className="text-purple-100">Encuentra nuevos desafíos y demuestra tus conocimientos</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Daily Challenge Section */}
        {dailyChallenge && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <Zap className="text-yellow-500" />
              Desafío del Día
            </h2>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1">
                  <div className="text-6xl mb-4">{dailyChallenge.quiz.emoji}</div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {dailyChallenge.quiz.title}
                  </h3>
                  <p className="text-gray-700 mb-4">{dailyChallenge.quiz.description}</p>
                  <div className="flex items-center gap-4">
                    <span className="inline-block bg-yellow-200 text-yellow-800 font-bold px-4 py-2 rounded-lg">
                      +{dailyChallenge.xpReward} XP
                    </span>
                    <Link href={`/quiz/${dailyChallenge.quiz.slug}`}>
                      <button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105">
                        Jugar Ahora
                      </button>
                    </Link>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-7xl">{dailyChallenge.quiz.emoji}</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Trending Section */}
        {trendingQuizzes.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <Flame className="text-red-500" />
              En Tendencia
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingQuizzes.map((quiz) => (
                <div key={quiz.slug} className="relative">
                  <QuizCard quiz={quiz} />
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    🔥 {quiz.participantsToday} hoy
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Categories Grid */}
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Grid3X3 className="text-blue-500" />
            Categorías
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {CATEGORIES.map((category) => (
              <Link key={category.slug} href={`/discover/${category.slug}`}>
                <div
                  className={`bg-gradient-to-br ${category.color} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition transform hover:scale-105 cursor-pointer h-full flex flex-col justify-between`}
                >
                  <div>
                    <div className="text-5xl mb-4">{category.emoji}</div>
                    <h3 className="text-2xl font-bold mb-2">{category.label}</h3>
                    <p className="text-white/90">{category.description}</p>
                  </div>
                  <div className="mt-6 text-white/80 text-sm font-semibold">
                    Ver quizzes →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Empty State */}
        {!loading && trendingQuizzes.length === 0 && !dailyChallenge && (
          <section className="text-center py-12">
            <p className="text-gray-500 text-lg">Cargando quizzes en tendencia...</p>
          </section>
        )}
      </div>
    </main>
  );
}
