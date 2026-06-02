# FASE 3: Frontend Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) to implement this plan task-by-task with two-stage reviews. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete test-taking platform with interactive test player, scoring system, results analysis, and user dashboard for QuizLab compliance tests.

**Architecture:** 
- Homepage displays 6 test categories fetched from backend API
- Test player component loads questions, handles user answers, tracks progress
- Scoring engine calculates percentages and cognitive ability analysis
- Results page shows detailed breakdown with recommendations
- User dashboard displays test history with comparisons
- All data persists via backend API (FASE 2)

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, Prisma client (read-only), Chart.js for visualizations

---

## File Structure (New & Modified)

### Create (New Components)
- `src/components/tests/TestCard.tsx` - Category card with test count
- `src/components/tests/TestPlayer.tsx` - Main test execution interface
- `src/components/tests/QuestionDisplay.tsx` - Single question renderer
- `src/components/tests/ProgressBar.tsx` - Test progress indicator
- `src/components/tests/ResultsPage.tsx` - Results breakdown
- `src/components/tests/CognitiveChart.tsx` - Ability visualization
- `src/components/dashboard/TestHistory.tsx` - User test history
- `src/components/dashboard/ComparisonChart.tsx` - Score trends
- `src/lib/scoring/scoreCalculator.ts` - Scoring logic
- `src/lib/scoring/cognitiveAnalysis.ts` - Cognitive ability analysis
- `src/app/tests/page.tsx` - Tests browse page
- `src/app/tests/[testId]/page.tsx` - Test player page
- `src/app/tests/[testId]/results/page.tsx` - Results page
- `src/app/dashboard/page.tsx` - User dashboard

### Modify (Existing)
- `src/app/layout.tsx` - Add navigation links
- `src/app/page.tsx` - Homepage with featured tests

---

## Tasks

### Task 1: Create Homepage with Test Categories

**Files:**
- Create: `src/components/tests/TestCard.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/lib/api/tests.ts`

- [ ] **Step 1: Create tests API helper**

File: `src/lib/api/tests.ts`

```typescript
export interface TestCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  testCount: number;
  color: string;
}

export interface Test {
  id: string;
  title: string;
  categoryId: string;
  questionCount: number;
  estimatedTime: number; // minutes
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export async function fetchTestCategories(): Promise<TestCategory[]> {
  // Fetch from backend - for now return mock data
  return [
    {
      id: 'intelligence',
      name: 'Inteligencia',
      description: 'Prueba tu capacidad de razonamiento lógico y matemático',
      icon: '🧠',
      testCount: 8,
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'personality',
      name: 'Personalidad',
      description: 'Descubre tu tipo de personalidad',
      icon: '👤',
      testCount: 5,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'logic',
      name: 'Lógica',
      description: 'Desafía tu pensamiento estratégico',
      icon: '🎯',
      testCount: 12,
      color: 'from-green-500 to-green-600',
    },
    {
      id: 'knowledge',
      name: 'Conocimiento',
      description: 'Evalúa tu base de conocimientos generales',
      icon: '📚',
      testCount: 15,
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      id: 'productivity',
      name: 'Productividad',
      description: 'Mide tu potencial de eficiencia',
      icon: '⚡',
      testCount: 6,
      color: 'from-red-500 to-red-600',
    },
    {
      id: 'curiosity',
      name: 'Curiosidades',
      description: 'Prueba datos interesantes y trivia',
      icon: '✨',
      testCount: 9,
      color: 'from-pink-500 to-pink-600',
    },
  ];
}

export async function fetchTestsByCategory(categoryId: string): Promise<Test[]> {
  // Fetch from backend API later
  // For now return mock data
  return [];
}

export async function fetchTestById(testId: string): Promise<Test | null> {
  // Fetch from backend API later
  return null;
}
```

- [ ] **Step 2: Create TestCard component**

File: `src/components/tests/TestCard.tsx`

```typescript
'use client';

import Link from 'next/link';
import { TestCategory } from '@/lib/api/tests';

interface TestCardProps {
  category: TestCategory;
}

export default function TestCard({ category }: TestCardProps) {
  return (
    <Link href={`/tests?category=${category.id}`}>
      <div className={`
        bg-gradient-to-br ${category.color}
        rounded-lg p-6 cursor-pointer
        transform hover:scale-105 transition-transform
        shadow-lg hover:shadow-xl
        h-48 flex flex-col justify-between
      `}>
        <div>
          <div className="text-5xl mb-3">{category.icon}</div>
          <h3 className="text-xl font-bold text-white">{category.name}</h3>
        </div>
        <div className="text-white text-sm">
          <p className="opacity-90">{category.description}</p>
          <p className="mt-2 font-semibold">{category.testCount} tests</p>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Update homepage**

File: `src/app/page.tsx` (replace existing content)

```typescript
'use client';

