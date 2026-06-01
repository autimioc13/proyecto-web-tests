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
              className={`bg-gradient-to-br ${categoryColors[cat.color]} p-1 rounded-lg hover:shadow-lg transition-shadow`}
            >
              <div className="bg-white rounded-lg p-6 h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-3xl mb-1">{cat.icon}</p>
                    <h3 className="text-lg font-bold text-gray-900">{cat.silo}</h3>
                  </div>
                  <span className={`text-2xl font-bold bg-gradient-to-r ${categoryColors[cat.color]} bg-clip-text text-transparent`}>
                    ${avgRevenue}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Completados</span>
                    <span className="font-bold text-gray-900">{totalCompleted}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">% Completación</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${categoryColors[cat.color]}`}
                          style={{ width: `${avgCompletion}%` }}
                        />
                      </div>
                      <span className="font-bold text-gray-900">{avgCompletion}%</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-gray-600 text-xs mb-1">Top Quiz</p>
                    <p className="font-bold text-gray-900 mb-1">{topQuiz}</p>
                    <p className="text-gray-500 text-xs">{topQuizStarts} intentos</p>
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
