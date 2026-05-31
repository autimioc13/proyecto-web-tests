// Types for test categories and tests
export interface Test {
  id: string;
  title: string;
  slug: string;
  description: string;
  timeMinutes: number;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TestCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  testCount: number;
  tests?: Test[];
}

// Mock data for test categories
const mockCategories: TestCategory[] = [
  {
    id: 'inteligencia',
    name: 'Inteligencia',
    slug: 'inteligencia',
    description: 'Prueba tu cociente intelectual y habilidades cognitivas',
    icon: '🧠',
    color: 'from-blue-500 to-cyan-500',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-cyan-500',
    testCount: 12,
    tests: [
      {
        id: 'iq-test-1',
        title: 'Test de IQ Clásico',
        slug: 'iq-test-clasico',
        description: 'Evalúa tu inteligencia general',
        timeMinutes: 15,
        questionCount: 30,
        difficulty: 'medium',
      },
      {
        id: 'logic-puzzle-1',
        title: 'Acertijos Lógicos',
        slug: 'acertijos-logicos',
        description: 'Resuelve problemas de lógica',
        timeMinutes: 10,
        questionCount: 20,
        difficulty: 'hard',
      },
    ],
  },
  {
    id: 'personalidad',
    name: 'Personalidad',
    slug: 'personalidad',
    description: 'Descubre tu tipo de personalidad y características únicas',
    icon: '✨',
    color: 'from-purple-500 to-pink-500',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-pink-500',
    testCount: 15,
    tests: [
      {
        id: 'mbti-test',
        title: 'Tipo MBTI',
        slug: 'test-mbti',
        description: 'Descubre tu tipo de personalidad Myers-Briggs',
        timeMinutes: 12,
        questionCount: 40,
        difficulty: 'easy',
      },
    ],
  },
  {
    id: 'logica',
    name: 'Lógica',
    slug: 'logica',
    description: 'Desafía tu pensamiento lógico y razonamiento estratégico',
    icon: '🎯',
    color: 'from-green-500 to-emerald-500',
    gradientFrom: 'from-green-500',
    gradientTo: 'to-emerald-500',
    testCount: 10,
    tests: [
      {
        id: 'chess-puzzle',
        title: 'Puzzles de Ajedrez',
        slug: 'puzzles-ajedrez',
        description: 'Resuelve problemas de ajedrez',
        timeMinutes: 8,
        questionCount: 15,
        difficulty: 'hard',
      },
    ],
  },
  {
    id: 'conocimiento',
    name: 'Conocimiento',
    slug: 'conocimiento',
    description: 'Pon a prueba tu conocimiento general en múltiples temas',
    icon: '📚',
    color: 'from-amber-500 to-orange-500',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-500',
    testCount: 25,
    tests: [
      {
        id: 'geography-1',
        title: 'Geografía Mundial',
        slug: 'geografia-mundial',
        description: 'Prueba tus conocimientos de geografía',
        timeMinutes: 10,
        questionCount: 25,
        difficulty: 'medium',
      },
    ],
  },
  {
    id: 'productividad',
    name: 'Productividad',
    slug: 'productividad',
    description: 'Analiza tus hábitos y nivel de productividad personal',
    icon: '⚡',
    color: 'from-red-500 to-rose-500',
    gradientFrom: 'from-red-500',
    gradientTo: 'to-rose-500',
    testCount: 8,
    tests: [
      {
        id: 'productivity-quiz',
        title: 'Estilos de Trabajo',
        slug: 'estilos-trabajo',
        description: 'Identifica tu estilo de trabajo ideal',
        timeMinutes: 7,
        questionCount: 20,
        difficulty: 'easy',
      },
    ],
  },
  {
    id: 'curiosidades',
    name: 'Curiosidades',
    slug: 'curiosidades',
    description: 'Aprende datos fascinantes y sorprendentes del mundo',
    icon: '🌟',
    color: 'from-indigo-500 to-violet-500',
    gradientFrom: 'from-indigo-500',
    gradientTo: 'to-violet-500',
    testCount: 20,
    tests: [
      {
        id: 'facts-1',
        title: 'Hechos Increíbles',
        slug: 'hechos-increibles',
        description: 'Descubre hechos sorprendentes',
        timeMinutes: 5,
        questionCount: 10,
        difficulty: 'easy',
      },
    ],
  },
];

/**
 * Fetches all test categories
 * In a real application, this would call an API endpoint
 */
export async function fetchTestCategories(): Promise<TestCategory[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockCategories;
}

/**
 * Fetches a single test category by ID
 */
export async function fetchTestCategoryById(
  categoryId: string
): Promise<TestCategory | null> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockCategories.find((cat) => cat.id === categoryId) || null;
}

/**
 * Fetches tests within a specific category
 */
export async function fetchTestsByCategory(
  categoryId: string
): Promise<Test[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const category = mockCategories.find((cat) => cat.id === categoryId);
  return category?.tests || [];
}