import { useEffect, useState } from 'react';
import TestCard from '@/components/tests/TestCard';
import { fetchTestCategories, TestCategory } from '@/lib/api/tests';

export default function HomePage() {
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestCategories().then((data) => {
      setCategories(data);
      setLoading(false);
    });
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-white py-12">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Tests que revelan quién eres <span className="text-purple-400">realmente</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Tests profesionales de inteligencia, personalidad, lógica y más.
            Resultados instantáneos y análisis profundo.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-16">
          <div className="bg-slate-800 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-400">250+</div>
            <div className="text-gray-400">Tests disponibles</div>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-400">1M+</div>
            <div className="text-gray-400">Personas evaluadas</div>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-400">98%</div>
            <div className="text-gray-400">Satisfacción</div>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-400">100%</div>
            <div className="text-gray-400">Resultados precisos</div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Categorías populares</h2>
        
        {loading ? (
          <div className="text-center py-12">Cargando tests...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <TestCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
# Expected: Build succeeds
```

- [ ] **Step 5: Commit**

```bash
git add src/components/tests/TestCard.tsx src/app/page.tsx src/lib/api/tests.ts
git commit -m "feat: create homepage with test categories display"
```

---

### Task 2: Create Test Browse Page

**Files:**
- Create: `src/app/tests/page.tsx`
- Create: `src/components/tests/TestListItem.tsx`

- [ ] **Step 1: Create TestListItem component**

File: `src/components/tests/TestListItem.tsx`

```typescript
'use client';

import Link from 'next/link';
import { Test } from '@/lib/api/tests';

interface TestListItemProps {
  test: Test;
}

export default function TestListItem({ test }: TestListItemProps) {
  const difficultyColor = {
    'Easy': 'text-green-400',
    'Medium': 'text-yellow-400',
    'Hard': 'text-red-400',
  };

  return (
    <Link href={`/tests/${test.id}`}>
      <div className="bg-slate-800 p-6 rounded-lg hover:bg-slate-700 transition cursor-pointer border border-slate-700">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold">{test.title}</h3>
          <span className={`text-sm font-medium ${difficultyColor[test.difficulty]}`}>
            {test.difficulty}
          </span>
        </div>
        
        <div className="flex gap-6 text-sm text-gray-400">
          <div>
            <span className="font-semibold text-white">{test.questionCount}</span> preguntas
          </div>
          <div>
            <span className="font-semibold text-white">{test.estimatedTime}</span> minutos
          </div>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create tests page**

File: `src/app/tests/page.tsx`

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import TestListItem from '@/components/tests/TestListItem';
import { fetchTestsByCategory, Test, fetchTestCategories, TestCategory } from '@/lib/api/tests';

export default function TestsPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');
  
  const [tests, setTests] = useState<Test[]>([]);
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId || 'all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchTestCategories(),
      fetchTestsByCategory(selectedCategory === 'all' ? '' : selectedCategory),
    ]).then(([cats, testData]) => {
      setCategories(cats);
      setTests(testData);
      setLoading(false);
    });
  }, [selectedCategory]);

  return (
    <main className="min-h-screen bg-slate-900 text-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Todos los Tests</h1>

        {/* Category Filter */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Tests List */}
        {loading ? (
          <div className="text-center py-12">Cargando tests...</div>
        ) : tests.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No hay tests disponibles en esta categoría
          </div>
        ) : (
          <div className="space-y-4">
            {tests.map((test) => (
              <TestListItem key={test.id} test={test} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/tests/page.tsx src/components/tests/TestListItem.tsx
git commit -m "feat: create tests browse page with category filtering"
```

---

### Task 3: Create Test Questions Interface & Data Structures

**Files:**
- Create: `src/lib/types/test.ts`
- Create: `src/lib/api/questions.ts`

- [ ] **Step 1: Define test question types**

File: `src/lib/types/test.ts`

```typescript
export interface TestSession {
  id: string;
  testId: string;
  userId?: string;
  startedAt: Date;
  completedAt?: Date;
  answers: Map<string, string>; // questionId -> selectedOptionId
  score?: number;
  timeSpent?: number; // seconds
}

export interface Question {
  id: string;
  testId: string;
  questionText: string;
  questionNumber: number;
  options: QuestionOption[];
  correctOptionId: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  letter: string; // A, B, C, D, etc.
}

export interface TestMetadata {
  id: string;
  title: string;
  categoryId: string;
  totalQuestions: number;
  estimatedTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
}
```

- [ ] **Step 2: Create questions API helper**

File: `src/lib/api/questions.ts`

```typescript
import { Question, TestMetadata, TestSession } from '@/lib/types/test';

export async function fetchTestMetadata(testId: string): Promise<TestMetadata> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/tests/${testId}`);
  // return response.json();

  // Mock data for now
  return {
    id: testId,
    title: 'Test de Razonamiento Lógico',
    categoryId: 'logic',
    totalQuestions: 15,
    estimatedTime: 20,
    difficulty: 'Medium',
    description: 'Evalúa tu capacidad de razonamiento lógico y pensamiento estratégico',
  };
}

export async function fetchTestQuestions(testId: string): Promise<Question[]> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/tests/${testId}/questions`);
  // return response.json();

  // Mock data for now
  return [];
}

export async function saveTestSession(session: TestSession): Promise<void> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/test-sessions`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(session),
  // });
  // return response.json();
}

export async function fetchTestSession(sessionId: string): Promise<TestSession> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/test-sessions/${sessionId}`);
  // return response.json();

  return {
    id: sessionId,
    testId: '',
    startedAt: new Date(),
    answers: new Map(),
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/types/test.ts src/lib/api/questions.ts
git commit -m "feat: define test question data structures and API helpers"
```

---

### Task 4: Create Test Player Component

**Files:**
- Create: `src/components/tests/ProgressBar.tsx`
- Create: `src/components/tests/QuestionDisplay.tsx`
- Create: `src/components/tests/TestPlayer.tsx`

- [ ] **Step 1: Create ProgressBar component**

File: `src/components/tests/ProgressBar.tsx`

```typescript
'use client';

interface ProgressBarProps {
  current: number;
  total: number;
  timeLeft?: number; // seconds
}

export default function ProgressBar({ current, total, timeLeft }: ProgressBarProps) {
  const percentage = (current / total) * 100;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm font-medium">
          Pregunta <span className="text-purple-400">{current}</span> de <span className="text-purple-400">{total}</span>
        </div>
        {timeLeft !== undefined && (
          <div className={`text-sm font-medium ${timeLeft < 60 ? 'text-red-400' : 'text-gray-300'}`}>
            ⏱️ {formatTime(timeLeft)}
          </div>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create QuestionDisplay component**

File: `src/components/tests/QuestionDisplay.tsx`

```typescript
'use client';

import { Question } from '@/lib/types/test';

interface QuestionDisplayProps {
  question: Question;
  selectedOptionId?: string;
  onOptionSelect: (optionId: string) => void;
  isAnswered?: boolean;
}

export default function QuestionDisplay({
  question,
  selectedOptionId,
  onOptionSelect,
  isAnswered,
}: QuestionDisplayProps) {
  return (
    <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
      {/* Question */}
      <h2 className="text-2xl font-bold mb-8 text-white">
        {question.questionText}
      </h2>

      {/* Options */}
      <div className="space-y-4">
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrect = option.id === question.correctOptionId;
          
          let optionClass = 'bg-slate-700 border-slate-600 hover:border-purple-500 cursor-pointer';
          
          if (isAnswered) {
            if (isCorrect) {
              optionClass = 'bg-green-900 border-green-500';
            } else if (isSelected && !isCorrect) {
              optionClass = 'bg-red-900 border-red-500';
            }
          } else if (isSelected) {
            optionClass = 'bg-purple-900 border-purple-500';
          }

          return (
            <button
              key={option.id}
              onClick={() => !isAnswered && onOptionSelect(option.id)}
              disabled={isAnswered}
              className={`
                w-full p-4 rounded-lg border-2 text-left transition
                ${optionClass}
                disabled:cursor-not-allowed
              `}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold">
                  {option.letter}
                </div>
                <span className="text-lg">{option.text}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback after answering */}
      {isAnswered && (
        <div className={`mt-6 p-4 rounded-lg ${
          selectedOptionId === question.correctOptionId
            ? 'bg-green-900 text-green-200 border border-green-500'
            : 'bg-red-900 text-red-200 border border-red-500'
        }`}>
          {selectedOptionId === question.correctOptionId ? (
            <p>✓ ¡Respuesta correcta!</p>
          ) : (
            <p>✗ Respuesta incorrecta. La respuesta correcta es: {
              question.options.find(o => o.id === question.correctOptionId)?.letter
            }</p>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create TestPlayer component**

File: `src/components/tests/TestPlayer.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Question, TestSession, TestMetadata } from '@/lib/types/test';
import { saveTestSession } from '@/lib/api/questions';
import ProgressBar from './ProgressBar';
import QuestionDisplay from './QuestionDisplay';

interface TestPlayerProps {
  testId: string;
  metadata: TestMetadata;
  questions: Question[];
  onComplete: (sessionId: string) => void;
}

export default function TestPlayer({
  testId,
  metadata,
  questions,
  onComplete,
}: TestPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionId] = useState(`session-${Date.now()}`);

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOptionId = answers.get(currentQuestion.id);
  const isCurrentAnswered = answeredQuestions.has(currentQuestion.id);

  // Track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const handleOptionSelect = (optionId: string) => {
    if (isCurrentAnswered) return;
    
    setAnswers(new Map(answers).set(currentQuestion.id, optionId));
    setAnsweredQuestions(new Set(answeredQuestions).add(currentQuestion.id));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    const session: TestSession = {
      id: sessionId,
      testId,
      startedAt: new Date(startTime),
      completedAt: new Date(),
      answers,
      timeSpent: elapsedTime,
    };

    await saveTestSession(session);
    onComplete(sessionId);
  };

  const allAnswered = answeredQuestions.size === questions.length;
  const estimatedTimeLeft = Math.max(0, metadata.estimatedTime * 60 - elapsedTime);

  return (
    <div className="space-y-6">
      <ProgressBar
        current={currentQuestionIndex + 1}
        total={questions.length}
        timeLeft={estimatedTimeLeft}
      />

      <QuestionDisplay
        question={currentQuestion}
        selectedOptionId={selectedOptionId}
        onOptionSelect={handleOptionSelect}
        isAnswered={isCurrentAnswered}
      />

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-3 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition"
        >
          ← Anterior
        </button>

        {currentQuestionIndex < questions.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Siguiente →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="px-8 py-3 bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition font-semibold"
          >
            Finalizar Test
          </button>
        )}
      </div>

      {/* Answers Summary */}
      <div className="text-sm text-gray-400 text-center">
        {answeredQuestions.size} de {questions.length} preguntas respondidas
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
# Expected: Build succeeds
```

- [ ] **Step 5: Commit**

```bash
git add src/components/tests/ProgressBar.tsx src/components/tests/QuestionDisplay.tsx src/components/tests/TestPlayer.tsx
git commit -m "feat: create test player with question display and navigation"
```

---

### Task 5: Create Test Player Page

**Files:**
- Create: `src/app/tests/[testId]/page.tsx`

- [ ] **Step 1: Create test player page**

File: `src/app/tests/[testId]/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchTestMetadata, fetchTestQuestions } from '@/lib/api/questions';
import TestPlayer from '@/components/tests/TestPlayer';
import { TestMetadata, Question } from '@/lib/types/test';

interface PageProps {
  params: {
    testId: string;
  };
}

export default function TestPage({ params }: PageProps) {
  const router = useRouter();
  const [metadata, setMetadata] = useState<TestMetadata | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTest() {
      try {
        const [meta, qs] = await Promise.all([
          fetchTestMetadata(params.testId),
          fetchTestQuestions(params.testId),
        ]);
        setMetadata(meta);
        setQuestions(qs);
      } catch (err) {
        setError('Error al cargar el test. Por favor intenta de nuevo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadTest();
  }, [params.testId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900 text-white py-12">
        <div className="max-w-4xl mx-auto text-center py-20">
          Cargando test...
        </div>
      </main>
    );
  }

  if (error || !metadata || questions.length === 0) {
    return (
      <main className="min-h-screen bg-slate-900 text-white py-12">
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-red-400 mb-4">{error || 'Test no disponible'}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Volver
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{metadata.title}</h1>
          <p className="text-gray-400">{metadata.description}</p>
        </div>

        <TestPlayer
          testId={params.testId}
          metadata={metadata}
          questions={questions}
          onComplete={(sessionId) => {
            router.push(`/tests/${params.testId}/results?sessionId=${sessionId}`);
          }}
        />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/tests/\[testId\]/page.tsx
git commit -m "feat: create test execution page with player integration"
```

---

### Task 6: Create Scoring System

**Files:**
- Create: `src/lib/scoring/scoreCalculator.ts`
- Create: `src/lib/scoring/cognitiveAnalysis.ts`

- [ ] **Step 1: Create score calculator**

File: `src/lib/scoring/scoreCalculator.ts`

```typescript
import { TestSession, Question } from '@/lib/types/test';

export interface ScoreResult {
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  timeSpent: number;
  avgTimePerQuestion: number;
}

export function calculateScore(
  session: TestSession,
  questions: Question[]
): ScoreResult {
  let correctAnswers = 0;

  for (const question of questions) {
    const selectedOptionId = session.answers.get(question.id);
    if (selectedOptionId === question.correctOptionId) {
      correctAnswers++;
    }
  }

  const percentage = (correctAnswers / questions.length) * 100;
  const grade = getGrade(percentage);
  const timeSpent = session.timeSpent || 0;
  const avgTimePerQuestion = questions.length > 0 ? timeSpent / questions.length : 0;

  return {
    percentage: Math.round(percentage),
    correctAnswers,
    totalQuestions: questions.length,
    grade,
    timeSpent,
    avgTimePerQuestion: Math.round(avgTimePerQuestion),
  };
}

function getGrade(percentage: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (percentage >= 95) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 75) return 'B';
  if (percentage >= 65) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}
```

- [ ] **Step 2: Create cognitive analysis**

File: `src/lib/scoring/cognitiveAnalysis.ts`

```typescript
import { TestSession, Question } from '@/lib/types/test';

export interface CognitiveAbility {
  name: string;
  percentage: number;
  level: 'Bajo' | 'Medio' | 'Alto' | 'Muy Alto';
}

export interface CognitiveAnalysis {
  logicalReasoning: CognitiveAbility;
  mathematicalReasoning: CognitiveAbility;
  verbalComprehension: CognitiveAbility;
  processingSpeed: CognitiveAbility;
  spatialVisualization: CognitiveAbility;
}

export function analyzeCognitive(
  session: TestSession,
  questions: Question[]
): CognitiveAnalysis {
  const abilities: Map<string, { correct: number; total: number }> = new Map([
    ['logicalReasoning', { correct: 0, total: 0 }],
    ['mathematicalReasoning', { correct: 0, total: 0 }],
    ['verbalComprehension', { correct: 0, total: 0 }],
    ['processingSpeed', { correct: 0, total: 0 }],
    ['spatialVisualization', { correct: 0, total: 0 }],
  ]);

  for (const question of questions) {
    const ability = mapCategoryToAbility(question.category);
    const stats = abilities.get(ability)!;
    stats.total++;

    if (session.answers.get(question.id) === question.correctOptionId) {
      stats.correct++;
    }
  }

  const getAbility = (name: string, key: string): CognitiveAbility => {
    const stats = abilities.get(key)!;
    const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    const level = getLevel(percentage);
    return { name, percentage, level };
  };

  return {
    logicalReasoning: getAbility('Razonamiento Lógico', 'logicalReasoning'),
    mathematicalReasoning: getAbility('Razonamiento Matemático', 'mathematicalReasoning'),
    verbalComprehension: getAbility('Comprensión Verbal', 'verbalComprehension'),
    processingSpeed: getAbility('Velocidad de Procesamiento', 'processingSpeed'),
    spatialVisualization: getAbility('Visualización Espacial', 'spatialVisualization'),
  };
}

function mapCategoryToAbility(category: string): string {
  const mapping: Record<string, string> = {
    logic: 'logicalReasoning',
    math: 'mathematicalReasoning',
    verbal: 'verbalComprehension',
    speed: 'processingSpeed',
    spatial: 'spatialVisualization',
  };
  return mapping[category] || 'logicalReasoning';
}

function getLevel(percentage: number): 'Bajo' | 'Medio' | 'Alto' | 'Muy Alto' {
  if (percentage >= 85) return 'Muy Alto';
  if (percentage >= 70) return 'Alto';
  if (percentage >= 50) return 'Medio';
  return 'Bajo';
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/scoring/scoreCalculator.ts src/lib/scoring/cognitiveAnalysis.ts
git commit -m "feat: implement scoring system and cognitive ability analysis"
```

---

### Task 7: Create Results Page (Part 1 - Layout)

**Files:**
- Create: `src/components/tests/CognitiveChart.tsx`
- Create: `src/components/tests/ResultsPage.tsx`

- [ ] **Step 1: Create cognitive chart component**

File: `src/components/tests/CognitiveChart.tsx`

```typescript
'use client';

import { CognitiveAbility } from '@/lib/scoring/cognitiveAnalysis';

interface CognitiveChartProps {
  abilities: CognitiveAbility[];
}

export default function CognitiveChart({ abilities }: CognitiveChartProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Habilidades Cognitivas</h3>
      
      {abilities.map((ability) => {
        const colorClass = {
          'Muy Alto': 'from-green-500 to-green-600',
          'Alto': 'from-blue-500 to-blue-600',
          'Medio': 'from-yellow-500 to-yellow-600',
          'Bajo': 'from-red-500 to-red-600',
        }[ability.level];

        return (
          <div key={ability.name} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">{ability.name}</span>
              <span className="text-purple-400 font-bold">{ability.percentage}%</span>
            </div>
            
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className={`bg-gradient-to-r ${colorClass} h-3 transition-all duration-500`}
                style={{ width: `${ability.percentage}%` }}
              />
            </div>
            
            <div className="mt-2 text-sm text-gray-400">
              Nivel: <span className={`font-semibold ${
                ability.level === 'Muy Alto' ? 'text-green-400' :
                ability.level === 'Alto' ? 'text-blue-400' :
                ability.level === 'Medio' ? 'text-yellow-400' :
                'text-red-400'
              }`}>{ability.level}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create results page component**

File: `src/components/tests/ResultsPage.tsx`

```typescript
'use client';

import { ScoreResult } from '@/lib/scoring/scoreCalculator';
import { CognitiveAnalysis } from '@/lib/scoring/cognitiveAnalysis';
import CognitiveChart from './CognitiveChart';

interface ResultsPageProps {
  score: ScoreResult;
  cognitive: CognitiveAnalysis;
  testTitle: string;
  timeSpent: number;
}

export default function ResultsPage({
  score,
  cognitive,
  testTitle,
  timeSpent,
}: ResultsPageProps) {
  const abilities = [
    cognitive.logicalReasoning,
    cognitive.mathematicalReasoning,
    cognitive.verbalComprehension,
    cognitive.processingSpeed,
    cognitive.spatialVisualization,
  ];

  const getScoreColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-400';
    if (percentage >= 70) return 'text-blue-400';
    if (percentage >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return 'from-green-500 to-green-600';
    if (grade === 'B') return 'from-blue-500 to-blue-600';
    if (grade === 'C') return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">{testTitle}</h1>
        <p className="text-gray-400">Prueba completada</p>
      </div>

      {/* Main Score Card */}
      <div className={`bg-gradient-to-br ${getGradeColor(score.grade)} p-8 rounded-lg text-white text-center`}>
        <div className="text-6xl font-bold mb-4">{score.grade}</div>
        <div className={`text-5xl font-bold mb-2 ${getScoreColor(score.percentage)}`}>
          {score.percentage}%
        </div>
        <p className="text-xl opacity-90">
          {score.correctAnswers} de {score.totalQuestions} respuestas correctas
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-center">
          <div className="text-3xl font-bold text-purple-400">{score.correctAnswers}</div>
          <div className="text-gray-400 mt-2">Respuestas Correctas</div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-center">
          <div className="text-3xl font-bold text-blue-400">{score.avgTimePerQuestion}s</div>
          <div className="text-gray-400 mt-2">Tiempo Promedio/Pregunta</div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-center">
          <div className="text-3xl font-bold text-green-400">{Math.floor(score.timeSpent / 60)}m</div>
          <div className="text-gray-400 mt-2">Tiempo Total</div>
        </div>
      </div>

      {/* Cognitive Analysis */}
      <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
        <CognitiveChart abilities={abilities} />
      </div>

      {/* Recommendations */}
      <div className="bg-blue-900 border border-blue-500 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">💡 Recomendaciones</h3>
        <ul className="space-y-2 text-blue-100">
          {score.percentage >= 85 ? (
            <>
              <li>✓ Excelente desempeño. Considera tomar tests más desafiantes.</li>
              <li>✓ Tu puntuación indica habilidades cognitivas por encima del promedio.</li>
            </>
          ) : score.percentage >= 70 ? (
            <>
              <li>• Buen desempeño. Puedes mejorar practicando regularmente.</li>
              <li>• Enfócate en las áreas de menor puntuación para un desarrollo equilibrado.</li>
            </>
          ) : (
            <>
              <li>• Sigue practicando para mejorar tu desempeño.</li>
              <li>• Intenta nuevamente después de revisar las áreas débiles.</li>
            </>
          )}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <button className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold">
          Compartir Resultado
        </button>
        <button className="px-8 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition border border-slate-700">
          Ir al Dashboard
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/tests/CognitiveChart.tsx src/components/tests/ResultsPage.tsx
git commit -m "feat: create results page with cognitive analysis visualization"
```

---

### Task 8: Create Results Page Route

**Files:**
- Create: `src/app/tests/[testId]/results/page.tsx`

- [ ] **Step 1: Create results page route**

File: `src/app/tests/[testId]/results/page.tsx`

```typescript
'use client';

import { useEffect, useState, useSearchParams } from 'next/navigation';
import { fetchTestSession, fetchTestQuestions, fetchTestMetadata } from '@/lib/api/questions';
import { calculateScore } from '@/lib/scoring/scoreCalculator';
import { analyzeCognitive } from '@/lib/scoring/cognitiveAnalysis';
import ResultsPage from '@/components/tests/ResultsPage';
import { TestSession, Question, TestMetadata, ScoreResult } from '@/lib/types/test';
import { CognitiveAnalysis } from '@/lib/scoring/cognitiveAnalysis';

interface PageProps {
  params: {
    testId: string;
  };
}

export default function TestResultsPage({ params }: PageProps) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [session, setSession] = useState<TestSession | null>(null);
  const [metadata, setMetadata] = useState<TestMetadata | null>(null);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [cognitive, setCognitive] = useState<CognitiveAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResults() {
      try {
        if (!sessionId) {
          setError('Session ID no encontrado');
          return;
        }

        const [sess, meta, questions] = await Promise.all([
          fetchTestSession(sessionId),
          fetchTestMetadata(params.testId),
          fetchTestQuestions(params.testId),
        ]);

        setSession(sess);
        setMetadata(meta);

        const scoreResult = calculateScore(sess, questions);
        const cognitiveAnalysis = analyzeCognitive(sess, questions);

        setScore(scoreResult);
        setCognitive(cognitiveAnalysis);
      } catch (err) {
        setError('Error al cargar resultados. Por favor intenta de nuevo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, [sessionId, params.testId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900 text-white py-12">
        <div className="max-w-4xl mx-auto text-center py-20">
          Cargando resultados...
        </div>
      </main>
    );
  }

  if (error || !score || !cognitive || !metadata) {
    return (
      <main className="min-h-screen bg-slate-900 text-white py-12">
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-red-400">{error || 'Error al cargar resultados'}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <ResultsPage
          score={score}
          cognitive={cognitive}
          testTitle={metadata.title}
          timeSpent={session.timeSpent || 0}
        />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Fix Next.js useSearchParams hook issue**

The `useSearchParams` hook should be moved to a client component. Update the file:

```typescript
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
// ... rest of imports
```

- [ ] **Step 3: Commit**

```bash
git add src/app/tests/\[testId\]/results/page.tsx
git commit -m "feat: create results page route with scoring and analysis"
```

---

### Task 9: Create User Dashboard (Basic)

**Files:**
- Create: `src/components/dashboard/TestHistory.tsx`
- Create: `src/components/dashboard/ComparisonChart.tsx`
- Create: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Create test history component**

File: `src/components/dashboard/TestHistory.tsx`

```typescript
'use client';

interface TestRecord {
  id: string;
  testTitle: string;
  score: number;
  grade: string;
  date: Date;
  timeSpent: number;
}

interface TestHistoryProps {
  tests: TestRecord[];
}

export default function TestHistory({ tests }: TestHistoryProps) {
  const getGradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return 'text-green-400';
    if (grade === 'B') return 'text-blue-400';
    if (grade === 'C') return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-6">Historial de Tests</h3>
      
      {tests.length === 0 ? (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-center text-gray-400">
          Aún no has completado tests. ¡Comienza uno ahora!
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex justify-between items-center hover:border-slate-600 transition"
            >
              <div className="flex-1">
                <h4 className="font-semibold">{test.testTitle}</h4>
                <p className="text-sm text-gray-400">
                  {new Date(test.date).toLocaleDateString('es-ES')} · {Math.floor(test.timeSpent / 60)}m
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getGradeColor(test.grade)}`}>
                    {test.grade}
                  </div>
                  <div className="text-sm text-gray-400">{test.score}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create comparison chart component**

File: `src/components/dashboard/ComparisonChart.tsx`

```typescript
'use client';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface ComparisonChartProps {
  data: ChartDataPoint[];
  title: string;
}

export default function ComparisonChart({ data, title }: ComparisonChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 100);

  return (
    <div>
      <h3 className="text-xl font-bold mb-6">{title}</h3>
      
      <div className="space-y-4">
        {data.map((point) => (
          <div key={point.label}>
            <div className="flex justify-between mb-2">
              <span className="font-medium">{point.label}</span>
              <span className="text-purple-400 font-bold">{point.value}%</span>
            </div>
            
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(point.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create dashboard page**

File: `src/app/dashboard/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import TestHistory from '@/components/dashboard/TestHistory';
import ComparisonChart from '@/components/dashboard/ComparisonChart';

export default function DashboardPage() {
  // Mock data - will be replaced with API calls
  const mockTestHistory = [
    {
      id: '1',
      testTitle: 'Test de Razonamiento Lógico',
      score: 82,
      grade: 'A',
      date: new Date('2024-05-28'),
      timeSpent: 1200,
    },
    {
      id: '2',
      testTitle: 'Test de Personalidad',
      score: 75,
      grade: 'B',
      date: new Date('2024-05-25'),
      timeSpent: 900,
    },
    {
      id: '3',
      testTitle: 'Test de Inteligencia',
      score: 88,
      grade: 'A+',
      date: new Date('2024-05-20'),
      timeSpent: 1500,
    },
  ];

  const mockAbilityData = [
    { label: 'Razonamiento Lógico', value: 82 },
    { label: 'Razonamiento Matemático', value: 79 },
    { label: 'Comprensión Verbal', value: 88 },
    { label: 'Velocidad de Procesamiento', value: 74 },
    { label: 'Visualización Espacial', value: 86 },
  ];

  const mockScoreTrend = [
    { label: 'May 20', value: 88 },
    { label: 'May 25', value: 75 },
    { label: 'May 28', value: 82 },
  ];

  return (
    <main className="min-h-screen bg-slate-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Mi Dashboard</h1>
          <p className="text-gray-400">Revisa tu progreso y estadísticas</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-center">
            <div className="text-3xl font-bold text-purple-400">3</div>
            <div className="text-gray-400 mt-2">Tests Completados</div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-center">
            <div className="text-3xl font-bold text-blue-400">82%</div>
            <div className="text-gray-400 mt-2">Promedio</div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-center">
            <div className="text-3xl font-bold text-green-400">A</div>
            <div className="text-gray-400 mt-2">Mejor Calificación</div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-center">
            <div className="text-3xl font-bold text-yellow-400">54m</div>
            <div className="text-gray-400 mt-2">Tiempo Total</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Test History */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
              <TestHistory tests={mockTestHistory} />
            </div>
          </div>

          {/* Right Column: Abilities */}
          <div>
            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 mb-8">
              <ComparisonChart
                title="Habilidades Promedio"
                data={mockAbilityData}
              />
            </div>

            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
              <ComparisonChart
                title="Tendencia de Puntuación"
                data={mockScoreTrend}
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-purple-900 border border-purple-500 p-8 rounded-lg text-center">
          <h3 className="text-2xl font-bold mb-4">¿Listo para más tests?</h3>
          <p className="text-purple-100 mb-6">Desafíate con nuevas pruebas y mejora tus habilidades</p>
          <a
            href="/tests"
            className="inline-block px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            Ir a Tests
          </a>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/TestHistory.tsx src/components/dashboard/ComparisonChart.tsx src/app/dashboard/page.tsx
git commit -m "feat: create user dashboard with test history and statistics"
```

---

### Task 10: Update Navigation & Links

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/components/Navigation.tsx`

- [ ] **Step 1: Create Navigation component**

File: `src/components/Navigation.tsx`

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-purple-400">
          🧠 MindPlex
        </Link>

        <div className="flex gap-8 items-center">
          <Link
            href="/tests"
            className={`transition ${
              isActive('/tests')
                ? 'text-purple-400 font-semibold'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Tests
          </Link>

          <Link
            href="/dashboard"
            className={`transition ${
              isActive('/dashboard')
                ? 'text-purple-400 font-semibold'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Dashboard
          </Link>

          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Registrarse
          </button>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Update layout.tsx**

File: `src/app/layout.tsx` (add Navigation import and use it)

```typescript
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata = {
  title: 'MindPlex - Tests de Inteligencia',
  description: 'Tests profesionales que revelan quién eres realmente',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-slate-900 text-white">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
# Expected: Build succeeds
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Navigation.tsx src/app/layout.tsx
git commit -m "feat: add navigation and link all pages together"
```

---

## Summary

This 10-task plan implements the core of FASE 3: Frontend Tests, including:

✅ Homepage with test categories  
✅ Test browse page with filtering  
✅ Interactive test player with question display  
✅ Scoring system with cognitive analysis  
✅ Results page with detailed analytics  
✅ User dashboard with history and statistics  
✅ Navigation between all pages  

**Next Steps After FASE 3:**
- Connect to backend APIs (replace mock data)
- Add user authentication
- Implement data persistence
- Add email sharing of results
- Create leaderboards and comparisons

---

**Plan saved to:** `docs/superpowers/plans/2026-05-30-fase-3-frontend-tests.md`

## Execution Options

**1. Subagent-Driven (Recommended)** - Fresh subagent per task with two-stage reviews (spec compliance + code quality)

**2. Inline Execution** - Execute tasks in this session with checkpoints

**Which approach would you prefer?**