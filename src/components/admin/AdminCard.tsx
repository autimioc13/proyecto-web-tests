'use client';

import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface AdminCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  description?: string;
  loading?: boolean;
}

export function AdminCard({
  title,
  value,
  change,
  icon,
  description,
  loading = false,
}: AdminCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white/60 text-sm font-medium">{title}</p>
          {description && (
            <p className="text-white/40 text-xs mt-1">{description}</p>
          )}
        </div>
        {icon && <div className="text-blue-400">{icon}</div>}
      </div>

      {loading ? (
        <div className="h-8 bg-white/10 rounded animate-pulse" />
      ) : (
        <>
          <p className="text-3xl font-bold text-white mb-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              {isPositive ? (
                <ArrowUp size={16} className="text-green-400" />
              ) : (
                <ArrowDown size={16} className="text-red-400" />
              )}
              <span
                className={`text-sm ${
                  isPositive ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {isPositive ? '+' : ''}{change}% vs yesterday
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
