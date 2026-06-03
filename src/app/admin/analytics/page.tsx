import { getDataAdapter } from '@/lib/data';
import MetricsCard from '@/components/admin/MetricsCard';
import DiagnosticBox from '@/components/admin/DiagnosticBox';
import { TestsRankingTable } from '@/components/admin/TestsRankingTable';
import { CategoryDashboards } from '@/components/admin/CategoryDashboards';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { TopPerformers } from '@/components/admin/TopPerformers';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
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

  // Mock activities data for real-time activity feed
  const mockActivities = [
    {
      id: '1',
      type: 'live' as const,
      emoji: '🔴',
      message: 'María García está completando "General Knowledge Quiz"',
      timestamp: 'Just now',
    },
    {
      id: '2',
      type: 'completion' as const,
      emoji: '✅',
      message: 'Juan Pérez completó "Science Basics" - $2.50 USD',
      timestamp: '1 min ago',
    },
    {
      id: '3',
      type: 'share' as const,
      emoji: '📤',
      message: 'Ana López compartió "History 101" en redes sociales',
      timestamp: '3 min ago',
    },
    {
      id: '4',
      type: 'generation' as const,
      emoji: '🤖',
      message: 'IA generó 5 nuevos tests automáticamente',
      timestamp: '5 min ago',
    },
    {
      id: '5',
      type: 'start' as const,
      emoji: '⚡',
      message: 'Carlos Mendez inició "Biology Expert Test"',
      timestamp: '7 min ago',
    },
    {
      id: '6',
      type: 'completion' as const,
      emoji: '✅',
      message: 'Sofia Ruiz completó "Math Challenge" - $3.75 USD',
      timestamp: '12 min ago',
    },
    {
      id: '7',
      type: 'share' as const,
      emoji: '📤',
      message: 'Roberto Sánchez compartió "Technology Quiz" en WhatsApp',
      timestamp: '15 min ago',
    },
    {
      id: '8',
      type: 'start' as const,
      emoji: '⚡',
      message: 'Laura Fernández inició "English Proficiency Test"',
      timestamp: '20 min ago',
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Analítico</h1>
            <p className="text-gray-600 dark:text-gray-300">Monitorea el rendimiento y monetización de tus tests</p>
          </div>
          <Link
            href="/admin/generate"
            className="bg-white/20 dark:bg-white/10 text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition flex items-center gap-2 whitespace-nowrap backdrop-blur-sm border border-white/20"
          >
            <Sparkles size={20} />
            Generar Tests IA
          </Link>
        </div>

        {/* KPIs globales - Glasmorphic */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg p-6 hover:bg-white/15 dark:hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold">Ingresos Estimados</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  ${totalRevenueUSD.toFixed(2)}
                </p>
              </div>
              <DollarSign className="text-gray-700 dark:text-gray-300" size={32} />
            </div>
          </div>

          <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg p-6 hover:bg-white/15 dark:hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold">Total Inicios</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalStarts}</p>
              </div>
              <BarChart3 className="text-gray-700 dark:text-gray-300" size={32} />
            </div>
          </div>

          <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg p-6 hover:bg-white/15 dark:hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold">Tasa Promedio de Completación</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{avgCompletion}%</p>
              </div>
              <BarChart3 className="text-gray-700 dark:text-gray-300" size={32} />
            </div>
          </div>
        </div>

        {/* Gráfico de Tendencia de Ingresos */}
        <RevenueChart data={revenueData} />

        {/* Mini-Dashboards por Categoría */}
        <CategoryDashboards metrics={allMetrics} />

        {/* Top Performers Gamificado */}
        <TopPerformers
          performers={allMetrics.slice(0, 10).map((m, idx) => ({
            rank: idx + 1,
            quizSlug: m.quizSlug,
            silo: m.silo,
            completed: m.totalCompletes,
            revenue: m.estRevenue,
            rating: Math.min(5, Math.ceil((m.completionRate / 20))),
            completionRate: m.completionRate,
          }))}
        />

        {/* Diagnóstico */}
        <DiagnosticBox metrics={allMetrics} />

        {/* Activity Feed Real-time */}
        <ActivityFeed activities={mockActivities} />

        {/* Tabla de tests mejorada - Glasmorphic */}
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tests Ranking por RPM</h2>
          </div>

          <TestsRankingTable data={allMetrics} />
        </div>

        {/* Cards detalladas - Glasmorphic */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Detalle por Test</h2>
          {allMetrics.map((m) => (
            <MetricsCard key={m.quizSlug} metrics={m} />
          ))}
        </div>
      </div>
    </div>
  );
}
