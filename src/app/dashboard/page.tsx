'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, TrendingUp, Calendar, Trophy } from 'lucide-react';
import { getGradeColor } from '@/lib/scoring/calculator';
import { getCategoryTheme } from '@/lib/themes/categoryThemes';
import { createClient } from '@/lib/supabase/client';

interface UserTestResult {
  id: string;
  testId: string;
  testTitle: string;
  categoryId?: string;
  score: number;
  grade: string;
  completedAt: string;
  timeSpent: number;
}

export default function DashboardPage() {
  const [testResults, setTestResults] = useState<UserTestResult[]>([]);
  const [stats, setStats] = useState({
    totalTests: 0,
    averageScore: 0,
    passedTests: 0,
    totalTimeSpent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [realtimeActive, setRealtimeActive] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Fetch user test results from API
        const response = await fetch('/api/tests/user-results', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error('Failed to load results');

        const data = await response.json();
        setTestResults(data.results || []);

        // Calculate stats
        if (data.results && data.results.length > 0) {
          const results = data.results as UserTestResult[];
          const avgScore = Math.round(
            results.reduce((sum, r) => sum + r.score, 0) / results.length
          );
          const passedCount = results.filter((r) => r.score >= 60).length;
          const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0);

          setStats({
            totalTests: results.length,
            averageScore: avgScore,
            passedTests: passedCount,
            totalTimeSpent: totalTime,
          });
        }

        // NOVO: Setup Realtime subscription
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user?.id) {
          const subscription = supabase
            .channel('results')
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'results',
                filter: `user_id=eq.${user.id}`,
              },
              (payload) => {
                // When a new result is inserted
                const newResult: UserTestResult = {
                  id: payload.new.id,
                  testId: payload.new.test_id,
                  testTitle: payload.new.test_title,
                  categoryId: payload.new.category_id,
                  score: payload.new.score,
                  grade: payload.new.grade,
                  completedAt: payload.new.completed_at,
                  timeSpent: payload.new.time_spent,
                };
                setTestResults((prev) => [newResult, ...prev]);

                // Update stats
                setStats((prevStats) => {
                  const newPassedCount = newResult.score >= 60 ? 1 : 0;
                  const totalTests = prevStats.totalTests + 1;
                  const totalScore = prevStats.averageScore * prevStats.totalTests + newResult.score;
                  const newAvgScore = Math.round(totalScore / totalTests);
                  const newPassedTests = prevStats.passedTests + newPassedCount;
                  const newTotalTime = prevStats.totalTimeSpent + newResult.timeSpent;

                  return {
                    totalTests,
                    averageScore: newAvgScore,
                    passedTests: newPassedTests,
                    totalTimeSpent: newTotalTime,
                  };
                });
              }
            )
            .subscribe();

          setRealtimeActive(true);

          return () => {
            subscription.unsubscribe();
          };
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Mi Dashboard</h1>
          <p className="text-slate-400">Revisa tu progreso y resultados</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <span className="text-slate-400 text-sm">Tests Realizados</span>
            </div>
            <div className="text-3xl font-bold">{stats.totalTests}</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span className="text-slate-400 text-sm">Promedio</span>
            </div>
            <div className="text-3xl font-bold">{stats.averageScore}%</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-slate-400 text-sm">Aprobados</span>
            </div>
            <div className="text-3xl font-bold">{stats.passedTests}</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-orange-400" />
              <span className="text-slate-400 text-sm">Tiempo Total</span>
            </div>
            <div className="text-3xl font-bold">
              {Math.floor(stats.totalTimeSpent / 60)}m
            </div>
          </div>
        </div>

        {/* Recent Results */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-2xl font-bold">Resultados Recientes</h2>
          </div>

          {loading ? (
            <div className="p-6 text-center text-slate-400">Cargando...</div>
          ) : testResults.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              <p>No has completado ningún test aún</p>
              <Link
                href="/tests"
                className="inline-block mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
              >
                Comenzar un Test
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Test</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Calificación</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Categoría</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Puntuación</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((result) => (
                    <tr
                      key={result.id}
                      className="border-b border-slate-700 hover:bg-slate-700/50 transition"
                    >
                      <td className="px-6 py-4">{result.testTitle}</td>
                      <td className={`px-6 py-4 font-bold ${getGradeColor(result.grade)}`}>
                        {result.grade}
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const t = getCategoryTheme(result.categoryId);
                          return (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${t.softBg} ${t.accentText} border ${t.softBorder}`}>
                              <span>{t.icon}</span>
                              {t.name}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4">{result.score}%</td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(result.completedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
