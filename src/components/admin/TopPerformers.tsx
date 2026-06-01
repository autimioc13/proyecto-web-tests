'use client';

import { motion } from 'framer-motion';
import { Trophy, Star, Zap } from 'lucide-react';

interface TopPerformer {
  rank: number;
  quizSlug: string;
  silo: 'personalidad' | 'trivia' | 'curiosidades' | 'util';
  completed: number;
  revenue: number;
  rating: number;
  completionRate: number;
}

export function TopPerformers({ performers }: { performers: TopPerformer[] }) {
  const medalColors = {
    1: { bg: 'from-yellow-400 to-yellow-600', medal: '🥇', text: 'text-yellow-700' },
    2: { bg: 'from-gray-300 to-gray-500', medal: '🥈', text: 'text-gray-700' },
    3: { bg: 'from-orange-300 to-orange-500', medal: '🥉', text: 'text-orange-700' },
  };

  const siloIcons = {
    personalidad: '✨',
    trivia: '🧠',
    util: '💡',
    curiosidades: '❓',
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Trophy className="text-yellow-500" size={28} />
        Top Performers
      </h2>

      <div className="space-y-4">
        {performers.slice(0, 3).map((perf, idx) => {
          const medal = medalColors[perf.rank as 1 | 2 | 3] || medalColors[3];
          const icon = siloIcons[perf.silo];

          return (
            <motion.div
              key={perf.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-gradient-to-r ${medal.bg} p-1 rounded-lg`}
            >
              <div className="bg-white rounded-lg p-6 flex items-center justify-between">
                {/* Left section: Medal and Quiz info */}
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-5xl">{medal.medal}</span>

                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{perf.quizSlug}</h3>
                    <p className="text-sm text-gray-600">
                      {perf.silo.charAt(0).toUpperCase() + perf.silo.slice(1)} {icon}
                    </p>
                  </div>
                </div>

                {/* Right section: Stats */}
                <div className="flex items-center gap-8 text-right">
                  {/* Completed */}
                  <div className="hidden sm:block">
                    <p className="text-gray-600 text-xs font-semibold">Completados</p>
                    <p className="text-2xl font-bold text-gray-900">{perf.completed}</p>
                  </div>

                  {/* Revenue */}
                  <div className="hidden md:block">
                    <p className="text-gray-600 text-xs font-semibold">Ingresos</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${(perf.revenue / 1000000).toFixed(2)}
                    </p>
                  </div>

                  {/* Completion Rate */}
                  <div className="hidden lg:block">
                    <p className="text-gray-600 text-xs font-semibold">% Compl.</p>
                    <p className="text-2xl font-bold text-blue-600">{perf.completionRate}%</p>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: idx * 0.1 + i * 0.05 }}
                      >
                        <Star
                          size={20}
                          className={
                            i < perf.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* View More Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-6 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
      >
        <Zap size={20} />
        Ver Top 10 Completo
      </motion.button>
    </div>
  );
}
