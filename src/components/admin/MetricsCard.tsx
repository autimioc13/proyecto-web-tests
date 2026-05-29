import { AggregatedMetrics } from '@/types';
import { TrendingUp, Users, Share2, DollarSign } from 'lucide-react';

interface MetricsCardProps {
  metrics: AggregatedMetrics;
}

export default function MetricsCard({ metrics }: MetricsCardProps) {
  const rpmUSD = metrics.rpm / 1000000;

  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
      <h3 className="font-bold text-lg mb-4">{metrics.quizSlug}</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
            <Users size={16} />
            Inicios
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.totalStarts}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
            <TrendingUp size={16} />
            Completadas
          </div>
          <p className="text-2xl font-bold text-green-600">{metrics.totalCompletes}</p>
          <p className="text-xs text-gray-500">{metrics.completionRate}%</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
            <Share2 size={16} />
            Compartidas
          </div>
          <p className="text-2xl font-bold text-purple-600">{metrics.totalShares}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
            <DollarSign size={16} />
            RPM
          </div>
          <p className="text-2xl font-bold text-emerald-600">${rpmUSD.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
