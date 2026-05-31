'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TestPlayer from '@/components/tests/TestPlayer';
import { Question } from '@/lib/types/test';
import { fetchTestQuestions, fetchTestMetadata } from '@/lib/api/questions';
import { Loader } from 'lucide-react';

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [testTitle, setTestTitle] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTest = async () => {
      try {
        // Fetch test metadata (title, etc)
        const metadata = await fetchTestMetadata(testId);
        setTestTitle(metadata.title);

        // Fetch questions
        const testQuestions = await fetchTestQuestions(testId);
        setQuestions(testQuestions);

        // Create test session
        const sessionResponse = await fetch('/api/tests/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testId }),
        });

        if (!sessionResponse.ok) throw new Error('Failed to create session');

        const { sessionId: newSessionId } = await sessionResponse.json();
        setSessionId(newSessionId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading test');
        console.error('Error loading test:', err);
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      loadTest();
    }
  }, [testId]);

  const handleTestSubmit = (answers: Map<string, string>) => {
    // Redirect to results page
    router.push(`/tests/${testId}/results?sessionId=${sessionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-white">Cargando test...</p>
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
            onClick={() => router.back()}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
          >
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">No hay preguntas disponibles</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 py-4 px-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-white font-bold text-xl">{testTitle}</h1>
          <button
            onClick={() => router.back()}
            className="text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Test Player */}
      <TestPlayer
        questions={questions}
        onSubmit={handleTestSubmit}
        testId={testId}
        sessionId={sessionId}
      />
    </div>
  );
}
