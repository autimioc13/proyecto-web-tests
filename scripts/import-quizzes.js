#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const STORE_PATH = path.resolve(__dirname, '../data/quizzes-store.json');

function loadStore() {
  try {
    const content = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function saveStore(quizzes) {
  // Backup del original
  if (fs.existsSync(STORE_PATH)) {
    const backup = STORE_PATH.replace('.json', `.backup.${Date.now()}.json`);
    fs.copyFileSync(STORE_PATH, backup);
    console.log(`💾 Backup creado: ${path.basename(backup)}`);
  }

  fs.writeFileSync(STORE_PATH, JSON.stringify(quizzes, null, 2), 'utf-8');
}

function main() {
  const filePath = process.argv[2];
  const force = process.argv.includes('--force');

  if (!filePath) {
    console.error('❌ Uso: npm run import <archivo.quiz.json> [--force]');
    console.error('   Ejemplo: npm run import tests/mi-lote.quiz.json');
    console.error('   --force: sobrescribir duplicados sin preguntar');
    process.exit(1);
  }

  const quizPath = path.resolve(filePath);
  if (!fs.existsSync(quizPath)) {
    console.error(`❌ Archivo no encontrado: ${quizPath}`);
    process.exit(1);
  }

  try {
    console.log(`📖 Leyendo ${path.basename(quizPath)}...`);
    const newQuizzesContent = fs.readFileSync(quizPath, 'utf-8');
    const newQuizzes = Array.isArray(JSON.parse(newQuizzesContent))
      ? JSON.parse(newQuizzesContent)
      : [JSON.parse(newQuizzesContent)];

    console.log(`📖 Leyendo store actual...`);
    const store = loadStore();

    // Detectar duplicados
    const storeSlugSet = new Set(store.map(q => q.slug));
    const duplicates = newQuizzes.filter(q => storeSlugSet.has(q.slug));

    if (duplicates.length > 0 && !force) {
      console.warn(`\n⚠️ ${duplicates.length} quizzes duplicados detectados:`);
      duplicates.forEach(q => console.warn(`   - ${q.slug}`));
      console.log('\nUsa --force para sobrescribir, o elimina los duplicados del CSV.\n');
      process.exit(1);
    }

    if (duplicates.length > 0 && force) {
      console.log(`\n⚠️ --force: sobrescribiendo ${duplicates.length} duplicados`);
      newQuizzes.forEach(newQ => {
        const idx = store.findIndex(q => q.slug === newQ.slug);
        if (idx >= 0) {
          store[idx] = newQ;
        }
      });
    } else {
      store.push(...newQuizzes);
    }

    // Estadísticas
    const stats = {};
    store.forEach(q => {
      stats[q.silo] = (stats[q.silo] || 0) + 1;
    });

    console.log(`\n✅ Importación exitosa!`);
    console.log(`📊 Store actualizado: ${store.length} quizzes totales\n`);
    console.log('📈 Distribución por silo:');
    Object.entries(stats).forEach(([silo, count]) => {
      console.log(`   ${silo}: ${count}`);
    });

    // Advertencia sobre distribución recomendada
    const total = store.length;
    const recommended = {
      personalidad: Math.floor(total * 0.4),
      trivia: Math.floor(total * 0.25),
      curiosidades: Math.floor(total * 0.2),
      util: Math.floor(total * 0.15),
    };

    console.log('\n💡 Distribución recomendada (por cada 100 tests):');
    console.log(`   personalidad: ~40 (actual: ${stats.personalidad || 0})`);
    console.log(`   trivia: ~25 (actual: ${stats.trivia || 0})`);
    console.log(`   curiosidades: ~20 (actual: ${stats.curiosidades || 0})`);
    console.log(`   util: ~15 (actual: ${stats.util || 0})\n`);

    saveStore(store);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

main();
