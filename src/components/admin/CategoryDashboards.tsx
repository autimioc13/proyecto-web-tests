'use client';

interface Metric {
  silo?: string;
  totalCompletes?: number;
  estRevenue?: number;
  completionRate?: number;
  quizSlug?: string;
}

export function CategoryDashboards({ metrics }: { metrics: Metric[] }) {
  const categoryColors: Record<string, string> = {
    purple: 'from-purple-400 to-purple-600',
    blue: 'from-blue-400 to-blue-600',
    green: 'from-green-400 to-green-600',
    amber: 'from-amber-400 to-amber-600',
    orange: 'from-orange-400 to-orange-600',
    pink: 'from-pink-400 to-pink-600',
  };

  const categoryData = [
    { silo: 'personalidad', color: 'purple', icon: '💜' },
    { silo: 'inteligencia', color: 'blue', icon: '🔵' },
    { silo: 'logica', color: 'green', icon: '💚' },
    { silo: 'conocimiento', color: 'amber', icon: '🟡' },
    { silo: 'productividad', color: 'orange', icon: '🟠' },
    { silo: 'curiosidades', color: 'pink', icon: '💗' },
  ];

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">📊 Métricas por Categoría</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryData.map((cat) => {
          const catMetrics = metrics.filter(m => m.silo === cat.silo);
          const totalCompleted = catMetrics.reduce((sum, m) => sum + (m.totalCompletes || 0), 0);
          const avgRevenue = catMetrics.reduce((sum, m) => sum + (m.estRevenue || 0), 0);
          const avgCompletion = catMetrics.length > 0
            ? Math.round(catMetrics.reduce((sum, m) => sum + (m.completionRate || 0), 0) / catMetrics.length)
            : 0;
          const topQuiz = catMetrics[0]?.quizSlug || 'N/A';
          const topQuizStarts = catMetrics[0]?.totalCompletes || 0;

          return (
            <div
              key={cat.silo}
              className={`bg-gradient-to-br ${categoryColors[cat.color]} p-1 rounded-xl hover:shadow-lg transition-shadow`}
            >
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-xl p-6 h-full border border-white/20 hover:bg-white/15 dark:hover:bg-white/10 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-3xl mb-1">{cat.icon}</p>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{cat.silo}</h3>
                  </div>
                  <span className={`text-2xl font-bold bg-gradient-to-r ${categoryColors[cat.color]} bg-clip-text text-transparent`}>
                    ${avgRevenue}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 text-sm">Completados</span>
                    <span className="font-bold text-gray-900 dark:text-white">{totalCompleted}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 text-sm">% Completación</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-white/20 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${categoryColors[cat.color]}`}
                          style={{ width: `${avgCompletion}%` }}
                        />
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">{avgCompletion}%</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    <p className="text-gray-700 dark:text-gray-300 text-xs mb-1">Top Quiz</p>
                    <p className="font-bold text-gray-900 dark:text-white mb-1">{topQuiz}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">{topQuizStarts} intentos</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
