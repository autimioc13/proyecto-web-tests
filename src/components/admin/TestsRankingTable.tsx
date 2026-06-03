'use client';

import { Trophy } from 'lucide-react';

interface Metric {
  quizSlug?: string;
  silo?: string;
  totalCompletes?: number;
  completionRate?: number;
}

export function TestsRankingTable({ data }: { data: Metric[] }) {
  const siloColors: Record<string, string> = {
    personalidad: 'bg-purple-50',
    inteligencia: 'bg-blue-50',
    logica: 'bg-green-50',
    conocimiento: 'bg-amber-50',
    productividad: 'bg-orange-50',
    curiosidades: 'bg-pink-50',
  };

  return (
    <div className="overflow-x-auto bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg">
      <table className="w-full">
        <thead>
          <tr className="bg-white/15 dark:bg-white/10 border-b border-white/20">
            <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">TEST</th>
            <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">SILO</th>
            <th className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">COMPLETADAS</th>
            <th className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">% COMPL.</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const isTopPerformer = (row.completionRate || 0) > 80;

            return (
              <tr key={idx} className="border-b border-white/10 hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {isTopPerformer && <Trophy size={18} className="text-amber-500" />}
                    <span className="font-medium text-gray-900 dark:text-white">{row.quizSlug || 'Quiz'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{row.silo || 'General'}</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{row.totalCompletes || 0}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-2 bg-white/20 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `${row.completionRate || 0}%` }}
                      />
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{row.completionRate || 0}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
