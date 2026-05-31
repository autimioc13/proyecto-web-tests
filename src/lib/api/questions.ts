/**
 * Test Questions API Helper
 * Functions to fetch and manage test questions, metadata, and sessions
 */

import {
  TestSession,
  Question,
  TestMetadata,
} from '@/lib/types/test';

const TEST_CATEGORY_MAP: Record<string, string> = {
  'iq-test-1': 'inteligencia',
  'logic-puzzle-1': 'inteligencia',
  'mbti-test': 'personalidad',
  'chess-puzzle': 'logica',
  'geography-1': 'conocimiento',
  'productivity-quiz': 'productividad',
  'facts-1': 'curiosidades',
};

/**
 * Fetches metadata for a test including title, category, and configuration
 * @param testId - The ID of the test to fetch metadata for
 * @returns Promise resolving to test metadata object
 * @example
 * const metadata = await fetchTestMetadata('test-123');
 * console.log(metadata.title, metadata.totalQuestions);
 */
export async function fetchTestMetadata(testId: string): Promise<TestMetadata> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/tests/${testId}/metadata`);
  // return response.json();

  const categoryId = TEST_CATEGORY_MAP[testId] ?? 'personalidad';
  return {
    id: testId,
    title: `Test de ${categoryId.charAt(0).toUpperCase() + categoryId.slice(1)}`,
    categoryId,
    totalQuestions: 10,
    estimatedTime: 15,
    difficulty: 'Medium',
    description: 'Mock test description',
  };
}

/**
 * Fetches all questions for a specific test
 * @param testId - The ID of the test to fetch questions for
 * @returns Promise resolving to array of questions
 * @example
 * const questions = await fetchTestQuestions('test-123');
 * questions.forEach(q => console.log(q.questionText));
 */
export async function fetchTestQuestions(testId: string): Promise<Question[]> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/tests/${testId}/questions`);
  // return response.json();

  return [];
}

/**
 * Saves a completed test session with answers and score
 * Converts Map to serializable format for storage
 * @param session - The test session to save
 * @returns Promise that resolves when save is complete
 * @example
 * const session = new TestSession();
 * session.answers.set('q1', 'option-a');
 * await saveTestSession(session);
 */
export async function saveTestSession(session: TestSession): Promise<void> {
  // TODO: Replace with actual API call
  // Convert Map to object for JSON serialization
  // const answersObj = Object.fromEntries(session.answers);
  // const response = await fetch('/api/sessions', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ ...session, answers: answersObj }),
  // });
  // if (!response.ok) throw new Error('Failed to save session');

  // Mock implementation: no-op
  return Promise.resolve();
}

/**
 * Fetches a previously saved test session
 * Converts stored answers back to Map for client-side use
 * @param sessionId - The ID of the session to fetch
 * @returns Promise resolving to the test session object
 * @example
 * const session = await fetchTestSession('session-abc');
 * const userAnswer = session.answers.get('q1');
 */
export async function fetchTestSession(sessionId: string): Promise<TestSession> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/sessions/${sessionId}`);
  // const data = await response.json();
  // // Convert answers object back to Map
  // const answers = new Map(Object.entries(data.answers));
  // return { ...data, answers };

  return {
    id: sessionId,
    testId: '',
    startedAt: new Date(),
    answers: new Map(),
    timeSpent: 0,
  };
}
