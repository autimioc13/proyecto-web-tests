import { getDataAdapter } from '@/lib/data';
import MetricsCard from '@/components/admin/MetricsCard';
import DiagnosticBox from '@/components/admin/DiagnosticBox';
import { DollarSign, BarChart3 } from 'lucide-react';

export default async function AdminAnalytics() {
  const adapter = getDataAdapter();
  const metricsMap = await adapter.aggregateMetrics();
  const allMetrics = Array.from(metricsMap.values()).sort(
    (a, b) => b.estRevenue - a.estRevenue
  );

  const totalRevenue = allMetrics.reduce((sum, m) => sum + m.estRevenue, 0);
  const totalStarts = allMetrics.reduce((sum, m) => sum + m.totalStarts, 0);
  const avgCompletion =
    allMetrics.length > 0
      ? Math.round(
          allMetrics.reduce((sum, m) => sum + m.completionRate, 0) /
            allMetrics.length
        )
      : 0;

  const totalRevenueUSD = totalRevenue / 1000000;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Analítico</h1>
          <p className="text-gray-600">Monitorea el rendimiento y monetización de tus tests</p>
        </div>

        {/* KPIs globales */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Ingresos Estimados</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">
                  ${totalRevenueUSD.toFixed(2)}
                </p>
              </div>
              <DollarSign className="text-emerald-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Inicios</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{totalStarts}</p>
              </div>
              <BarChart3 className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Tasa Promedio de Completación</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{avgCompletion}%</p>
              </div>
              <BarChart3 className="text-purple-600" size={32} />
            </div>
          </div>
        </div>

        {/* Diagnóstico */}
        <DiagnosticBox metrics={allMetrics} />

        {/* Tabla de tests */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold">Tests Ranking por RPM</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Test</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Silo</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Inicios</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Completadas</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">% Compl.</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Impresiones</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">RPM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allMetrics.map((m) => (
                  <tr key={m.quizSlug} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-900">{m.quizSlug}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{m.silo}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{m.totalStarts}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">{m.totalCompletes}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{m.completionRate}%</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{m.totalImpressions}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      ${(m.rpm / 1000000).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cards detalladas */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Detalle por Test</h2>
          {allMetrics.map((m) => (
            <MetricsCard key={m.quizSlug} metrics={m} />
          ))}
        </div>
      </div>
    </div>
  );
}
