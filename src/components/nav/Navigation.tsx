'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import AuthButtons from '@/components/auth/AuthButtons';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useSoundContext } from '@/lib/contexts/SoundContext';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, setTheme } = useTheme();
  const { soundEnabled, toggleSound } = useSoundContext();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-white/10 dark:bg-white/5 border-b border-white/20 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            🧪 QuizLab
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition">
              Inicio
            </Link>
            <Link href="/tests" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition">
              Tests
            </Link>
            <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition">
              Dashboard
            </Link>
            <button
              onClick={() => toggleSound()}
              className="p-2 rounded-lg bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 transition text-gray-700 dark:text-gray-300 border border-white/20"
              title="Toggle sounds"
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 transition text-gray-700 dark:text-gray-300 border border-white/20"
              title="Toggle dark mode"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <AuthButtons />
          </div>

          {/* Sound Toggle Button (Mobile) */}
          <button
            onClick={() => toggleSound()}
            className="md:hidden p-2 rounded hover:bg-white/20 dark:hover:bg-white/10 transition text-gray-700 dark:text-gray-300"
            title="Toggle sounds"
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="md:hidden p-2 rounded hover:bg-white/20 dark:hover:bg-white/10 transition text-gray-700 dark:text-gray-300"
            title="Toggle dark mode"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded hover:bg-white/20 dark:hover:bg-white/10 transition text-gray-700 dark:text-gray-300"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-white/20">
            <Link
              href="/"
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-white/5 transition"
              onClick={closeMobileMenu}
            >
              Inicio
            </Link>
            <Link
              href="/tests"
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-white/5 transition"
              onClick={closeMobileMenu}
            >
              Tests
            </Link>
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-white/5 transition"
              onClick={closeMobileMenu}
            >
              Dashboard
            </Link>
            <div className="block px-4 py-2" onClick={closeMobileMenu}>
              <AuthButtons />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
