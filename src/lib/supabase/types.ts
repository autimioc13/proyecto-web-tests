// Database row types - match Supabase schema exactly

export type UserRow = {
  id: string;           // UUID from auth.users
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  provider: 'google' | 'github' | null;
  created_at: string;   // ISO timestamp
};

export type TestRow = {
  id: string;           // e.g., 'iq-test-1'
  title: string;
  category_id: string;  // 'inteligencia' | 'personalidad' | ...
  question_count: number;
  created_at: string;
};

export type SessionRow = {
  id: string;           // UUID
  user_id: string;      // UUID
  test_id: string;
  category_id: string | null;
  answers: Record<string, string>;  // { questionId: optionId }
  time_spent: number;   // seconds
  status: 'in_progress' | 'completed';
  started_at: string;
  completed_at: string | null;
};

export type ResultRow = {
  id: string;           // UUID
  user_id: string;
  session_id: string | null;
  test_id: string;
  test_title: string;
  category_id: string | null;
  score: number;        // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  time_spent: number;
  completed_at: string;
};

export type ActivityLogRow = {
  id: string;           // UUID
  user_id: string | null;
  activity_type: string;  // 'test_completed' | 'login' | etc.
  resource: string | null;
  resource_id: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
};

// Derived types for API responses
export type UserTestResult = {
  id: string;
  testId: string;
  testTitle: string;
  categoryId: string | null;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  completedAt: string;
  timeSpent: number;
};

// Auth user (from Supabase Auth)
export type AuthUser = {
  id: string;
  email: string | null;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
};
