'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, Calendar, Trophy, LogOut, User, Settings, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
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

interface Order {
  id: string;
  user_id: string;
  total_price: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  customer_name?: string;
  customer_email?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  product_price: number;
  quantity: number;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();

  const [testResults, setTestResults] = useState<UserTestResult[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalTests: 0,
    averageScore: 0,
    passedTests: 0,
    totalTimeSpent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [realtimeActive, setRealtimeActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'tests' | 'orders'>('tests');

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Load dashboard data
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

  // Load orders
  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;

      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setOrders(data || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setOrdersLoading(false);
      }
    };

    if (!authLoading) {
      loadOrders();
    }
  }, [user, authLoading]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Logout */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-white/60">Bienvenido, {user.firstName} {user.lastName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="
              px-6 py-3 bg-red-600 hover:bg-red-700
              text-white font-semibold rounded-lg
              transition-colors flex items-center gap-2
            "
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/profile"
            className="
              bg-white/10 border border-white/20 rounded-2xl p-6
              hover:bg-white/15 transition-colors group
            "
          >
            <User size={32} className="text-white/60 group-hover:text-white mb-3" />
            <h3 className="text-lg font-bold text-white">Mi Perfil</h3>
            <p className="text-white/60 text-sm">Editar información personal</p>
          </Link>

          <Link
            href="/cart"
            className="
              bg-white/10 border border-white/20 rounded-2xl p-6
              hover:bg-white/15 transition-colors group
            "
          >
            <ShoppingBag size={32} className="text-white/60 group-hover:text-white mb-3" />
            <h3 className="text-lg font-bold text-white">Mi Carrito</h3>
            <p className="text-white/60 text-sm">Ver y editar tu carrito</p>
          </Link>

          <Link
            href="/profile?tab=settings"
            className="
              bg-white/10 border border-white/20 rounded-2xl p-6
              hover:bg-white/15 transition-colors group
            "
          >
            <Settings size={32} className="text-white/60 group-hover:text-white mb-3" />
            <h3 className="text-lg font-bold text-white">Configuración</h3>
            <p className="text-white/60 text-sm">Cambiar contraseña y privacidad</p>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab('tests')}
            className={`
              px-6 py-3 font-semibold transition-colors
              ${activeTab === 'tests'
                ? 'text-white border-b-2 border-purple-500'
                : 'text-white/60 hover:text-white'
              }
            `}
          >
            Mi Progreso (Tests)
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`
              px-6 py-3 font-semibold transition-colors
              ${activeTab === 'orders'
                ? 'text-white border-b-2 border-purple-500'
                : 'text-white/60 hover:text-white'
              }
            `}
          >
            Mis Compras
          </button>
        </div>

        {/* Tests Tab */}
        {activeTab === 'tests' && (
          <>
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
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Mis Órdenes</h2>

            {ordersLoading ? (
              <p className="text-white/60">Cargando órdenes...</p>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/60 mb-4">No tienes órdenes aún</p>
                <Link
                  href="/tests"
                  className="
                    inline-block px-6 py-3
                    bg-purple-600 hover:bg-purple-700
                    text-white font-semibold rounded-lg
                    transition-colors
                  "
                >
                  Explorar Tests
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="
                      bg-white/5 border border-white/10 rounded-lg p-4
                      hover:bg-white/10 transition-colors
                    "
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-white font-semibold">Orden: {order.id}</p>
                        <p className="text-white/60 text-sm">
                          {new Date(order.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">
                          ${(order.total_price / 100).toFixed(2)}
                        </p>
                        <p className={`text-sm font-semibold ${
                          order.status === 'completed' ? 'text-green-400' :
                          order.status === 'pending' ? 'text-yellow-400' :
                          order.status === 'failed' ? 'text-red-400' :
                          'text-blue-400'
                        }`}>
                          {order.status === 'completed' ? 'Completada' :
                           order.status === 'pending' ? 'Pendiente' :
                           order.status === 'failed' ? 'Fallida' :
                           'Reembolsada'}
                        </p>
                      </div>
                    </div>

                    {order.order_items && order.order_items.length > 0 && (
                      <div className="border-t border-white/10 pt-3 mt-3">
                        <p className="text-white/60 text-sm font-semibold mb-2">
                          {order.order_items.length} producto(s):
                        </p>
                        <ul className="space-y-1">
                          {order.order_items.map((item) => (
                            <li key={item.id} className="text-white/60 text-sm flex justify-between">
                              <span>
                                {item.product_title} x{item.quantity}
                              </span>
                              <span>
                                ${(item.product_price / 100).toFixed(2)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {order.payment_method && (
                      <p className="text-white/60 text-xs mt-3">
                        Método: {order.payment_method === 'card' ? 'Tarjeta' :
                                order.payment_method === 'paypal' ? 'PayPal' :
                                'Prueba'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
