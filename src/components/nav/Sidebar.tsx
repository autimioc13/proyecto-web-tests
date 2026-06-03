'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  LayoutDashboard,
  User,
  Volume2,
  VolumeX,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useSoundContext } from '@/lib/contexts/SoundContext';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  label: string;
  isToggle?: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isDark, setTheme } = useTheme();
  const { soundEnabled, toggleSound } = useSoundContext();

  // Navigation items
  const navItems: NavItem[] = [
    { href: '/', icon: Home, label: 'Inicio' },
    { href: '/tests', icon: BookOpen, label: 'Tests' },
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/profile', icon: User, label: 'Perfil' },
  ];

  const isActive = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="
        fixed left-0 top-0 h-screen w-24 z-40
        hidden md:flex flex-col
        bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent
        backdrop-blur-xl
        border-r border-glass
        shadow-glass-lg
      "
    >
      {/* Logo/Brand area */}
      <div className="h-16 flex items-center justify-center border-b border-glass/50">
        <Link
          href="/"
          className="
            text-2xl font-bold
            bg-gradient-to-r from-purple-400 to-purple-600
            bg-clip-text text-transparent
            hover:scale-110 transition-transform duration-300
          "
          title="QuizLab"
        >
          🧪
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col items-center gap-4 py-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative p-4 rounded-2xl transition-all duration-300
                flex items-center justify-center
                group
                ${
                  active
                    ? 'bg-gradient-to-br from-purple-500/40 to-blue-500/30 backdrop-blur-md shadow-glass-md'
                    : 'hover:bg-white/10 hover:backdrop-blur-lg'
                }
              `}
              title={item.label}
            >
              {/* Glow effect on active */}
              {active && (
                <div
                  className="
                    absolute inset-0 rounded-2xl
                    bg-gradient-to-br from-purple-400/20 to-blue-400/10
                    blur-lg opacity-0 group-hover:opacity-100
                    transition-opacity duration-300
                    -z-10
                  "
                />
              )}

              <Icon
                size={24}
                className={`
                  transition-all duration-300
                  ${
                    active
                      ? 'text-purple-300 drop-shadow-lg'
                      : 'text-slate-400 group-hover:text-white'
                  }
                `}
              />

              {/* Tooltip on hover */}
              <span
                className="
                  absolute left-full ml-3 px-3 py-1.5 rounded-lg
                  bg-slate-900/95 backdrop-blur-sm text-white text-xs
                  font-medium whitespace-nowrap
                  opacity-0 group-hover:opacity-100
                  pointer-events-none transition-opacity duration-200
                  border border-white/20
                "
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="px-4 mb-4">
        <div className="h-px bg-gradient-to-r from-transparent via-glass to-transparent" />
      </div>

      {/* Toggle Controls */}
      <div className="flex flex-col items-center gap-3 pb-8">
        {/* Sound Toggle */}
        <button
          onClick={() => toggleSound()}
          className={`
            relative p-4 rounded-2xl transition-all duration-300
            flex items-center justify-center
            group
            ${
              soundEnabled
                ? 'bg-white/10 hover:bg-white/15'
                : 'bg-red-500/20 hover:bg-red-500/30'
            }
          `}
          title={soundEnabled ? 'Desactivar sonido' : 'Activar sonido'}
          aria-pressed={soundEnabled}
        >
          {/* Glow effect on hover */}
          <div
            className="
              absolute inset-0 rounded-2xl
              bg-gradient-to-br from-white/10 to-white/5
              blur-lg opacity-0 group-hover:opacity-100
              transition-opacity duration-300
              -z-10
            "
          />

          {soundEnabled ? (
            <Volume2
              size={24}
              className="text-amber-300 group-hover:text-amber-200 transition-colors duration-300 drop-shadow-lg"
            />
          ) : (
            <VolumeX
              size={24}
              className="text-red-400 group-hover:text-red-300 transition-colors duration-300 drop-shadow-lg"
            />
          )}

          {/* Tooltip */}
          <span
            className="
              absolute left-full ml-3 px-3 py-1.5 rounded-lg
              bg-slate-900/95 backdrop-blur-sm text-white text-xs
              font-medium whitespace-nowrap
              opacity-0 group-hover:opacity-100
              pointer-events-none transition-opacity duration-200
              border border-white/20
            "
          >
            {soundEnabled ? 'Sonido' : 'Silencio'}
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className={`
            relative p-4 rounded-2xl transition-all duration-300
            flex items-center justify-center
            group
            ${
              isDark
                ? 'bg-white/10 hover:bg-white/15'
                : 'bg-yellow-400/20 hover:bg-yellow-400/30'
            }
          `}
          title={isDark ? 'Tema claro' : 'Tema oscuro'}
          aria-pressed={isDark}
        >
          {/* Glow effect on hover */}
          <div
            className="
              absolute inset-0 rounded-2xl
              bg-gradient-to-br from-white/10 to-white/5
              blur-lg opacity-0 group-hover:opacity-100
              transition-opacity duration-300
              -z-10
            "
          />

          {isDark ? (
            <Sun
              size={24}
              className="text-yellow-300 group-hover:text-yellow-200 transition-colors duration-300 drop-shadow-lg"
            />
          ) : (
            <Moon
              size={24}
              className="text-blue-300 group-hover:text-blue-200 transition-colors duration-300 drop-shadow-lg"
            />
          )}

          {/* Tooltip */}
          <span
            className="
              absolute left-full ml-3 px-3 py-1.5 rounded-lg
              bg-slate-900/95 backdrop-blur-sm text-white text-xs
              font-medium whitespace-nowrap
              opacity-0 group-hover:opacity-100
              pointer-events-none transition-opacity duration-200
              border border-white/20
            "
          >
            {isDark ? 'Claro' : 'Oscuro'}
          </span>
        </button>
      </div>
    </aside>
  );
}
