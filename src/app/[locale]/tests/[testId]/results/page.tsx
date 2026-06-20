'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import ResultsCard from '@/components/tests/ResultsCard';
import ProductRecommendations from '@/components/ProductRecommendations';
import { ScoreResult, calculateScore } from '@/lib/scoring/calculator';
import { Question, TestSession } from '@/lib/types/test';
import { fetchTestQuestions, fetchTestSession, fetchTestMetadata } from '@/lib/api/questions';
import { getCategoryTheme, CategoryTheme, defaultTheme } from '@/lib/themes/categoryThemes';
import { Loader } from 'lucide-react';

export default function ResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const testId = params.testId as string;
  const sessionId = searchParams.get('sessionId');

  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [testTitle, setTestTitle] = useState('');
  const [theme, setTheme] = useState<CategoryTheme>(defaultTheme);
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadResults = async () => {
      try {
        if (!sessionId) throw new Error('Session ID missing');

        const metadata = await fetchTestMetadata(testId);
        setTestTitle(metadata.title);
        setCategoryId(metadata.categoryId);
        setTheme(getCategoryTheme(metadata.categoryId));

        const questions = await fetchTestQuestions(testId);

        const session = await fetchTestSession(sessionId);

        const result = calculateScore(questions, session);
        setScoreResult(result);

        await fetch(`/api/tests/results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            testId,
            sessionId,
            score: result.score,
            grade: result.grade,
            timeSpent: session.timeSpent,
            categoryId: metadata.categoryId,
          }),
        }).catch(err => console.error('Failed to save results:', err));

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading results');
        console.error('Error loading results:', err);
      } finally {
        setLoading(false);
      }
    };

    if (testId && sessionId) {
      loadResults();
    }
  }, [testId, sessionId]);

  const handleRetakTest = () => {
    router.push(`/tests/${testId}`);
  };

  const handleBackHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-white">Calculando resultados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={handleBackHome}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
          >
            ← Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (!scoreResult) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">No hay resultados disponibles</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen">
      <ResultsCard scoreResult={scoreResult} testTitle={testTitle} theme={theme} />

      {/* Product Recommendations Section */}
      <ProductRecommendations
        testScore={Math.round(scoreResult.score)}
        testSilo={categoryId || 'general'}
        totalCompletedTests={1}
        totalXP={Math.round(scoreResult.score * 10)}
        purchasedProductIds={[]}
      />

      <div className="max-w-2xl mx-auto px-4 pb-12 flex gap-4">
        <button
          onClick={handleRetakTest}
          className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded transition"
        >
          🔄 Reintentar Test
        </button>
        <button
          onClick={handleBackHome}
          className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded transition"
        >
          🏠 Volver al Inicio
        </button>
      </div>
    </div>
  );
}
