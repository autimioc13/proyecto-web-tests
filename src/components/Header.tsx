'use client';

import Link from 'next/link';
import { getAllSilos } from '@/data/silos';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const silos = getAllSilos();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-2xl">🧪</span>
            <span className="hidden sm:inline">QuizLab</span>
          </Link>

          <nav className="hidden md:flex gap-8">
            {silos.map((silo) => (
              <Link
                key={silo.slug}
                href={`/${silo.slug}`}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition"
              >
                <span>{silo.emoji}</span>
                <span>{silo.label}</span>
              </Link>
            ))}
          </nav>

          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden pb-4 space-y-2 border-t border-gray-200 pt-4">
            {silos.map((silo) => (
              <Link
                key={silo.slug}
                href={`/${silo.slug}`}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                onClick={() => setMenuOpen(false)}
              >
                <span className="mr-2">{silo.emoji}</span>
                {silo.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
