import { getDataAdapter } from '@/lib/data';
import MetricsCard from '@/components/admin/MetricsCard';
import DiagnosticBox from '@/components/admin/DiagnosticBox';
import { TestsRankingTable } from '@/components/admin/TestsRankingTable';
import RevenueChart from '@/components/admin/RevenueChart';
import { DollarSign, BarChart3, Sparkles } from 'lucide-react';
import Link from 'next/link';

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

  // Datos de ejemplo para gráfico de tendencia (reemplazar con datos reales de BD después)
  const revenueData = [
    { date: 'Semana 1', ingresos: 120, usuarios: 45, completados: 32 },
    { date: 'Semana 2', ingresos: 240, usuarios: 65, completados: 48 },
    { date: 'Semana 3', ingresos: 180, usuarios: 52, completados: 38 },
    { date: 'Semana 4', ingresos: 420, usuarios: 89, completados: 64 },
    { date: 'Esta Semana', ingresos: 380, usuarios: 78, completados: 58 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Analítico</h1>
            <p className="text-gray-600">Monitorea el rendimiento y monetización de tus tests</p>
          </div>
          <Link
            href="/admin/generate"
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition flex items-center gap-2 whitespace-nowrap"
          >
            <Sparkles size={20} />
            Generar Tests IA
          </Link>
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

        {/* Gráfico de Tendencia de Ingresos */}
        <RevenueChart data={revenueData} />

        {/* Diagnóstico */}
        <DiagnosticBox metrics={allMetrics} />

        {/* Tabla de tests mejorada */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold">Tests Ranking por RPM</h2>
          </div>

          <TestsRankingTable data={allMetrics} />
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
