import { NextRequest, NextResponse } from 'next/server';
import { validateAdminSession } from '@/lib/admin-auth';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = `Eres un experto en crear quizzes. Genera SOLO CSV, sin explicaciones.

Formato exacto:

1. Metadatos
slug,silo,type,title,description,emoji,timeEstimate

2. Datos
mi-slug,personalidad,personality,Mi Quiz,Descripción,🎭,5

3. Línea vacía

4. Encabezado preguntas
q_text,opt_a,opt_a_val,opt_b,opt_b_val,opt_c,opt_c_val,opt_d,opt_d_val

5. Preguntas
¿Pregunta 1?,Op A,res1:2;res2:1,Op B,res1:0;res2:3,Op C,res1:1;res2:2,Op D,res1:3;res2:0

6. Línea vacía

7. Encabezado resultados
id,emoji,title,description,shareText

8. Resultados
res1,💡,Título,Descripción,Texto share

REGLAS:
- slug: kebab-case
- silo: personalidad|trivia|curiosidades|util
- type: personality|trivia|curiosity|useful
- Preguntas: 4-12 (recomendado 6)
- Opciones: 2-5 por pregunta (recomendado 4)
- Resultados: 1-8 (recomendado 4)
- Para personality/useful: opt_X_val = "id:puntos;id2:puntos2"
- Para trivia: agregar columna correct con letra (a/b/c/d)
- Title: 10-90 caracteres
- Description: 10-200 caracteres

SOLO CSV. Nada más.`;

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

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY no configurada en .env' },
        { status: 500 }
      );
    }

    const { prompt } = await request.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Proporciona una descripción de los tests' },
        { status: 400 }
      );
    }

    // Llamar a Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-7',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: `Claude API error: ${error.error?.message || 'Unknown'}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const csvContent = data.content[0].text;

    // Parsear y validar CSV
    const { validateQuiz } = require('@/lib/schema');
    const rows = parseCSV(csvContent);
    const quizzes = extractQuizzesFromCSV(rows);

    // Validar cada quiz
    const results = [];
    for (const quiz of quizzes) {
      const validation = validateQuiz(quiz);
      results.push({
        quiz,
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings,
      });
    }

    return NextResponse.json({
      csv: csvContent,
      quizzes: results,
      count: quizzes.length,
    });
  } catch (error) {
    console.error('Error en /api/generate:', error);
    return NextResponse.json(
      { error: `Error: ${error instanceof Error ? error.message : 'Unknown'}` },
      { status: 500 }
    );
  }
}

function parseCSV(content: string) {
  const lines = content.trim().split('\n');
  const rows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      rows.push([]);
      continue;
    }

    const values = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    rows.push(values);
  }

  return rows;
}

function extractQuizzesFromCSV(rows: any[]): any[] {
  const quizzes = [];
  let currentQuiz = null;
  let metaRow = null;
  let questionsStart = -1;
  let resultsStart = -1;

  // Encontrar secciones
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.length) continue;

    if (!metaRow && row.includes('slug') && row.includes('silo')) {
      metaRow = row;
    }

    if (row.includes('q_text') && row.includes('opt_a')) {
      questionsStart = i;
    }

    if (row.includes('id') && row.includes('emoji') && row.includes('title') && row[0] !== 'q_text') {
      resultsStart = i;
    }
  }

  if (!metaRow || questionsStart === -1 || resultsStart === -1) {
    return [];
  }

  // Parsear quiz
  const metaIdx = rows.indexOf(metaRow);
  const metaDataRow = rows[metaIdx + 1];

  const quiz: {
    slug: string;
    silo: string;
    type: string;
    title: string;
    description: string;
    emoji: string;
    timeEstimate: number;
    questions: Array<{ question: string; options: Record<string, string>[] }>;
    results: Array<Record<string, string>>;
  } = {
    slug: metaDataRow[metaRow.indexOf('slug')],
    silo: metaDataRow[metaRow.indexOf('silo')],
    type: metaDataRow[metaRow.indexOf('type')],
    title: metaDataRow[metaRow.indexOf('title')],
    description: metaDataRow[metaRow.indexOf('description')] || '',
    emoji: metaDataRow[metaRow.indexOf('emoji')] || '🎯',
    timeEstimate: parseInt(metaDataRow[metaRow.indexOf('timeEstimate')]) || 5,
    questions: [],
    results: [],
  };

  const qHeaderRow = rows[questionsStart];
  for (let i = questionsStart + 1; i < resultsStart; i++) {
    const qRow = rows[i];
    if (!qRow.length || !qRow[0]) continue;

    const question: { question: string; options: Record<string, string>[] } = {
      question: qRow[qHeaderRow.indexOf('q_text')] || '',
      options: [],
    };

    for (const letter of ['a', 'b', 'c', 'd', 'e']) {
      const optIdx = qHeaderRow.indexOf(`opt_${letter}`);
      const valIdx = qHeaderRow.indexOf(`opt_${letter}_val`);

      if (optIdx >= 0 && qRow[optIdx]) {
        const opt: Record<string, string> = {
          option: qRow[optIdx],
        };

        if (valIdx >= 0 && qRow[valIdx]) {
          opt.values = qRow[valIdx];
        }

        question.options.push(opt as any);
      }
    }

    if (question.options.length > 0) {
      quiz.questions.push(question);
    }
  }

  const rHeaderRow = rows[resultsStart];
  for (let i = resultsStart + 1; i < rows.length; i++) {
    const rRow = rows[i];
    if (!rRow.length || !rRow[0]) continue;

    const result = {
      id: rRow[rHeaderRow.indexOf('id')] || '',
      emoji: rRow[rHeaderRow.indexOf('emoji')] || '🎯',
      title: rRow[rHeaderRow.indexOf('title')] || '',
      description: rRow[rHeaderRow.indexOf('description')] || '',
      shareText: rRow[rHeaderRow.indexOf('shareText')] || '',
    };

    if (result.id && result.title) {
      quiz.results.push(result);
    }
  }

  quizzes.push(quiz);
  return quizzes;
}
