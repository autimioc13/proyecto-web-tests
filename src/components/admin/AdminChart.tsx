'use client';

import React from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface AdminChartProps {
  title: string;
  data: DataPoint[];
  type?: 'line' | 'bar';
  loading?: boolean;
  height?: number;
}

export function AdminChart({
  title,
  data,
  type = 'line',
  loading = false,
  height = 300,
}: AdminChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 100 / data.length;

  if (loading) {
    return (
      <div
        className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
        style={{ height: `${height}px` }}
      >
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-400 mx-auto mb-2" />
            <p className="text-white/60 text-sm">Loading chart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>

      {data.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <p className="text-white/60">No data available</p>
        </div>
      ) : type === 'line' ? (
        <LineChart data={data} maxValue={maxValue} height={height} />
      ) : (
        <BarChart data={data} maxValue={maxValue} height={height} />
      )}
    </div>
  );
}

function LineChart({
  data,
  maxValue,
  height,
}: {
  data: DataPoint[];
  maxValue: number;
  height: number;
}) {
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1 || 1)) * 100;
      const y = 100 - (d.value / maxValue) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div style={{ height: `${height}px` }} className="relative">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <polyline
          points={points}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="0.5"
          vectorEffect="non-scaling-stroke"
        />
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 0.1 }} />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-xs text-white/60">
        {data.map((d, i) => (
          <span key={i} className="text-center flex-1">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function BarChart({
  data,
  maxValue,
  height,
}: {
  data: DataPoint[];
  maxValue: number;
  height: number;
}) {
  return (
    <div
      style={{ height: `${height}px` }}
      className="flex items-flex-end justify-around gap-2"
    >
      {data.map((d, i) => {
        const percentage = (d.value / maxValue) * 100;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-2"
          >
            <div
              className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t hover:from-blue-600 hover:to-blue-500 transition-all relative group"
              style={{ height: `${percentage}%` }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/20 rounded px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {d.value}
              </div>
            </div>
            <span className="text-xs text-white/60 text-center">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
