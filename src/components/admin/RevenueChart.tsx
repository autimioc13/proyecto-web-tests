'use client';

interface RevenueDataPoint {
  date: string;
  ingresos: number;
  usuarios: number;
  completados: number;
}

export function RevenueChart({ data }: { data: RevenueDataPoint[] }) {
  const maxIngresos = Math.max(...data.map(d => d.ingresos));
  
  return (
    <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6 shadow-lg hover:bg-white/15 dark:hover:bg-white/10 transition-all">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">📈 Tendencia de Ingresos</h3>

      <div className="space-y-6">
        {data.map((point) => (
          <div key={point.date} className="border-b border-white/10 pb-4 last:border-0">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-900 dark:text-white">{point.date}</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">${point.ingresos}</span>
            </div>

            <div className="flex gap-4 text-sm">
              <div className="flex-1">
                <p className="text-gray-700 dark:text-gray-300 mb-1">Usuarios: {point.usuarios}</p>
                <div className="w-full h-2 bg-white/20 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/40 dark:bg-white/30"
                    style={{ width: `${(point.usuarios / 100) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <p className="text-gray-600 dark:text-gray-400 mb-1">Completados: {point.completados}</p>
                <div className="w-full h-2 bg-white/20 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/40 dark:bg-white/30"
                    style={{ width: `${(point.completados / 100) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
