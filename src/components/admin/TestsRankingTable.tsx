'use client';

import { motion } from 'framer-motion';
import { Trophy, Sparkles, Brain, Lightbulb, Zap, HelpCircle } from 'lucide-react';

interface TestRankingRow {
  quizSlug: string;
  silo: 'personalidad' | 'trivia' | 'curiosidades' | 'util';
  totalStarts: number;
  totalCompletes: number;
  completionRate: number;
  totalImpressions: number;
  rpm: number;
}

export function TestsRankingTable({ data }: { data: TestRankingRow[] }) {
  const siloColors = {
    personalidad: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      badge: 'bg-purple-100 text-purple-800',
      progressBar: 'bg-purple-500',
      icon: <Sparkles size={18} className="text-purple-600" />
    },
    trivia: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-800',
      progressBar: 'bg-blue-500',
      icon: <Brain size={18} className="text-blue-600" />
    },
    util: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      badge: 'bg-green-100 text-green-800',
      progressBar: 'bg-green-500',
      icon: <Lightbulb size={18} className="text-green-600" />
    },
    curiosidades: {
      bg: 'bg-pink-50',
      text: 'text-pink-700',
      border: 'border-pink-200',
      badge: 'bg-pink-100 text-pink-800',
      progressBar: 'bg-pink-500',
      icon: <HelpCircle size={18} className="text-pink-600" />
    },
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100 border-b-2 border-gray-300">
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Test</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Silo</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Inicios</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Completadas</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">% Compl.</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Impresiones</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">RPM</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const colors = siloColors[row.silo];
            const isTopPerformer = row.completionRate > 80;

            return (
              <motion.tr
                key={row.quizSlug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`${colors.bg} border-b ${colors.border} hover:shadow-md transition-all cursor-pointer group`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {isTopPerformer && (
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Trophy size={18} className="text-amber-500" />
                      </motion.div>
                    )}
                    <span className="font-semibold text-gray-900 group-hover:text-gray-700">
                      {row.quizSlug}
                    </span>
                  </div>
                </td>
                <td className={`px-6 py-4 font-medium flex items-center gap-2`}>
                  {colors.icon}
                  <span className={colors.text}>
                    {row.silo.charAt(0).toUpperCase() + row.silo.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">
                  {row.totalStarts.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right font-bold text-green-600">
                  {row.totalCompletes.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-20 h-2.5 bg-gray-300 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${row.completionRate}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.05 }}
                        className={`h-full ${colors.progressBar} rounded-full`}
                      />
                    </div>
                    <span className={`font-bold text-sm ${colors.text}`}>
                      {row.completionRate}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-gray-900 font-medium">
                  {row.totalImpressions.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-bold text-lg text-green-600">
                    ${(row.rpm / 1000000).toFixed(2)}
                  </span>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
