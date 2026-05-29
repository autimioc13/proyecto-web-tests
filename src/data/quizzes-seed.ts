import { Quiz } from '@/types';

export const QUIZZES_SEED: Quiz[] = [
  // PERSONALIDAD
  {
    slug: 'que-animal-eres',
    silo: 'personalidad',
    type: 'personality',
    title: '¿Qué animal eres?',
    description: 'Descubre tu animal espiritual según tu personalidad',
    timeMinutes: 3,
    emoji: '🦁',
    tags: ['personalidad', 'diversión', 'viral'],
    questions: [
      {
        id: 'q1',
        text: '¿Cómo es tu energía generalmente?',
        options: [
          { id: 'o1', text: 'Tranquila y reflexiva', values: { leon: 0, oso: 3, gato: 2, aguila: 1 } },
          { id: 'o2', text: 'Activa y aventurera', values: { leon: 3, oso: 1, gato: 1, aguila: 3 } },
          { id: 'o3', text: 'Independiente y misteriosa', values: { leon: 1, oso: 1, gato: 3, aguila: 2 } },
          { id: 'o4', text: 'Líder y dominante', values: { leon: 3, oso: 2, gato: 0, aguila: 2 } },
        ],
      },
      {
        id: 'q2',
        text: 'En un grupo social, eres el/la que:',
        options: [
          { id: 'o1', text: 'Dirige y toma decisiones', values: { leon: 3, oso: 1, gato: 0, aguila: 2 } },
          { id: 'o2', text: 'Observa desde lejos', values: { leon: 0, oso: 1, gato: 3, aguila: 2 } },
          { id: 'o3', text: 'Está donde sea la acción', values: { leon: 2, oso: 0, gato: 1, aguila: 3 } },
          { id: 'o4', text: 'Busca paz y estabilidad', values: { leon: 1, oso: 3, gato: 1, aguila: 0 } },
        ],
      },
      {
        id: 'q3',
        text: '¿Cuál es tu mayor fortaleza?',
        options: [
          { id: 'o1', text: 'Liderazgo y carisma', values: { leon: 3, oso: 0, gato: 0, aguila: 1 } },
          { id: 'o2', text: 'Astucia e inteligencia', values: { leon: 0, oso: 1, gato: 3, aguila: 3 } },
          { id: 'o3', text: 'Resistencia y fuerza', values: { leon: 1, oso: 3, gato: 0, aguila: 0 } },
          { id: 'o4', text: 'Visión y estrategia', values: { leon: 1, oso: 1, gato: 1, aguila: 3 } },
        ],
      },
    ],
    results: [
      {
        id: 'leon',
        emoji: '🦁',
        title: 'Eres un León',
        description:
          'Eres un líder nato con carisma y confianza. Dominas cualquier espacio en el que entras y tu presencia es magnética. Tu coraje te impulsa a tomar riesgos calculados.',
        shareText: 'Acabo de descubrir que soy un 🦁 ¿Tú qué animal eres?',
      },
      {
        id: 'oso',
        emoji: '🐻',
        title: 'Eres un Oso',
        description:
          'Eres fuerte, confiable y proteges a los que amas. Buscas la estabilidad y la paz, pero cuando es necesario, eres imparable. Tu sabiduría es tu mayor activo.',
        shareText: 'Resulté ser un 🐻 en el test de personalidad. ¿Qué tal tú?',
      },
      {
        id: 'gato',
        emoji: '🐱',
        title: 'Eres un Gato',
        description:
          'Eres independiente, inteligente y misterioso. Te encanta actuar a tu propio ritmo y valoras tu libertad. Tu astucia te permite navegar cualquier situación.',
        shareText: 'El test me dio 🐱... ¿Cuál es tu animal?',
      },
      {
        id: 'aguila',
        emoji: '🦅',
        title: 'Eres un Águila',
        description:
          'Tienes una visión clara del futuro y eres estratégico en tus decisiones. Tu capacidad para ver el panorama general te hace excepcional. Persigues tus objetivos con determinación.',
        shareText: 'Me salió 🦅 en el personality test. ¿Y tú?',
      },
    ],
  },
  {
    slug: 'que-profesion-deberias-tener',
    silo: 'personalidad',
    type: 'personality',
    title: '¿Qué profesión deberías tener?',
    description: 'Tu verdadera vocación basada en tus habilidades',
    timeMinutes: 4,
    emoji: '💼',
    tags: ['carrera', 'vocación', 'futuro'],
    questions: [
      {
        id: 'q1',
        text: '¿Qué tipo de ambiente laboral prefieres?',
        options: [
          { id: 'o1', text: 'Creativo y flexible', values: { artista: 3, cientif: 0, emprendedor: 3, doctor: 0 } },
          { id: 'o2', text: 'Estructurado y metódico', values: { artista: 0, cientif: 3, emprendedor: 0, doctor: 2 } },
          { id: 'o3', text: 'Dinámico y desafiante', values: { artista: 1, cientif: 1, emprendedor: 3, doctor: 0 } },
          { id: 'o4', text: 'Que ayude a otros', values: { artista: 0, cientif: 1, emprendedor: 1, doctor: 3 } },
        ],
      },
      {
        id: 'q2',
        text: '¿Cuál es tu principal motivación?',
        options: [
          { id: 'o1', text: 'Expresar mi creatividad', values: { artista: 3, cientif: 0, emprendedor: 1, doctor: 0 } },
          { id: 'o2', text: 'Entender cómo funcionan las cosas', values: { artista: 0, cientif: 3, emprendedor: 1, doctor: 1 } },
          { id: 'o3', text: 'Crear mi propio imperio', values: { artista: 1, cientif: 0, emprendedor: 3, doctor: 0 } },
          { id: 'o4', text: 'Salvar vidas', values: { artista: 0, cientif: 1, emprendedor: 0, doctor: 3 } },
        ],
      },
      {
        id: 'q3',
        text: '¿Cómo eres con los detalles?',
        options: [
          { id: 'o1', text: 'Me pierdo en la visión general', values: { artista: 3, cientif: 0, emprendedor: 2, doctor: 0 } },
          { id: 'o2', text: 'Obsesionado con cada detalle', values: { artista: 0, cientif: 3, emprendedor: 0, doctor: 2 } },
          { id: 'o3', text: 'Balance entre visión y detalles', values: { artista: 1, cientif: 1, emprendedor: 3, doctor: 1 } },
          { id: 'o4', text: 'Preciso pero flexible', values: { artista: 1, cientif: 2, emprendedor: 0, doctor: 3 } },
        ],
      },
    ],
    results: [
      {
        id: 'artista',
        emoji: '🎨',
        title: 'Profesión: Artista/Creativo',
        description:
          'Tu verdadera vocación es expresar tu creatividad. Considera ser diseñador, músico, escritor o cualquier rama donde fluya tu imaginación sin límites.',
        shareText: 'Me salió artista en el test de vocación 🎨',
      },
      {
        id: 'cientif',
        emoji: '🔬',
        title: 'Profesión: Científico/Investigador',
        description:
          'Tu mente analítica te hace perfecto para la ciencia. Podrías ser investigador, ingeniero, matemático o cualquier campo donde lo importante sea descubrir la verdad.',
        shareText: 'Soy un científico según el test 🔬',
      },
      {
        id: 'emprendedor',
        emoji: '💡',
        title: 'Profesión: Emprendedor',
        description:
          'Tienes todo lo necesario para crear tu propio negocio. Tu visión, ambición y adaptabilidad son tus mayores fortalezas en el mundo empresarial.',
        shareText: 'El test me dice que debo ser emprendedor 💡',
      },
      {
        id: 'doctor',
        emoji: '⚕️',
        title: 'Profesión: Médico/Profesional de Salud',
        description:
          'Tu empatía y dedicación a ayudar a otros te hacen ideal para la medicina o cualquier campo sanitario. Tu vocación es salvar vidas.',
        shareText: 'Resulté ser doctor en el test de vocación ⚕️',
      },
    ],
  },

  // TRIVIA
  {
    slug: 'trivia-geografia-mundial',
    silo: 'trivia',
    type: 'trivia',
    title: 'Trivia: Geografía Mundial',
    description: 'Pon a prueba tus conocimientos geográficos',
    timeMinutes: 5,
    emoji: '🌍',
    tags: ['geografía', 'educación', 'trivia'],
    questions: [
      {
        id: 'q1',
        text: '¿Cuál es la capital de Perú?',
        options: [
          { id: 'o1', text: 'Lima' },
          { id: 'o2', text: 'Cusco' },
          { id: 'o3', text: 'Arequipa' },
          { id: 'o4', text: 'Iquitos' },
        ],
        correct: 'o1',
      },
      {
        id: 'q2',
        text: '¿Cuál es el río más largo de América del Sur?',
        options: [
          { id: 'o1', text: 'Río Paraná' },
          { id: 'o2', text: 'Río Amazonas' },
          { id: 'o3', text: 'Río Orinoco' },
          { id: 'o4', text: 'Río Salado' },
        ],
        correct: 'o2',
      },
      {
        id: 'q3',
        text: '¿Cuántos países hay en Europa?',
        options: [
          { id: 'o1', text: '40' },
          { id: 'o2', text: '44' },
          { id: 'o3', text: '50' },
          { id: 'o4', text: '35' },
        ],
        correct: 'o2',
      },
    ],
    results: [
      { minScore: 80, emoji: '⭐', title: 'Experto Geográfico', description: 'Eres un verdadero experto en geografía. ¡Felicidades!', shareText: 'Saqué experto en trivia de geografía 🌍⭐' },
      { minScore: 50, emoji: '📚', title: 'Buen Conocimiento', description: 'Tienes un buen dominio de la geografía mundial.', shareText: 'Mi resultado en trivia de geografía 🌍' },
      { emoji: '📖', title: 'Novato', description: 'Hay mucho por aprender sobre geografía. ¡Sigue intentando!', shareText: 'Necesito estudiar más geografía 📖' },
    ],
  },
  {
    slug: 'trivia-historia-antigua',
    silo: 'trivia',
    type: 'trivia',
    title: 'Trivia: Historia Antigua',
    description: 'Desafío tu conocimiento de las antiguas civilizaciones',
    timeMinutes: 4,
    emoji: '🏛️',
    tags: ['historia', 'antigüedad', 'educación'],
    questions: [
      {
        id: 'q1',
        text: '¿En qué año cayó el Imperio Romano Occidental?',
        options: [
          { id: 'o1', text: '410' },
          { id: 'o2', text: '476' },
          { id: 'o3', text: '500' },
          { id: 'o4', text: '550' },
        ],
        correct: 'o2',
      },
      {
        id: 'q2',
        text: '¿Quién fue el primer emperador de Egipto?',
        options: [
          { id: 'o1', text: 'Keops' },
          { id: 'o2', text: 'Tutankamón' },
          { id: 'o3', text: 'Ramsés II' },
          { id: 'o4', text: 'Cleopatra' },
        ],
        correct: 'o1',
      },
      {
        id: 'q3',
        text: '¿Cuál era la capital del Imperio Persa?',
        options: [
          { id: 'o1', text: 'Babilonia' },
          { id: 'o2', text: 'Persépolis' },
          { id: 'o3', text: 'Susa' },
          { id: 'o4', text: 'Ecbátana' },
        ],
        correct: 'o2',
      },
    ],
    results: [
      { minScore: 80, emoji: '📜', title: 'Historiador Magistral', description: 'Dominas la historia antigua como pocos. Impresionante.', shareText: 'Soy historiador magistral en trivia de historia antigua 📜' },
      { minScore: 50, emoji: '🎓', title: 'Estudiante Dedicado', description: 'Tienes buenos conocimientos de historia antigua.', shareText: 'Mi resultado en trivia de historia 🎓' },
      { emoji: '📚', title: 'Aprendiz', description: 'La historia antigua es fascinante. ¡Investiga más!', shareText: 'Debo aprender más de historia antigua 📚' },
    ],
  },

  // CURIOSIDADES
  {
    slug: 'sabias-que-animales',
    silo: 'curiosidades',
    type: 'curiosity',
    title: '¿Sabías que...? Animales Sorprendentes',
    description: 'Descubre hechos asombrosos sobre el reino animal',
    timeMinutes: 3,
    emoji: '🦎',
    tags: ['animales', 'naturaleza', 'curiosidades'],
    questions: [
      {
        id: 'q1',
        text: '¿Cuál es el animal terrestre más rápido del mundo?',
        options: [
          { id: 'o1', text: 'Guepardo', values: { leopardo: 0, guepardo: 5 } },
          { id: 'o2', text: 'Antílope', values: { leopardo: 2, guepardo: 0 } },
        ],
      },
      {
        id: 'q2',
        text: '¿Los camarones ven en...',
        options: [
          { id: 'o1', text: 'Blanco y negro', values: { tipo1: 1, tipo2: 0 } },
          { id: 'o2', text: '16 colores (humanos vemos 3)', values: { tipo1: 0, tipo2: 5 } },
        ],
      },
      {
        id: 'q3',
        text: '¿Cuántos corazones tiene un pulpo?',
        options: [
          { id: 'o1', text: 'Uno como el nuestro', values: { hecho1: 1, hecho2: 0 } },
          { id: 'o2', text: 'Tres', values: { hecho1: 0, hecho2: 5 } },
        ],
      },
    ],
    results: [
      { emoji: '🤯', title: 'Dato Increíble', description: 'La naturaleza está llena de sorpresas que desafían nuestra comprensión del mundo.', shareText: 'Descubrí datos alucinantes sobre animales 🤯' },
    ],
  },
  {
    slug: 'sabias-que-espacio',
    silo: 'curiosidades',
    type: 'curiosity',
    title: '¿Sabías que...? El Espacio es Loco',
    description: 'Hechos del universo que te harán replantearte todo',
    timeMinutes: 3,
    emoji: '🌌',
    tags: ['espacio', 'universo', 'ciencia'],
    questions: [
      {
        id: 'q1',
        text: '¿Cuál es la temperatura en el espacio?',
        options: [
          { id: 'o1', text: 'Alrededor de 0°C', values: { fact1: 1, fact2: 0 } },
          { id: 'o2', text: 'Cerca de -270°C', values: { fact1: 0, fact2: 5 } },
        ],
      },
      {
        id: 'q2',
        text: '¿Hay sonido en el espacio?',
        options: [
          { id: 'o1', text: 'Sí, pero muy débil', values: { tipo1: 1, tipo2: 0 } },
          { id: 'o2', text: 'No, el vacío no transmite sonido', values: { tipo1: 0, tipo2: 5 } },
        ],
      },
      {
        id: 'q3',
        text: '¿Qué pasaría sin traje si te lanzas al espacio?',
        options: [
          { id: 'o1', text: 'Congelarías instantáneamente', values: { eso: 1, otro: 0 } },
          { id: 'o2', text: 'Tu sangre herviría por la falta de presión', values: { eso: 0, otro: 5 } },
        ],
      },
    ],
    results: [
      { emoji: '🚀', title: 'Explorador del Universo', description: 'El cosmos es una fuente infinita de misterios y asombro.', shareText: 'El espacio es más alucinante de lo que pensaba 🚀' },
    ],
  },

  // ÚTILES
  {
    slug: 'perfil-financiero',
    silo: 'util',
    type: 'useful',
    title: 'Test: ¿Cuál es tu Perfil Financiero?',
    description: 'Descubre tu relación con el dinero y obtén recomendaciones',
    timeMinutes: 6,
    emoji: '💰',
    tags: ['finanzas', 'dinero', 'educación-financiera'],
    questions: [
      {
        id: 'q1',
        text: '¿Cómo ves tu relación con el dinero?',
        options: [
          { id: 'o1', text: 'Lo gasto tan pronto lo tengo', values: { gastador: 3, ahorrador: 0, inversor: 0, deudor: 1 } },
          { id: 'o2', text: 'Lo ahorro para el futuro', values: { gastador: 0, ahorrador: 3, inversor: 1, deudor: 0 } },
          { id: 'o3', text: 'Lo invierto para generar más', values: { gastador: 0, ahorrador: 1, inversor: 3, deudor: 0 } },
          { id: 'o4', text: 'Vivo en deudas', values: { gastador: 1, ahorrador: 0, inversor: 0, deudor: 3 } },
        ],
      },
      {
        id: 'q2',
        text: '¿Tienes un presupuesto mensual?',
        options: [
          { id: 'o1', text: 'No, gasto según mi antojo', values: { gastador: 2, ahorrador: 0, inversor: 0, deudor: 1 } },
          { id: 'o2', text: 'Sí, y lo sigo al pie de la letra', values: { gastador: 0, ahorrador: 3, inversor: 1, deudor: 0 } },
          { id: 'o3', text: 'Tengo uno flexible para invertir', values: { gastador: 0, ahorrador: 1, inversor: 3, deudor: 0 } },
          { id: 'o4', text: 'No logro controlar mis gastos', values: { gastador: 1, ahorrador: 0, inversor: 0, deudor: 3 } },
        ],
      },
      {
        id: 'q3',
        text: '¿Qué harías con $10,000 inesperados?',
        options: [
          { id: 'o1', text: 'Gasto en cosas que quiero', values: { gastador: 3, ahorrador: 0, inversor: 0, deudor: 1 } },
          { id: 'o2', text: 'Los ahorro para emergencias', values: { gastador: 0, ahorrador: 3, inversor: 1, deudor: 0 } },
          { id: 'o3', text: 'Los invierto en algo rentable', values: { gastador: 0, ahorrador: 1, inversor: 3, deudor: 0 } },
          { id: 'o4', text: 'Los uso para pagar deudas', values: { gastador: 0, ahorrador: 0, inversor: 0, deudor: 3 } },
        ],
      },
    ],
    results: [
      {
        id: 'gastador',
        emoji: '💸',
        title: 'Eres un Gastador',
        description:
          'Disfrutas la vida al máximo pero necesitas aprender a controlar tus gastos. La clave está en encontrar el balance entre disfrutar hoy y asegurar tu futuro.',
        shareText: 'Resulté ser un gastador en el test financiero 💸',
        offer: {
          type: 'own_product',
          url: '/productos/del-gastador-al-inversor',
          copy: '📚 Curso: De Gastador a Inversor (30% OFF)',
        },
      },
      {
        id: 'ahorrador',
        emoji: '🏦',
        title: 'Eres un Ahorrador',
        description:
          'Tienes disciplina financiera y sabidurís para construir un futuro estable. Tu siguiente paso es aprender a invertir para multiplicar tu riqueza.',
        shareText: 'Soy un ahorrador según el test financiero 🏦',
        offer: {
          type: 'own_product',
          url: '/productos/curso-inversion-basica',
          copy: '📊 Masterclass: Inversión para Ahoradores',
        },
      },
      {
        id: 'inversor',
        emoji: '📈',
        title: 'Eres un Inversor',
        description:
          'Tienes mentalidad emprendedora y buscas multiplicar tu dinero. Tu visión financiera es avanzada; ahora es momento de escalarla con estrategias profesionales.',
        shareText: 'Me identifiqué como inversor en el test financiero 📈',
        offer: {
          type: 'own_product',
          url: '/productos/inversion-avanzada',
          copy: '🚀 Programa Pro: Inversión Avanzada',
        },
      },
      {
        id: 'deudor',
        emoji: '⚠️',
        title: 'Eres un Deudor Crónico',
        description:
          'El endeudamiento te consume. Es hora de tomar acción: crear un plan de salida, entender por qué gastas más de lo que ganas, y reconstruir tu relación con el dinero.',
        shareText: 'Necesito ayuda con mis finanzas según el test 💪',
        offer: {
          type: 'own_product',
          url: '/productos/escape-deudas',
          copy: '🆘 Guía: Escape de Deudas (Gratis + Coaching)',
        },
      },
    ],
  },
  {
    slug: 'eres-saludable',
    silo: 'util',
    type: 'useful',
    title: 'Test: ¿Qué tan saludable eres?',
    description: 'Evalúa tu estado de salud y bienestar general',
    timeMinutes: 5,
    emoji: '💪',
    tags: ['salud', 'bienestar', 'estilo-de-vida'],
    questions: [
      {
        id: 'q1',
        text: '¿Cuánto ejercicio haces a la semana?',
        options: [
          { id: 'o1', text: 'Ninguno', values: { sedentario: 3, moderado: 0, atletico: 0, profesional: 0 } },
          { id: 'o2', text: '1-2 días', values: { sedentario: 1, moderado: 2, atletico: 0, profesional: 0 } },
          { id: 'o3', text: '3-5 días', values: { sedentario: 0, moderado: 0, atletico: 3, profesional: 1 } },
          { id: 'o4', text: '6+ días (entrenamiento intenso)', values: { sedentario: 0, moderado: 0, atletico: 1, profesional: 3 } },
        ],
      },
      {
        id: 'q2',
        text: '¿Cómo es tu dieta?',
        options: [
          { id: 'o1', text: 'Mucha comida ultra-procesada', values: { sedentario: 2, moderado: 0, atletico: 0, profesional: 0 } },
          { id: 'o2', text: 'Mezcla de saludable e insana', values: { sedentario: 1, moderado: 2, atletico: 1, profesional: 0 } },
          { id: 'o3', text: 'Principalmente natural', values: { sedentario: 0, moderado: 1, atletico: 2, profesional: 1 } },
          { id: 'o4', text: 'Estrictamente controlada/profesional', values: { sedentario: 0, moderado: 0, atletico: 1, profesional: 3 } },
        ],
      },
      {
        id: 'q3',
        text: '¿Duermes bien?',
        options: [
          { id: 'o1', text: 'Mal, menos de 6 horas', values: { sedentario: 2, moderado: 0, atletico: 0, profesional: 0 } },
          { id: 'o2', text: 'Más o menos, 6-7 horas', values: { sedentario: 1, moderado: 2, atletico: 1, profesional: 0 } },
          { id: 'o3', text: 'Bien, 7-8 horas', values: { sedentario: 0, moderado: 1, atletico: 2, profesional: 1 } },
          { id: 'o4', text: 'Excelente, 8+ horas restauradoras', values: { sedentario: 0, moderado: 0, atletico: 0, profesional: 3 } },
        ],
      },
    ],
    results: [
      {
        id: 'sedentario',
        emoji: '😴',
        title: 'Perfil: Sedentario',
        description:
          'Tu estilo de vida actual aumenta riesgos de salud. Empieza pequeño: una caminata de 20 minutos diaria. Cada paso cuenta.',
        shareText: 'Necesito cambiar mi estilo de vida 💪',
        offer: { type: 'own_product', url: '/productos/inicio-fitness', copy: '🏃 Plan Detox: 30 Días para Cambiar' },
      },
      {
        id: 'moderado',
        emoji: '👍',
        title: 'Perfil: Moderado',
        description:
          'Estás en el camino correcto. Incrementa tu actividad a 4-5 días por semana para ver cambios reales en tu energía y cuerpo.',
        shareText: 'Tengo un estilo de vida moderado, pero quiero mejorar 🎯',
        offer: { type: 'own_product', url: '/productos/fitness-intermedio', copy: '💪 Programa: Nivel Intermedio' },
      },
      {
        id: 'atletico',
        emoji: '🏃',
        title: 'Perfil: Atlético',
        description:
          'Eres consistente y tu salud te lo agradece. Ahora optimiza: considera un coach para llevarte al siguiente nivel.',
        shareText: 'Mantengo un estilo de vida atlético 🏃‍♂️',
        offer: { type: 'affiliate', url: 'https://coachng.ejemplo.com/premium', copy: 'Coach Premium: Optimiza tu Rendimiento' },
      },
      {
        id: 'profesional',
        emoji: '🥇',
        title: 'Perfil: Profesional',
        description:
          'Tu dedicación a la salud es excepcional. Eres un referente. ¿Has considerado ser entrenador o nutricionista?',
        shareText: 'Tengo un nivel de salud profesional 🥇',
        offer: { type: 'own_product', url: '/productos/certificacion-coach', copy: '🎓 Certificación: Become a Health Coach' },
      },
    ],
  },
];
