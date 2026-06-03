'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'green' | 'amber' | 'orange' | 'pink';
  change?: number;
  unit?: string;
}

export function KPICard({ title, value, icon, color, change, unit = '' }: KPICardProps) {
  // Removed color mappings - using grayscale only
  const bgClass = 'bg-white/10 dark:bg-white/5';
  const borderClass = 'border-white/20';
  const textClass = 'text-gray-900 dark:text-white';
  const accentClass = 'bg-white/20 dark:bg-white/10';

  return (
    <div className={`${bgClass} border ${borderClass} rounded-lg p-6 hover:shadow-lg transition-shadow`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
            {unit && <span className="text-gray-600 dark:text-gray-400">{unit}</span>}
          </div>

          {change !== undefined && (
            <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${change >= 0 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700 dark:text-gray-300'}`}>
              {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(change)}% vs último mes
            </div>
          )}
        </div>

        <div className={`${accentClass} p-3 rounded-lg text-gray-700 dark:text-gray-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
