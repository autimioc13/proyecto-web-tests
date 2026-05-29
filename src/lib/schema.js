// Reglas del esquema para validación de quizzes
const SCHEMA_RULES = {
  questions: { min: 4, max: 12 },
  options: { min: 2, max: 5 },
  results: { min: 1, max: 8 },
  title: { min: 10, max: 90 },
  description: { min: 10, max: 200 },
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, // kebab-case
  silo: ['personalidad', 'trivia', 'curiosidades', 'util'],
  type: ['personality', 'trivia', 'curiosity', 'useful'],
};

function validateQuiz(quiz) {
  const errors = [];
  const warnings = [];

  // Validar slug
  if (!quiz.slug) {
    errors.push('❌ Falta "slug"');
  } else if (!SCHEMA_RULES.slug.test(quiz.slug)) {
    errors.push(`❌ Slug inválido: "${quiz.slug}". Debe ser kebab-case (ej: mi-test)`);
  }

  // Validar silo
  if (!quiz.silo) {
    errors.push('❌ Falta "silo"');
  } else if (!SCHEMA_RULES.silo.includes(quiz.silo)) {
    errors.push(`❌ Silo inválido: "${quiz.silo}". Debe ser uno de: ${SCHEMA_RULES.silo.join(', ')}`);
  }

  // Validar type
  if (!quiz.type) {
    errors.push('❌ Falta "type"');
  } else if (!SCHEMA_RULES.type.includes(quiz.type)) {
    errors.push(`❌ Type inválido: "${quiz.type}". Debe ser uno de: ${SCHEMA_RULES.type.join(', ')}`);
  }

  // Validar título
  if (!quiz.title) {
    errors.push('❌ Falta "title"');
  } else if (quiz.title.length < SCHEMA_RULES.title.min || quiz.title.length > SCHEMA_RULES.title.max) {
    errors.push(`❌ Título debe tener 10-90 caracteres. Actual: ${quiz.title.length}`);
  }

  // Validar descripción
  if (!quiz.description) {
    errors.push('❌ Falta "description"');
  } else if (quiz.description.length < SCHEMA_RULES.description.min || quiz.description.length > SCHEMA_RULES.description.max) {
    errors.push(`❌ Descripción debe tener 10-200 caracteres. Actual: ${quiz.description.length}`);
  }

  // Validar preguntas
  if (!Array.isArray(quiz.questions)) {
    errors.push('❌ "questions" debe ser un array');
  } else if (quiz.questions.length < SCHEMA_RULES.questions.min || quiz.questions.length > SCHEMA_RULES.questions.max) {
    errors.push(`❌ Debe haber 4-12 preguntas. Actual: ${quiz.questions.length}`);
  } else {
    // Validar cada pregunta
    quiz.questions.forEach((q, idx) => {
      if (!q.question) {
        errors.push(`❌ Pregunta ${idx + 1}: falta "question"`);
      }
      if (!Array.isArray(q.options) || q.options.length === 0) {
        errors.push(`❌ Pregunta ${idx + 1}: falta "options" o está vacío`);
      } else if (q.options.length < SCHEMA_RULES.options.min || q.options.length > SCHEMA_RULES.options.max) {
        errors.push(`❌ Pregunta ${idx + 1}: debe tener 2-5 opciones. Actual: ${q.options.length}`);
      } else {
        // Validar opciones
        q.options.forEach((opt, optIdx) => {
          if (!opt.option) {
            errors.push(`❌ Pregunta ${idx + 1}, opción ${optIdx + 1}: falta "option"`);
          }
          // Para personality/useful, necesita values
          if ((quiz.type === 'personality' || quiz.type === 'useful') && !opt.values) {
            errors.push(`❌ Pregunta ${idx + 1}, opción ${optIdx + 1}: falta "values" (ej: "result1:3;result2:1")`);
          }
          // Para trivia, necesita ser la respuesta correcta
          if (quiz.type === 'trivia' && opt.correct === undefined) {
            errors.push(`❌ Pregunta ${idx + 1}, opción ${optIdx + 1}: falta "correct" (true/false)`);
          }
        });
      }
    });
  }

  // Validar resultados
  if (!Array.isArray(quiz.results)) {
    errors.push('❌ "results" debe ser un array');
  } else if (quiz.results.length < SCHEMA_RULES.results.min || quiz.results.length > SCHEMA_RULES.results.max) {
    errors.push(`❌ Debe haber 1-8 resultados. Actual: ${quiz.results.length}`);
  } else {
    quiz.results.forEach((r, idx) => {
      if (!r.id) {
        errors.push(`❌ Resultado ${idx + 1}: falta "id"`);
      }
      if (!r.title) {
        errors.push(`❌ Resultado ${idx + 1}: falta "title"`);
      }
      if (!r.description) {
        errors.push(`❌ Resultado ${idx + 1}: falta "description"`);
      }
      if (!r.emoji) {
        warnings.push(`⚠️ Resultado ${idx + 1}: falta "emoji"`);
      }
    });
  }

  // Validaciones específicas por tipo
  if (quiz.type === 'trivia') {
    const hasCorrect = quiz.questions?.every(q =>
      q.options?.some(o => o.correct === true)
    );
    if (!hasCorrect) {
      errors.push('❌ Trivia: cada pregunta debe tener exactamente una opción correcta');
    }
  }

  if (quiz.type === 'personality' || quiz.type === 'useful') {
    // Validar que los values apunten a resultados existentes
    const resultIds = new Set(quiz.results?.map(r => r.id) || []);
    quiz.questions?.forEach((q, qIdx) => {
      q.options?.forEach((opt, oIdx) => {
        if (opt.values) {
          const valueIds = opt.values.split(';').map(v => v.split(':')[0].trim());
          valueIds.forEach(vid => {
            if (!resultIds.has(vid)) {
              errors.push(`❌ Pregunta ${qIdx + 1}, opción ${oIdx + 1}: referencia a resultado inexistente "${vid}"`);
            }
          });
        }
      });
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function validateCatalog(quizzes) {
  const errors = [];
  const slugs = new Set();

  quizzes.forEach((quiz, idx) => {
    // Validar estructura individual
    const validation = validateQuiz(quiz);
    if (!validation.valid) {
      errors.push(`\n📋 Quiz ${idx + 1} (${quiz.slug || 'sin-slug'}):`);
      validation.errors.forEach(e => errors.push(`   ${e}`));
    }

    // Validar slugs duplicados
    if (quiz.slug) {
      if (slugs.has(quiz.slug)) {
        errors.push(`❌ Slug duplicado: "${quiz.slug}"`);
      }
      slugs.add(quiz.slug);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    total: quizzes.length,
  };
}

module.exports = {
  SCHEMA_RULES,
  validateQuiz,
  validateCatalog,
};
