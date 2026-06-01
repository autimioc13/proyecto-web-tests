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
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold mb-4">📈 Tendencia de Ingresos</h3>
      
      <div className="space-y-6">
        {data.map((point) => (
          <div key={point.date} className="border-b border-gray-200 pb-4 last:border-0">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-900">{point.date}</span>
              <span className="text-2xl font-bold text-purple-600">${point.ingresos}</span>
            </div>
            
            <div className="flex gap-4 text-sm">
              <div className="flex-1">
                <p className="text-gray-600 mb-1">Usuarios: {point.usuarios}</p>
                <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600"
                    style={{ width: `${(point.usuarios / 100) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <p className="text-gray-600 mb-1">Completados: {point.completados}</p>
                <div className="w-full h-2 bg-green-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-600"
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
