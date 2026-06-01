'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import AuthButtons from '@/components/auth/AuthButtons';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent"
          >
            🧪 QuizLab
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-slate-300 hover:text-white transition">
              Inicio
            </Link>
            <Link href="/tests" className="text-slate-300 hover:text-white transition">
              Tests
            </Link>
            <Link href="/dashboard" className="text-slate-300 hover:text-white transition">
              Dashboard
            </Link>
            <AuthButtons />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded hover:bg-slate-700 transition text-slate-300"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-slate-700">
            <Link
              href="/"
              className="block px-4 py-2 text-slate-300 hover:bg-slate-700 transition"
              onClick={closeMobileMenu}
            >
              Inicio
            </Link>
            <Link
              href="/tests"
              className="block px-4 py-2 text-slate-300 hover:bg-slate-700 transition"
              onClick={closeMobileMenu}
            >
              Tests
            </Link>
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-slate-300 hover:bg-slate-700 transition"
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
