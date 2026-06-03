'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Zap,
  BarChart3,
  DollarSign,
  Users,
  Settings,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface MenuCategory {
  title: string;
  items: MenuItem[];
}

export function AdminSidebar() {
  const pathname = usePathname();

  const menuCategories: MenuCategory[] = [
    {
      title: 'DASHBOARD',
      items: [
        {
          label: 'Overview',
          href: '/admin',
          icon: <LayoutDashboard size={20} />,
        },
        {
          label: 'Analytics',
          href: '/admin/analytics',
          icon: <TrendingUp size={20} />,
        },
      ],
    },
    {
      title: 'CREATE & MANAGE',
      items: [
        {
          label: 'Generate Tests',
          href: '/admin/generate',
          icon: <Zap size={20} />,
        },
        {
          label: 'AI Factory',
          href: '/admin/factory',
          icon: <Sparkles size={20} />,
        },
        {
          label: 'Categories',
          href: '/admin/categories',
          icon: <BarChart3 size={20} />,
        },
      ],
    },
    {
      title: 'ANALYTICS & GROWTH',
      items: [
        {
          label: 'Performance',
          href: '/admin/performance',
          icon: <TrendingUp size={20} />,
        },
        {
          label: 'Real-time Traffic',
          href: '/admin/traffic',
          icon: <BarChart3 size={20} />,
        },
      ],
    },
    {
      title: 'MONETIZATION',
      items: [
        {
          label: 'Revenue',
          href: '/admin/revenue',
          icon: <DollarSign size={20} />,
        },
        {
          label: 'Products',
          href: '/admin/products',
          icon: <BarChart3 size={20} />,
        },
      ],
    },
    {
      title: 'USERS & CONFIG',
      items: [
        {
          label: 'Users',
          href: '/admin/users',
          icon: <Users size={20} />,
        },
        {
          label: 'Settings',
          href: '/admin/settings',
          icon: <Settings size={20} />,
        },
      ],
    },
  ];

  const isActive = (href: string): boolean => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside
      className="
        fixed left-0 top-0 h-screen w-64 z-30
        bg-white/10 dark:bg-white/5
        backdrop-blur-xl
        border-r border-white/20
        flex flex-col
        overflow-hidden
      "
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-white/10">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">🧪</span>
        </div>
        <div>
          <h1 className="text-sm font-bold text-white">QuizLab AI</h1>
          <p className="text-xs text-white/60">Command Center</p>
        </div>
      </div>

      {/* Menu Categories */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
        {menuCategories.map((category) => (
          <div key={category.title}>
            <h3 className="text-xs font-semibold text-white/50 px-3 pb-3 uppercase tracking-wider">
              {category.title}
            </h3>
            <div className="space-y-2">
              {category.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200
                    ${
                      isActive(item.href)
                        ? 'bg-white/20 dark:bg-white/10 border-l-2 border-white text-white font-medium'
                        : 'text-white/70 hover:text-white hover:bg-white/10 dark:hover:bg-white/5'
                    }
                  `}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="flex-1 text-sm">{item.label}</span>
                  {isActive(item.href) && (
                    <ChevronRight size={16} className="flex-shrink-0" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Premium Plan Section */}
      <div className="border-t border-white/10 p-4">
        <div
          className="
            bg-gradient-to-br from-purple-500/20 to-blue-600/20
            backdrop-blur-sm border border-white/20
            rounded-lg p-4
          "
        >
          <h3 className="text-sm font-semibold text-white mb-2">
            Premium Plan
          </h3>
          <p className="text-xs text-white/70 mb-3">
            Upgrade for advanced features
          </p>
          <button className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-semibold rounded-lg transition-all">
            Ver Plan
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
