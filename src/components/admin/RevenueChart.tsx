'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueDataPoint {
  date: string;
  ingresos: number;
  usuarios: number;
  completados: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold mb-4">📈 Tendencia de Ingresos</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="ingresos"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ fill: '#8b5cf6', r: 5 }}
            name="Ingresos ($)"
          />
          <Line
            type="monotone"
            dataKey="usuarios"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Usuarios"
          />
          <Line
            type="monotone"
            dataKey="completados"
            stroke="#10b981"
            strokeWidth={2}
            name="Tests Completados"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
