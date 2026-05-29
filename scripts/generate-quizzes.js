#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const { validateQuiz, validateCatalog } = require('../src/lib/schema');

// Función para llamar a Claude API
async function callClaudeAPI(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      '❌ ANTHROPIC_API_KEY no está configurada en .env\n' +
      '   Obtén tu clave en: https://console.anthropic.com/\n' +
      '   Agrega a .env: ANTHROPIC_API_KEY=sk-ant-...'
    );
  }

  const systemPrompt = `Eres un experto en crear quizzes para un sitio web.
Tu tarea es generar quizzes en formato CSV SOLAMENTE.

Sigue EXACTAMENTE este formato:

1. Primera línea: metadatos
slug,silo,type,title,description,emoji,timeEstimate

2. Datos de metadatos
mi-slug,personalidad,personality,Mi Quiz,Descripción aquí,🎭,5

3. Línea vacía

4. Encabezado de preguntas
q_text,opt_a,opt_a_val,opt_b,opt_b_val,opt_c,opt_c_val,opt_d,opt_d_val

5. Preguntas (una por fila)
¿Pregunta 1?,Opción A,resultado1:2;resultado2:1,Opción B,resultado1:0;resultado2:3,Opción C,resultado1:1;resultado2:2,Opción D,resultado1:3;resultado2:0

6. Línea vacía

7. Encabezado de resultados
id,emoji,title,description,shareText

8. Resultados (uno por fila)
resultado1,💡,El Innovador,Descripción del resultado,Soy un Innovador 💡

REGLAS ESTRICTAS:
- SOLO CSV, sin explicaciones
- slug: kebab-case (ej: mi-test-123)
- silo: personalidad | trivia | curiosidades | util
- type: personality | trivia | curiosity | useful
- Preguntas: 4-12 (recomendado 6)
- Opciones: 2-5 por pregunta (recomendado 4)
- Resultados: 1-8 (recomendado 4-5)
- Para personality/useful: opt_X_val con formato "id:puntos;id2:puntos2"
- Para trivia: agregar columna 'correct' con letra de respuesta
- Caracteres (title): 10-90
- Caracteres (description): 10-200

IMPORTANTE:
- NO incluyas comillas en CSV
- NO incluyas saltos de línea dentro de celdas
- Asegúrate que resultId en opt_X_val coincida con 'id' en resultados
- Para trivia: cada opción necesita correct=a/b/c/d

Genera SOLO CSV. Nada más.`;

  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: 'claude-opus-4-7',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (response.error) {
            reject(new Error(`API Error: ${response.error.message}`));
          } else if (response.content && response.content[0]) {
            resolve(response.content[0].text);
          } else {
            reject(new Error('Respuesta inesperada de Claude'));
          }
        } catch (e) {
          reject(new Error(`Error al parsear respuesta: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Error de conexión: ${e.message}`));
    });

    req.write(payload);
    req.end();
  });
}

