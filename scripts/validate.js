#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { validateCatalog } = require('../src/lib/schema');

const STORE_PATH = path.resolve(__dirname, '../data/quizzes-store.json');

function main() {
  try {
    console.log('🔍 Validando catálogo completo...\n');

    if (!fs.existsSync(STORE_PATH)) {
      console.log('ℹ️ Store vacío (primeros quizzes)\n');
      process.exit(0);
    }

    const content = fs.readFileSync(STORE_PATH, 'utf-8');
    const quizzes = JSON.parse(content);

    const validation = validateCatalog(quizzes);

    if (!validation.valid) {
      console.error('❌ ERRORES ENCONTRADOS:\n');
      validation.errors.forEach(e => console.error(`${e}`));
      console.error(`\n${validation.total} quizzes, con errores\n`);
      process.exit(1);
    }

    const stats = {};
    quizzes.forEach(q => {
      stats[q.silo] = (stats[q.silo] || 0) + 1;
    });

    console.log(`✅ Catálogo válido!\n`);
    console.log(`📊 ${validation.total} quizzes`);
    console.log('   Distribución por silo:');
    Object.entries(stats).forEach(([silo, count]) => {
      console.log(`   - ${silo}: ${count}`);
    });

    console.log('\n✓ Listo para publicar\n');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

main();
