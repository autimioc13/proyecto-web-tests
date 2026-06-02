'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { getUserStats, getUserRank, getLeaderboard } from '@/lib/db/gamification';
import { getUserStreak } from '@/lib/streaks';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { AchievementBadge } from '@/components/gamification/AchievementBadge';
import { StreakDisplay } from '@/components/gamification/StreakDisplay';
import { LeaderboardTable } from '@/components/leaderboards/LeaderboardTable';
import { LogOut, Settings, Trophy, Zap, Medal } from 'lucide-react';

interface UserData {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    picture?: string;
  };
}

interface UserStats {
  total_xp: number;
  level: number;
  total_quizzes_completed: number;
  perfect_scores: number;
  current_streak?: number;
  longest_streak?: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [streak, setStreak] = useState({
    currentStreak: 0,
    longestStreak: 0,
    daysUntilBreak: 0,
  });
  const [userRank, setUserRank] = useState<number | null>(null);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

  // Simulated unlocked badges - in production this would come from database
  const mockUnlockedBadges = ['first_quiz', 'perfect_score', 'speed_demon', 'streak_5'];

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);

        // Get user
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          router.push('/auth/login');
          return;
        }

        setUser(authUser as UserData);

        // Get stats
        const statsData = await getUserStats(authUser.id);
        setStats(statsData);

        // Get streak
        const streakData = await getUserStreak(authUser.id);
        setStreak({
          currentStreak: streakData.currentStreak,
          longestStreak: streakData.longestStreak,
          daysUntilBreak: streakData.daysUntilBreak,
        });

        // Get user rank
        const rank = await getUserRank(authUser.id);
        setUserRank(rank);

        // Get leaderboard (for context)
        const leaderboard = await getLeaderboard(10);
        setLeaderboardData(leaderboard || []);

        // Set mock unlocked badges
        setUnlockedBadges(mockUnlockedBadges);
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario';
  const userAvatar = user.user_metadata?.picture;
  const badgeCount = unlockedBadges.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Mi Perfil</h1>
            <p className="text-slate-400">Gestiona tu cuenta y ve tus logros</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg border border-slate-600 p-8 mb-12">
          <div className="flex items-center gap-6">
            {userAvatar ? (
              <Image
                src={userAvatar}
                alt={userName}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-3xl font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-1">{userName}</h2>
              <p className="text-slate-400 mb-4">{user.email}</p>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                  <Settings size={16} />
                  Editar Perfil
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {/* XP Card */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg border border-purple-500 p-6 hover:shadow-lg hover:shadow-purple-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-purple-200">Total XP</span>
              <Zap size={20} className="text-yellow-300" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {stats?.total_xp?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-purple-200">
              Nivel {stats?.level || 1}
            </p>
          </div>

          {/* Level Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border border-blue-500 p-6 hover:shadow-lg hover:shadow-blue-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-blue-200">Nivel Actual</span>
              <Medal size={20} className="text-amber-300" />
            </div>
            <div className="text-3xl font-bold mb-2">{stats?.level || 1}</div>
            <p className="text-xs text-blue-200">
              {stats?.total_quizzes_completed || 0} quizzes completados
            </p>
          </div>

          {/* Badges Card */}
          <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg border border-amber-500 p-6 hover:shadow-lg hover:shadow-amber-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-amber-200">Badges</span>
              <Trophy size={20} className="text-amber-300" />
            </div>
            <div className="text-3xl font-bold mb-2">{badgeCount}</div>
            <p className="text-xs text-amber-200">
              Logros desbloqueados
            </p>
          </div>

          {/* Rank Card */}
          <div className="bg-gradient-to-br from-pink-600 to-pink-800 rounded-lg border border-pink-500 p-6 hover:shadow-lg hover:shadow-pink-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-pink-200">Ranking</span>
              <span className="text-xl">🏆</span>
            </div>
            <div className="text-3xl font-bold mb-2">
              #{userRank || 'N/A'}
            </div>
            <p className="text-xs text-pink-200">
              Tu posición global
            </p>
          </div>
        </div>

        {/* Streaks Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-4">Mi Racha</h3>
          {streak && (
            <StreakDisplay
              currentStreak={streak.currentStreak}
              longestStreak={streak.longestStreak}
              daysUntilBreak={streak.daysUntilBreak}
            />
          )}
        </div>

        {/* Achievement Badges Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6">Logros Desbloqueados</h3>
          {unlockedBadges.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 bg-slate-800/50 p-8 rounded-lg border border-slate-700">
              {unlockedBadges.map((badgeId) => {
                const achievement = ACHIEVEMENTS[badgeId];
                if (!achievement) return null;

                return (
                  <div key={badgeId} className="flex justify-center">
                    <AchievementBadge
                      achievement={achievement}
                      unlocked={true}
                      showAnimation={false}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-8 text-center text-slate-400">
              <p className="mb-2">Aún no has desbloqueado badges</p>
              <p className="text-sm">Completa quizzes para desbloquear logros</p>
            </div>
          )}
        </div>

        {/* Leaderboard Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6">Top 10 Jugadores</h3>
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
            <LeaderboardTable limit={10} showAnimation={false} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-4 justify-center pt-8 border-t border-slate-700">
          <button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors">
            Descargar Datos
          </button>
          <button className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors">
            Eliminar Cuenta
          </button>
        </div>
      </div>
    </div>
  );
}
