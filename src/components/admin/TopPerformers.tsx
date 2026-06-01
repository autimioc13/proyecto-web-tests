'use client';

import { Trophy, Star } from 'lucide-react';

interface TopPerformer {
  rank: number;
  quizName: string;
  category: string;
  icon: string;
  completed: number;
  revenue: number;
  rating: number;
}

export function TopPerformers({ performers }: { performers: TopPerformer[] }) {
  const medalColors: Record<number, { medal: string; bg: string }> = {
    1: { medal: '🥇', bg: 'from-yellow-400 to-yellow-600' },
    2: { medal: '🥈', bg: 'from-gray-300 to-gray-500' },
    3: { medal: '🥉', bg: 'from-orange-300 to-orange-500' },
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
              className={`bg-gradient-to-r ${medal.bg} p-1 rounded-lg hover:shadow-lg transition-shadow`}
            >
              <div className="bg-white rounded-lg p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{medal.medal}</span>
                  
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{perf.quizName}</h3>
                    <p className="text-sm text-gray-600">{perf.category} {perf.icon}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8 text-right">
                  <div>
                    <p className="text-gray-600 text-xs">Completados</p>
                    <p className="text-2xl font-bold text-gray-900">{perf.completed}</p>
                  </div>

                  <div>
                    <p className="text-gray-600 text-xs">Ingresos</p>
                    <p className="text-2xl font-bold text-green-600">${perf.revenue}</p>
                  </div>

                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < perf.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="mt-6 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-shadow">
        Ver Top 10 Completo ⭐
      </button>
    </div>
  );
}
