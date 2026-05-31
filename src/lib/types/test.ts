/**
 * Test Question Data Structures
 * Defines TypeScript interfaces for test sessions, questions, and metadata
 */

/**
 * Represents a single test session with answers and scoring
 * @interface TestSession
 */
export interface TestSession {
  /** Unique identifier for this test session */
  id: string;

  /** ID of the test being taken */
  testId: string;

  /** Optional user ID for authenticated sessions */
  userId?: string;

  /** When the test session started */
  startedAt: Date;

  /** When the test was completed (null if in progress) */
  completedAt?: Date;

  /** Map of question ID to selected option ID for quick lookups */
  answers: Map<string, string>;

  /** Final score out of total questions (null if not completed) */
  score?: number;

  /** Total time spent on test in seconds */
  timeSpent?: number;
}

/**
 * Represents a single test question with options
 * @interface Question
 */
export interface Question {
  /** Unique identifier for this question */
  id: string;

  /** ID of the test this question belongs to */
  testId: string;

  /** The question text to display to user */
  questionText: string;

  /** Sequential number of this question in the test */
  questionNumber: number;

  /** Available options for this question */
  options: QuestionOption[];

  /** ID of the correct option */
  correctOptionId: string;

  /** Difficulty level of the question */
  difficulty: 'Easy' | 'Medium' | 'Hard';

  /** Category or topic this question covers */
  category: string;
}

/**
 * Represents a single answer option for a question
 * @interface QuestionOption
 */
export interface QuestionOption {
  /** Unique identifier for this option */
  id: string;

  /** Display text of this option */
  text: string;

  /** Letter designation (A, B, C, D, etc) for display */
  letter: string;
}

/**
 * Represents test metadata and configuration
 * @interface TestMetadata
 */
export interface TestMetadata {
  /** Unique identifier for this test */
  id: string;

  /** Display title of the test */
  title: string;

  /** Category ID this test belongs to */
  categoryId: string;

  /** Total number of questions in this test */
  totalQuestions: number;

  /** Estimated time to complete test in minutes */
  estimatedTime: number;

  /** Overall difficulty level of the test */
  difficulty: 'Easy' | 'Medium' | 'Hard';

  /** Longer description of what this test covers */
  description: string;
}