// Parsear CSV
function parseCSV(content) {
  const lines = content.trim().split('\n');
  const rows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

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

// Convertir CSV a quiz
function csvToQuiz(rows) {
  if (rows.length === 0) throw new Error('CSV vacío');

  let metaRow = null;
  let questionsStart = -1;
  let resultsStart = -1;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

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

  if (!metaRow) throw new Error('Falta encabezado de metadatos');
  if (questionsStart === -1) throw new Error('Falta sección de preguntas');
  if (resultsStart === -1) throw new Error('Falta sección de resultados');

  const metaIdx = rows.indexOf(metaRow);
  const metaDataRow = rows[metaIdx + 1];

  const quiz = {
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
    if (!qRow[0]) continue;

    const question = {
      question: qRow[qHeaderRow.indexOf('q_text')] || '',
      options: [],
    };

    for (const letter of ['a', 'b', 'c', 'd', 'e']) {
      const optIdx = qHeaderRow.indexOf(`opt_${letter}`);
      const valIdx = qHeaderRow.indexOf(`opt_${letter}_val`);

      if (optIdx >= 0 && qRow[optIdx]) {
        const opt = {
          option: qRow[optIdx],
        };

        if (valIdx >= 0 && qRow[valIdx]) {
          opt.values = qRow[valIdx];
        }

        question.options.push(opt);
      }
    }

    if (question.options.length > 0) {
      quiz.questions.push(question);
    }
  }

  const rHeaderRow = rows[resultsStart];
  for (let i = resultsStart + 1; i < rows.length; i++) {
    const rRow = rows[i];
    if (!rRow[0]) continue;

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

  return quiz;
}

// Main
async function main() {
  const prompt = process.argv.slice(2).join(' ');

  if (!prompt) {
    console.error('❌ Uso: npm run generate "descripción de los tests a crear"');
    console.error('');
    console.error('Ejemplos:');
    console.error('  npm run generate "10 tests de personalidad sobre animales"');
    console.error('  npm run generate "5 trivias sobre geografía, 3 curiosidades"');
    console.error('  npm run generate "tests útiles: consejos de productividad"');
    console.error('');
    console.error('La IA generará CSV validado e importado automáticamente.');
    process.exit(1);
  }

  try {
    console.log('🤖 Pidiendo a Claude que genere tests...\n');
    const csvContent = await callClaudeAPI(prompt);

    console.log('✅ CSV generado!\n');

    const rows = parseCSV(csvContent);
    const quiz = csvToQuiz(rows);

    console.log(`🔍 Validando: "${quiz.title}"`);
    const { validateQuiz: validate } = require('../src/lib/schema');
    const validation = validate(quiz);

    if (!validation.valid) {
      console.error('\n❌ Validación fallida:\n');
      validation.errors.forEach(e => console.error(`  ${e}`));
      console.error('\nIntenta de nuevo con una descripción más clara.\n');
      process.exit(1);
    }

    // Guardar CSV y JSON
    const timestamp = Date.now();
    const csvPath = path.resolve(`tests/generated-${timestamp}.csv`);
    const jsonPath = csvPath.replace(/\.csv$/, '.quiz.json');

    fs.writeFileSync(csvPath, csvContent, 'utf-8');
    fs.writeFileSync(jsonPath, JSON.stringify(quiz, null, 2), 'utf-8');

    console.log(`✅ Quiz generado y validado!`);
    console.log(`📋 ${quiz.questions.length} preguntas`);
    console.log(`🎁 ${quiz.results.length} resultados`);
    console.log(`💾 Guardado: generated-${timestamp}.quiz.json\n`);

    // Importar automáticamente
    console.log('📥 Importando al store...');
    const storeImport = require('./import-quizzes.js');

    // Hack para redirigir el import
    const STORE_PATH = path.resolve(__dirname, '../data/quizzes-store.json');
    let store = [];
    try {
      const content = fs.readFileSync(STORE_PATH, 'utf-8');
      store = JSON.parse(content);
    } catch {}

    const storeSlugSet = new Set(store.map(q => q.slug));
    if (storeSlugSet.has(quiz.slug)) {
      console.warn(`⚠️ ${quiz.slug} ya existe. Sobrescribiendo...\n`);
      const idx = store.findIndex(q => q.slug === quiz.slug);
      store[idx] = quiz;
    } else {
      store.push(quiz);
    }

    // Backup
    if (fs.existsSync(STORE_PATH)) {
      const backup = STORE_PATH.replace('.json', `.backup.${Date.now()}.json`);
      fs.copyFileSync(STORE_PATH, backup);
    }

    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');

    // Copiar a public también
    const publicPath = path.resolve(__dirname, '../public/data/quizzes-store.json');
    fs.writeFileSync(publicPath, JSON.stringify(store, null, 2), 'utf-8');

    // Estadísticas
    const stats = {};
    store.forEach(q => {
      stats[q.silo] = (stats[q.silo] || 0) + 1;
    });

    console.log(`✅ Importado al store!\n`);
    console.log(`📊 Store actualizado: ${store.length} quizzes totales`);
    console.log('📈 Distribución por silo:');
    Object.entries(stats).forEach(([silo, count]) => {
      console.log(`   ${silo}: ${count}`);
    });

    console.log(`\n🚀 Para publicar, corre: npm run build\n`);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

main();
