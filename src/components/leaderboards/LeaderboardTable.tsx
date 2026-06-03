'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getLeaderboard } from '@/lib/db/gamification';
import { formatXP } from '@/lib/xp-calculator';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username?: string;
  email?: string;
  total_xp: number;
  level: number;
  badges_count: number;
  avatar_url?: string;
}

interface LeaderboardTableProps {
  limit?: number;
  showAnimation?: boolean;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  limit = 10,
  showAnimation = false,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await getLeaderboard(limit);
        setEntries(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No leaderboard data available yet. Complete quizzes to earn XP!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/20 bg-white/20 dark:bg-white/10 backdrop-blur-sm">
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 w-16">
              Rank
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
              Player
            </th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300 w-28">
              Level
            </th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300 w-32">
              XP
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 w-24">
              Badges
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => {
            const isTopThree = entry.rank <= 3;
            const medalEmoji = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉';

            return (
              <tr
                key={`${entry.user_id}-${entry.rank}`}
                className={`border-b border-white/10 transition-all duration-300 ${
                  showAnimation ? `animate-slideIn` : ''
                } ${
                  isTopThree
                    ? 'bg-gradient-to-r from-amber-500/15 to-transparent hover:from-amber-500/25 dark:from-amber-500/10 dark:hover:from-amber-500/15'
                    : 'hover:bg-white/10 dark:hover:bg-white/5'
                }`}
                style={
                  showAnimation
                    ? {
                        animation: `slideIn 0.5s ease-out ${index * 0.05}s both`,
                      }
                    : {}
                }
              >
                {/* Rank */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    {isTopThree ? (
                      <span className="text-2xl">{medalEmoji}</span>
                    ) : (
                      <span className="text-lg font-bold text-gray-600 dark:text-gray-400 w-8 text-center">
                        #{entry.rank}
                      </span>
                    )}
                  </div>
                </td>

                {/* Player */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar Placeholder */}
                    <div className="flex-shrink-0">
                      {entry.avatar_url ? (
                        <Image
                          src={entry.avatar_url}
                          alt={entry.username || 'Player'}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {(entry.username || entry.email || 'P')
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Player Name */}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {entry.username || entry.email?.split('@')[0] || 'Anonymous'}
                      </div>
                      {entry.email && !entry.username && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">{entry.email}</div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Level */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-2xl">⭐</span>
                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                      {entry.level}
                    </span>
                  </div>
                </td>

                {/* XP */}
                <td className="px-6 py-4 text-right">
                  <span className="font-semibold text-purple-600 dark:text-purple-400 text-lg">
                    {formatXP(entry.total_xp)}
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {entry.total_xp.toLocaleString()}
                  </div>
                </td>

                {/* Badges Count */}
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xl">🏆</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {entry.badges_count}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};
