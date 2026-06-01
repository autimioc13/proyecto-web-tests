'use client';

import { motion } from 'framer-motion';
import { Users, Target, TrendingUp, DollarSign, Sparkles, Brain, Lightbulb, HelpCircle } from 'lucide-react';
import { AggregatedMetrics } from '@/types';

interface CategoryDashboard {
  silo: 'personalidad' | 'trivia' | 'curiosidades' | 'util';
  name: string;
  emoji: string;
  icon: React.ReactNode;
  color: 'purple' | 'blue' | 'green' | 'pink';
  totalCompletes: number;
  totalRevenue: number;
  avgCompletion: number;
  topQuiz: string;
  topQuizStarts: number;
  totalTests: number;
}

const SILO_CONFIG = {
  personalidad: {
    name: 'Personalidad',
    emoji: '✨',
    color: 'purple' as const,
    icon: <Sparkles size={24} className="text-purple-600" />
  },
  trivia: {
    name: 'Trivia',
    emoji: '🧠',
    color: 'blue' as const,
    icon: <Brain size={24} className="text-blue-600" />
  },
  util: {
    name: 'Productividad',
    emoji: '💡',
    color: 'green' as const,
    icon: <Lightbulb size={24} className="text-green-600" />
  },
  curiosidades: {
    name: 'Curiosidades',
    emoji: '❓',
    color: 'pink' as const,
    icon: <HelpCircle size={24} className="text-pink-600" />
  }
};

const COLOR_GRADIENTS = {
  purple: 'from-purple-400 to-purple-600',
  blue: 'from-blue-400 to-blue-600',
  green: 'from-green-400 to-green-600',
  pink: 'from-pink-400 to-pink-600',
};

const COLOR_BARS = {
  purple: 'bg-purple-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  pink: 'bg-pink-500',
};

export function CategoryDashboards({ metrics }: { metrics: AggregatedMetrics[] }) {
  // Agrupar métricas por silo
  const categoryMap = new Map<string, CategoryDashboard>();

  // Inicializar categorías
  Object.entries(SILO_CONFIG).forEach(([silo, config]) => {
    categoryMap.set(silo, {
      silo: silo as any,
      name: config.name,
      emoji: config.emoji,
      icon: config.icon,
      color: config.color,
      totalCompletes: 0,
      totalRevenue: 0,
      avgCompletion: 0,
      topQuiz: '-',
      topQuizStarts: 0,
      totalTests: 0
    });
  });

  // Acumular datos por categoría
  const completionRates: Record<string, number[]> = {
    personalidad: [],
    trivia: [],
    util: [],
    curiosidades: []
  };

  metrics.forEach((m) => {
    const cat = categoryMap.get(m.silo);
    if (cat) {
      cat.totalCompletes += m.totalCompletes;
      cat.totalRevenue += m.estRevenue;
      cat.totalTests += 1;
      completionRates[m.silo].push(m.completionRate);

      // Encontrar top quiz
      if (m.totalStarts > cat.topQuizStarts) {
        cat.topQuizStarts = m.totalStarts;
        cat.topQuiz = m.quizSlug;
      }
    }
  });

  // Calcular promedios de completación
  Object.entries(completionRates).forEach(([silo, rates]) => {
    const cat = categoryMap.get(silo);
    if (cat && rates.length > 0) {
      cat.avgCompletion = Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
    }
  });

  const categories = Array.from(categoryMap.values());

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <TrendingUp size={28} className="text-purple-600" />
        Métricas por Categoría
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat, idx) => {
          const gradient = COLOR_GRADIENTS[cat.color];
          const barColor = COLOR_BARS[cat.color];
          const revenueUSD = cat.totalRevenue / 1000000;

          return (
            <motion.div
              key={cat.silo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-gradient-to-br ${gradient} p-1 rounded-lg shadow-lg hover:shadow-xl transition-shadow`}
            >
              <div className="bg-white rounded-lg p-6 h-full">
                {/* Header con emoji y nombre */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-4xl mb-2">{cat.emoji}</p>
                    <h3 className="text-lg font-bold text-gray-900">{cat.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{cat.totalTests} tests</p>
                  </div>
                  <span className={`text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                    ${revenueUSD.toFixed(2)}
                  </span>
                </div>

                {/* Separador */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Estadísticas */}
                <div className="space-y-4">
                  {/* Completados */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users size={16} />
                      <span className="text-sm">Completados</span>
                    </div>
                    <span className="font-bold text-gray-900">{cat.totalCompletes.toLocaleString()}</span>
                  </div>

                  {/* Completación Promedio */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Target size={16} />
                        <span className="text-sm">Completación Prom.</span>
                      </div>
                      <span className="font-bold text-gray-900">{cat.avgCompletion}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.avgCompletion}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`h-full ${barColor} rounded-full`}
                      />
                    </div>
                  </div>

                  {/* Top Quiz */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-gray-600 text-xs mb-2 font-semibold uppercase tracking-wide">Top Quiz</p>
                    <p className="font-bold text-gray-900 text-sm mb-1">{cat.topQuiz}</p>
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                      <span>📊</span>
                      {cat.topQuizStarts.toLocaleString()} intentos
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
