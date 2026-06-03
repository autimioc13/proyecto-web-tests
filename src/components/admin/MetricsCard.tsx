import { AggregatedMetrics } from '@/types';
import { TrendingUp, Users, Share2, DollarSign } from 'lucide-react';

interface MetricsCardProps {
  metrics: AggregatedMetrics;
}

export default function MetricsCard({ metrics }: MetricsCardProps) {
  const rpmUSD = metrics.rpm / 1000000;

  return (
    <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/20 hover:border-white/30 transition-all hover:bg-white/15 dark:hover:bg-white/10">
      <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">{metrics.quizSlug}</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-xs mb-1">
            <Users size={16} />
            Inicios
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalStarts}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-xs mb-1">
            <TrendingUp size={16} />
            Completadas
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalCompletes}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{metrics.completionRate}%</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-xs mb-1">
            <Share2 size={16} />
            Compartidas
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalShares}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-xs mb-1">
            <DollarSign size={16} />
            RPM
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${rpmUSD.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
