'use client';

import Link from 'next/link';
import { TestCategory } from '@/lib/api/tests';
import { getCategoryTheme } from '@/lib/themes/categoryThemes';

interface TestCardProps {
  category: TestCategory;
}

export default function TestCard({ category }: TestCardProps) {
  const theme = getCategoryTheme(category.id);

  return (
    <Link href={`/tests?category=${category.id}`}>
      <div
        className={`group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl hover:shadow-white/20 transition-all duration-300 cursor-pointer h-full backdrop-blur-xl border border-white/20 bg-white/10 dark:bg-white/5`}
      >
        {/* Gradient Background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-80 group-hover:opacity-90 transition-opacity`}
        />

        {/* Content */}
        <div className="relative p-6 h-full flex flex-col justify-between text-white">
          {/* Icon and Header */}
          <div>
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {category.icon}
            </div>
            <h3 className="text-2xl font-bold mb-2 group-hover:text-white transition-colors">
              {category.name}
            </h3>
          </div>

          {/* Description */}
          <div>
            <p className="text-white/90 text-sm mb-6 group-hover:text-white/100 transition-opacity">
              {category.description}
            </p>

            {/* Test Count Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                Tests Disponibles
              </span>
              <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold group-hover:bg-white/30 transition-all border border-white/20">
                {category.testCount}+
              </span>
            </div>
          </div>

          {/* Hover Arrow Indicator */}
          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg
              className="w-6 h-6 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        {/* Shine Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity bg-white" />
      </div>
    </Link>
  );
}
