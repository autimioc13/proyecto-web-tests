import { NextRequest, NextResponse } from 'next/server';
import { validateAdminSession } from '@/lib/admin-auth';
import fs from 'fs';
import path from 'path';

const STORE_PATH = path.join(process.cwd(), 'data', 'quizzes-store.json');
const PUBLIC_STORE_PATH = path.join(process.cwd(), 'public', 'data', 'quizzes-store.json');

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = request.cookies.get('admin_session')?.value;
    if (!validateAdminSession(session || '')) {
      return NextResponse.json(
        { error: 'No autorizado. Inicia sesión primero.' },
        { status: 401 }
      );
    }

    const { quizzes } = await request.json();

    if (!Array.isArray(quizzes) || quizzes.length === 0) {
      return NextResponse.json(
        { error: 'Proporciona un array de quizzes válido' },
        { status: 400 }
      );
    }

    // Leer store actual
    let store = [];
    try {
      if (fs.existsSync(STORE_PATH)) {
        const content = fs.readFileSync(STORE_PATH, 'utf-8');
        store = JSON.parse(content);
      }
    } catch (err) {
      console.error('Error reading store:', err);
      store = [];
    }

    // Detectar duplicados
    const storeSlugSet = new Set(store.map((q: any) => q.slug));
    const duplicates = quizzes.filter((q: any) => storeSlugSet.has(q.slug));

    // Agregar o actualizar quizzes
    quizzes.forEach((newQuiz: any) => {
      const idx = store.findIndex((q: any) => q.slug === newQuiz.slug);
      if (idx >= 0) {
        store[idx] = newQuiz;
      } else {
        store.push(newQuiz);
      }
    });

    // Hacer backup
    if (fs.existsSync(STORE_PATH)) {
      const backup = STORE_PATH.replace('.json', `.backup.${Date.now()}.json`);
      fs.copyFileSync(STORE_PATH, backup);
    }

    // Guardar store
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');

    // Guardar también en public para que el cliente lo pueda leer
    fs.writeFileSync(PUBLIC_STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');

    // Calcular estadísticas
    const stats: { [key: string]: number } = {};
    store.forEach((q: any) => {
      stats[q.silo] = (stats[q.silo] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      message: `${quizzes.length} quizzes importados`,
      imported: quizzes.length,
      duplicatesFound: duplicates.length,
      totalQuizzes: store.length,
      distribution: stats,
    });
  } catch (error) {
    console.error('Error en /api/import:', error);
    return NextResponse.json(
      { error: `Error: ${error instanceof Error ? error.message : 'Unknown'}` },
      { status: 500 }
    );
  }
}
