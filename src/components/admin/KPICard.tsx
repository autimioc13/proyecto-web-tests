'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'green' | 'amber' | 'orange' | 'pink';
  change?: number; // % cambio
  unit?: string;
  sparkline?: number[]; // datos para mini gráfico
}

export function KPICard({ title, value, icon, color, change, unit = '' }: KPICardProps) {
  const colors = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      gradient: 'from-blue-400 to-blue-600',
      accent: 'bg-blue-100'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      gradient: 'from-purple-400 to-purple-600',
      accent: 'bg-purple-100'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      gradient: 'from-green-400 to-green-600',
      accent: 'bg-green-100'
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-600',
      gradient: 'from-amber-400 to-amber-600',
      accent: 'bg-amber-100'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-600',
      gradient: 'from-orange-400 to-orange-600',
      accent: 'bg-orange-100'
    },
    pink: {
      bg: 'bg-pink-50',
      border: 'border-pink-200',
      icon: 'text-pink-600',
      gradient: 'from-pink-400 to-pink-600',
      accent: 'bg-pink-100'
    },
  };

  const c = colors[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${c.bg} border ${c.border} rounded-lg p-6 hover:shadow-lg transition-shadow`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            {unit && <span className="text-gray-500">{unit}</span>}
          </div>

          {change !== undefined && (
            <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(change)}% vs último mes
            </div>
          )}
        </div>

        <div className={`${c.accent} p-3 rounded-lg`}>
          <div className={c.icon}>{icon}</div>
        </div>
      </div>
    </motion.div>
  );
}
