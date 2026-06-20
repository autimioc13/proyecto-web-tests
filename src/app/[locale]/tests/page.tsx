'use client';

import { useState, useEffect } from 'react';
import { fetchTestCategories, fetchTestsByCategory, Test, TestCategory } from '@/lib/api/tests';
import TestListItem from '@/components/tests/TestListItem';
import { Loader } from 'lucide-react';

export default function TestsPage() {
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchTestCategories();
        setCategories(data);
        // Load initial tests (all tests from first category or empty)
        if (data.length > 0) {
          const initialTests = await fetchTestsByCategory(data[0].id);
          setTests(initialTests);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Handle category filter change
  const handleCategoryChange = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setTestLoading(true);

    try {
      if (categoryId === 'todos') {
        // Load all tests from all categories
        const allTests: Test[] = [];
        for (const category of categories) {
          const categoryTests = await fetchTestsByCategory(category.id);
          allTests.push(...categoryTests);
        }
        setTests(allTests);
      } else {
        // Load tests from specific category
        const categoryTests = await fetchTestsByCategory(categoryId);
        setTests(categoryTests);
      }
    } catch (error) {
      console.error('Failed to load tests:', error);
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" />
          <p className="text-slate-600 dark:text-slate-400">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Todos los Tests
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Explora y toma tests de diferentes categorías para descubrir más sobre ti
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-12 overflow-x-auto pb-2">
          <div className="flex gap-3 min-w-min">
            {/* "Todos" button */}
            <button
              onClick={() => handleCategoryChange('todos')}
              className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all duration-300 ${
                selectedCategory === 'todos'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Todos
            </button>

            {/* Category buttons */}
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tests List */}
        <div>
          {testLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" />
                <p className="text-slate-600 dark:text-slate-400">Cargando tests...</p>
              </div>
            </div>
          ) : tests.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {tests.map((test) => (
                <TestListItem key={test.id} test={test} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
                No hay tests disponibles en esta categoría
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Intenta seleccionar otra categoría o vuelve pronto para nuevos tests
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
