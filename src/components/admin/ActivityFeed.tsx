'use client';

import { CheckCircle, Share2, Zap, Bot } from 'lucide-react';

interface Activity {
  id: string;
  type: 'completion' | 'share' | 'generation' | 'start' | 'live';
  message: string;
  timestamp: string;
  emoji: string;
}

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  const activityIcons = {
    completion: <CheckCircle size={18} className="text-gray-700 dark:text-gray-300" />,
    share: <Share2 size={18} className="text-gray-700 dark:text-gray-300" />,
    generation: <Bot size={18} className="text-gray-700 dark:text-gray-300" />,
    start: <Zap size={18} className="text-gray-700 dark:text-gray-300" />,
    live: <Zap size={18} className="text-gray-700 dark:text-gray-300 animate-pulse" />,
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">⚡ Activity Feed (Real-time)</h2>
      
      <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6 max-h-96 overflow-y-auto shadow-lg hover:bg-white/15 dark:hover:bg-white/10 transition-all">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 pb-4 mb-4 border-b border-white/10 last:border-0 hover:bg-white/10 dark:hover:bg-white/5 transition-colors p-2 rounded-lg"
          >
            <div className="flex-shrink-0 mt-1">
              {activityIcons[activity.type]}
            </div>

            <div className="flex-grow">
              <p className="text-gray-900 dark:text-white">
                <span className="font-bold text-sm">{activity.emoji}</span>
                {' '}
                <span className="text-gray-700 dark:text-gray-300">{activity.message}</span>
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">{activity.timestamp}</p>
            </div>

            {activity.type === 'live' && (
              <span className="inline-block px-2 py-1 bg-white/30 dark:bg-white/20 text-white text-xs font-bold rounded-lg animate-pulse border border-white/40">
                LIVE
              </span>
            )}
          </div>
        ))}

        {activities.length === 0 && (
          <p className="text-center text-gray-600 dark:text-gray-400 py-8">No hay actividad reciente</p>
        )}
      </div>
    </div>
  );
}
