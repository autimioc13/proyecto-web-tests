'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  LayoutDashboard,
  User,
  ShoppingCart,
  Volume2,
  VolumeX,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useSoundContext } from '@/lib/contexts/SoundContext';
import { useCart } from '@/lib/contexts/CartContext';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  label: string;
  isToggle?: boolean;
  badge?: number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isDark, setTheme } = useTheme();
  const { soundEnabled, toggleSound } = useSoundContext();
  const { getTotalItems } = useCart();
  const cartItemCount = getTotalItems();

  // Navigation items
  const navItems: NavItem[] = [
    { href: '/', icon: Home, label: 'Inicio' },
    { href: '/tests', icon: BookOpen, label: 'Tests' },
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/profile', icon: User, label: 'Perfil' },
    { href: '/cart', icon: ShoppingCart, label: 'Carrito', badge: cartItemCount },
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
        bg-white/10 dark:bg-white/5
        backdrop-blur-xl
        border-r border-white/20
        shadow-lg
      "
    >
      {/* Logo/Brand area */}
      <div className="h-16 flex items-center justify-center border-b border-white/20">
        <Link
          href="/"
          className="
            text-2xl font-bold
            text-gray-900 dark:text-white
            hover:scale-110 transition-transform duration-300
          "
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
                    ? 'bg-white/20 dark:bg-white/10 backdrop-blur-md shadow-lg'
                    : 'hover:bg-white/10 dark:hover:bg-white/5 hover:backdrop-blur-lg'
                }
              `}
            >
              {/* Glow effect on active */}
              {active && (
                <div
                  className="
                    absolute inset-0 rounded-2xl
                    bg-white/10
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
                      ? 'text-gray-900 dark:text-white drop-shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                  }
                `}
              />

              {/* Badge for cart items */}
              {item.badge ? (
                <span className="
                  absolute top-2 right-2
                  bg-red-500 text-white text-xs font-bold
                  w-5 h-5 rounded-full
                  flex items-center justify-center
                ">
                  {item.badge}
                </span>
              ) : null}

              {/* Tooltip on hover */}
              <span
                className="
                  absolute left-full ml-3 px-3 py-1.5 rounded-lg
                  bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-sm text-white text-xs
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
        <div className="h-px bg-white/20" />
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
                ? 'bg-white/10 dark:bg-white/5 hover:bg-white/15 dark:hover:bg-white/10'
                : 'bg-white/10 dark:bg-white/5 hover:bg-white/15 dark:hover:bg-white/10'
            }
          `}
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
              className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300 drop-shadow-lg"
            />
          ) : (
            <VolumeX
              size={24}
              className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300 drop-shadow-lg"
            />
          )}

          {/* Tooltip */}
          <span
            className="
              absolute left-full ml-3 px-3 py-1.5 rounded-lg
              bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-sm text-white text-xs
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
                ? 'bg-white/10 dark:bg-white/5 hover:bg-white/15 dark:hover:bg-white/10'
                : 'bg-white/10 dark:bg-white/5 hover:bg-white/15 dark:hover:bg-white/10'
            }
          `}
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
              className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300 drop-shadow-lg"
            />
          ) : (
            <Moon
              size={24}
              className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300 drop-shadow-lg"
            />
          )}

          {/* Tooltip */}
          <span
            className="
              absolute left-full ml-3 px-3 py-1.5 rounded-lg
              bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-sm text-white text-xs
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
