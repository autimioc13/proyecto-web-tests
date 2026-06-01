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
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600 bg-blue-100',
    purple: 'bg-purple-50 border-purple-200 text-purple-600 bg-purple-100',
    green: 'bg-green-50 border-green-200 text-green-600 bg-green-100',
    amber: 'bg-amber-50 border-amber-200 text-amber-600 bg-amber-100',
    orange: 'bg-orange-50 border-orange-200 text-orange-600 bg-orange-100',
    pink: 'bg-pink-50 border-pink-200 text-pink-600 bg-pink-100',
  };

  const [bgClass, borderClass, textClass, accentClass] = colors[color].split(' ');

  return (
    <div className={`${bgClass} border ${borderClass} rounded-lg p-6 hover:shadow-lg transition-shadow`}>
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

        <div className={`${accentClass} p-3 rounded-lg ${textClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
