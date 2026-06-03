'use client';

import { Trophy, Star } from 'lucide-react';

interface TopPerformer {
  rank: number;
  quizSlug?: string;
  silo?: string;
  completed?: number;
  revenue?: number;
  rating?: number;
}

export function TopPerformers({ performers }: { performers: TopPerformer[] }) {
  const medalColors: Record<number, { medal: string; bg: string }> = {
    1: { medal: '🥇', bg: '' },
    2: { medal: '🥈', bg: '' },
    3: { medal: '🥉', bg: '' },
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">🏆 Top Performers</h2>
      
      <div className="space-y-4">
        {performers.slice(0, 3).map((perf) => {
          const medal = medalColors[perf.rank] || medalColors[3];
          
          return (
            <div
              key={perf.rank}
              className="rounded-xl hover:shadow-lg transition-shadow"
            >
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-xl p-5 flex items-center justify-between border border-white/20 hover:bg-white/15 dark:hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{medal.medal}</span>

                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{perf.quizSlug || 'Quiz'}</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{perf.silo || 'general'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8 text-right">
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 text-xs">Completados</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{perf.completed || 0}</p>
                  </div>

                  <div>
                    <p className="text-gray-700 dark:text-gray-300 text-xs">Ingresos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">${perf.revenue || 0}</p>
                  </div>

                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < (perf.rating || 0) ? 'fill-white text-white' : 'text-gray-400'}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="mt-6 w-full bg-white/20 dark:bg-white/10 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:bg-white/30 dark:hover:bg-white/15 transition-all border border-white/20">
        Ver Top 10 Completo ⭐
      </button>
    </div>
  );
}
