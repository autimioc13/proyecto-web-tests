'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { User, CheckCircle, Zap, Share2, Bot } from 'lucide-react';

interface Activity {
  id: string;
  type: 'completion' | 'share' | 'generation' | 'start' | 'live';
  user?: string;
  quiz?: string;
  message: string;
  timestamp: string; // "2 min ago", "5 min ago", etc.
  emoji: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const activityIcons = {
    completion: <CheckCircle size={18} className="text-green-500" />,
    share: <Share2 size={18} className="text-blue-500" />,
    generation: <Bot size={18} className="text-purple-500" />,
    start: <Zap size={18} className="text-orange-500" />,
    live: <Zap size={18} className="text-red-500 animate-pulse" />,
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">⚡ Activity Feed (Real-time)</h2>

      <div className="bg-white rounded-lg border border-gray-200 p-6 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {activities.map((activity, idx) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-start gap-3 pb-4 mb-4 border-b border-gray-100 last:border-0 ${
                activity.type === 'live' ? 'bg-red-50 p-3 rounded' : ''
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                {activityIcons[activity.type]}
              </div>

              <div className="flex-grow">
                <p className="text-gray-900">
                  <span className="font-bold text-sm">{activity.emoji}</span>
                  {' '}
                  <span className="text-gray-700">{activity.message}</span>
                </p>
                <p className="text-gray-500 text-xs mt-1">{activity.timestamp}</p>
              </div>

              {activity.type === 'live' && (
                <span className="inline-block px-2 py-1 bg-red-500 text-white text-xs font-bold rounded animate-pulse">
                  LIVE
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {activities.length === 0 && (
          <p className="text-center text-gray-500 py-8">No hay actividad reciente</p>
        )}
      </div>
    </div>
  );
}
