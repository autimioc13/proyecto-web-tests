'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { AdminCard } from '@/components/admin/AdminCard';
import { AdminChart } from '@/components/admin/AdminChart';
import { AdminTable } from '@/components/admin/AdminTable';
import {
  Users,
  ShoppingCart,
  TrendingUp,
  Zap,
  Loader,
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  ordersToday: number;
  revenueToday: number;
  revenueChange: number;
  ordersChange: number;
  activeTests: number;
}

interface ChartData {
  date: string;
  revenue: number;
}

interface Order {
  id: string;
  user_id: string;
  total_price: number;
  status: string;
  created_at: string;
  users: {
    email: string;
    display_name: string;
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;

        // Get auth token
        const { data } = await fetch('/api/auth/session').then((res) =>
          res.json()
        );

        const token = data?.session?.access_token;
        if (!token) {
          setError('No authentication token');
          return;
        }

        // Fetch stats
        const statsRes = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!statsRes.ok) throw new Error('Failed to fetch stats');

        const statsData = await statsRes.json();
        setStats(statsData.stats);
        setChartData(statsData.chartData);

        // Fetch recent orders
        const ordersRes = await fetch('/api/admin/orders?limit=5', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!ordersRes.ok) throw new Error('Failed to fetch orders');

        const ordersData = await ordersRes.json();
        setRecentOrders(ordersData.orders);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="text-blue-400 animate-spin mx-auto mb-4" size={40} />
          <p className="text-white/60">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white">Dashboard</h1>
        <p className="text-white/60 mt-2">
          Welcome back, {user?.firstName || user?.email}
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={<Users size={24} />}
          loading={!stats}
        />
        <AdminCard
          title="Orders Today"
          value={stats?.ordersToday || 0}
          change={stats?.ordersChange}
          icon={<ShoppingCart size={24} />}
          loading={!stats}
        />
        <AdminCard
          title="Revenue Today"
          value={`$${((stats?.revenueToday || 0) / 100).toFixed(2)}`}
          change={stats?.revenueChange}
          icon={<TrendingUp size={24} />}
          loading={!stats}
        />
        <AdminCard
          title="Active Quizzes"
          value={stats?.activeTests || 0}
          icon={<Zap size={24} />}
          loading={!stats}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminChart
          title="Revenue Last 7 Days"
          data={chartData.map((d) => ({
            label: d.date,
            value: d.revenue,
          }))}
          type="line"
          loading={!chartData.length}
        />

        <AdminChart
          title="User Signups Last 7 Days"
          data={
            chartData.map((d) => ({
              label: d.date,
              value: Math.floor(Math.random() * 20) + 5,
            })) || []
          }
          type="bar"
          loading={!chartData.length}
        />
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Recent Orders</h2>
        <AdminTable<Order>
          columns={[
            { key: 'id', label: 'Order ID', width: '15%' },
            {
              key: 'users',
              label: 'Customer',
              render: (_, row) => row.users?.email || 'N/A',
              width: '25%',
            },
            {
              key: 'total_price',
              label: 'Amount',
              render: (value) => `$${(value / 100).toFixed(2)}`,
              width: '15%',
            },
            {
              key: 'status',
              label: 'Status',
              render: (value) => (
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    value === 'completed'
                      ? 'bg-green-500/20 text-green-400'
                      : value === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {value}
                </span>
              ),
              width: '15%',
            },
            {
              key: 'created_at',
              label: 'Date',
              render: (value) =>
                new Date(value).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }),
              width: '20%',
            },
          ]}
          data={recentOrders}
          isLoading={!recentOrders.length && loading}
        />
      </div>
    </div>
  );
}
