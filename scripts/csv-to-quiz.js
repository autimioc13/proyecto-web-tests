#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { validateQuiz } = require('../src/lib/schema');

// Parser CSV robusto
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

  // Encontrar secciones
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Primera fila con metadatos
    if (!metaRow && row.includes('slug') && row.includes('silo')) {
      metaRow = row;
    }

    // Sección de preguntas
    if (row.includes('q_text') && row.includes('opt_a')) {
      questionsStart = i;
    }

    // Sección de resultados
    if (row.includes('id') && row.includes('emoji') && row.includes('title') && row[0] !== 'q_text') {
      resultsStart = i;
    }
  }

  if (!metaRow) throw new Error('Falta encabezado de metadatos (slug, silo, type, title)');
  if (questionsStart === -1) throw new Error('Falta sección de preguntas (q_text, opt_a, ...)');
  if (resultsStart === -1) throw new Error('Falta sección de resultados (id, emoji, title, ...)');

  // Parsear metadatos
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

  // Parsear preguntas
  const qHeaderRow = rows[questionsStart];
  for (let i = questionsStart + 1; i < resultsStart; i++) {
    const qRow = rows[i];
    if (!qRow[0]) continue; // Saltar filas vacías

    const question = {
      question: qRow[qHeaderRow.indexOf('q_text')] || '',
      options: [],
    };

    // Extraer opciones (opt_a, opt_b, opt_c, opt_d, opt_e)
    for (const letter of ['a', 'b', 'c', 'd', 'e']) {
      const optIdx = qHeaderRow.indexOf(`opt_${letter}`);
      const valIdx = qHeaderRow.indexOf(`opt_${letter}_val`);
      const correctIdx = qHeaderRow.indexOf('correct');

      if (optIdx >= 0 && qRow[optIdx]) {
        const opt = {
          option: qRow[optIdx],
        };

        if (valIdx >= 0 && qRow[valIdx]) {
          opt.values = qRow[valIdx];
        }

        if (quiz.type === 'trivia' && correctIdx >= 0) {
          opt.correct = qRow[correctIdx] === letter;
        }

        question.options.push(opt);
      }
    }

    if (question.options.length > 0) {
      quiz.questions.push(question);
    }
  }

  // Parsear resultados
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

function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('❌ Uso: npm run csv <archivo.csv>');
    console.error('   Ejemplo: npm run csv tests/ejemplo-simple.csv');
    process.exit(1);
  }

  const csvPath = path.resolve(filePath);
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Archivo no encontrado: ${csvPath}`);
    process.exit(1);
  }

  try {
    console.log(`📖 Leyendo ${path.basename(csvPath)}...`);
    const content = fs.readFileSync(csvPath, 'utf-8');
    const rows = parseCSV(content);

    console.log(`📊 Procesando...`);
    const quiz = csvToQuiz(rows);

    console.log(`\n🔍 Validando: "${quiz.title}"`);
    const validation = validateQuiz(quiz);

    if (!validation.valid) {
      console.error('\n❌ ERRORES:\n');
      validation.errors.forEach(e => console.error(`  ${e}`));
      console.error(`\nEl quiz NO fue creado.\n`);
      process.exit(1);
    }

    if (validation.warnings.length > 0) {
      console.warn('\n⚠️ ADVERTENCIAS:\n');
      validation.warnings.forEach(w => console.warn(`  ${w}`));
    }

    // Guardar
    const outputPath = csvPath.replace(/\.csv$/, '.quiz.json');
    fs.writeFileSync(outputPath, JSON.stringify(quiz, null, 2), 'utf-8');

    console.log(`\n✅ Quiz validado!`);
    console.log(`📋 ${quiz.questions.length} preguntas`);
    console.log(`🎁 ${quiz.results.length} resultados`);
    console.log(`💾 Guardado: ${path.basename(outputPath)}\n`);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

main();
