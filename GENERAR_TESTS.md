# 🤖 Generar Tests Automáticamente con IA

En lugar de crear tests manualmente en Excel, **pídele a Claude que los genere** y se suban solos.

## ⚡ Comando Mágico

```bash
npm run generate "descripción de lo que quieres"
```

¡ESO ES! Claude genera → valida → importa → listo para publicar.

---

## 📚 Ejemplos

### Personalidad - Animales
```bash
npm run generate "5 tests de personalidad sobre qué animal eres, con emojis. Cada uno con diferentes animales"
```

**Resultado**: 5 quizzes listos en ~10 segundos

### Trivia - Historia
```bash
npm run generate "10 trivias sobre historia universal, dificultad media-alta, con 4 opciones cada una"
```

### Mix de Tipos
```bash
npm run generate "3 tests de personalidad sobre profesiones, 2 trivias sobre deportes, 2 curiosidades sobre animales"
```

### Tests Útiles
```bash
npm run generate "5 tests útiles: consejos de productividad, 4 preguntas cada uno, con recomendaciones prácticas"
```

### Tema Específico
```bash
npm run generate "8 tests de personalidad sobre películas: qué tipo de cineasta eres, qué género prefieres, etc."
```

### Lotes Masivos
```bash
npm run generate "50 tests variados: 20 personalidad, 15 trivia, 10 curiosidades, 5 útiles. Temas diversos"
```

---

## 🎯 Estructura Automática

El generador:
1. **Llama a Claude API** con tu descripción
2. **Genera CSV válido** (siguiendo el esquema exacto)
3. **Valida estructura** (preguntas, opciones, resultados)
4. **Importa al store** automáticamente
5. **Crea backups** para seguridad

Todo en menos de 1 minuto.

---

## 🔧 Configuración (Una Sola Vez)

### Paso 1: Obtener API Key

1. Ve a https://console.anthropic.com/
2. Crea una cuenta (gratis)
3. Ve a **API Keys**
4. Crea una nueva clave
5. Copia el valor `sk-ant-...`

### Paso 2: Guardar en .env

```bash
# Abre .env (o crea uno)
# Agrega esta línea:
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

✅ Listo. Solo haces esto UNA VEZ.

---

## 📊 Casos de Uso

### 📈 Escalar rápidamente
```bash
# Necesitas 100 tests para producción
npm run generate "100 tests variados: 40 personalidad, 25 trivia, 20 curiosidades, 15 útiles. Temas populares."

# Se generan todos automáticamente ✅
# Tardas 2-3 minutos en lugar de 2 semanas creando manualmente
```

### 🎨 Tema Específico
```bash
npm run generate "10 tests de personalidad sobre Harry Potter: qué casa de Hogwarts eres, qué hechizo, qué poción, etc."
```

### 🌍 Contenido Evergreen
```bash
npm run generate "30 trivias sobre capitalese del mundo, ciudades famosas, banderas. 4 opciones, dificultad variada"
```

### 💼 Vertical B2B
```bash
npm run generate "15 tests útiles para empresas: qué tipo de empleado eres, qué skill necesitas, cómo mejorar liderazgo. Con consejos prácticos."
```

---

## ⚙️ Tips Avanzados

### Generar + Publicar en Uno
```bash
npm run generate "10 tests de personalidad sobre viajes"
npm run build
```

Haces estos 2 comandos y en 2 minutos tus tests están en vivo.

### Generar Lotes
```bash
# Lote 1
npm run generate "20 tests de personalidad"

# Lote 2
npm run generate "15 trivias de ciencia"

# Lote 3
npm run generate "10 curiosidades"

# Publicar todo junto
npm run build
```

### Control de Calidad
Si algún test falla validación, el generador te lo dice:
```
❌ Validación fallida:
  ❌ Pregunta 5: solo tiene 1 opción, necesita 2-5

Intenta de nuevo con una descripción más clara.
```

Simplemente reintenta con más detalles.

---

## 📈 Distribución Recomendada

Para máximos ingresos por CPM:

```bash
npm run generate "100 tests variados:
- 40 personalidad (alto virality)
- 25 trivia (SEO + repeat plays)  
- 20 curiosidades (evergreen)
- 15 útiles (premium CPM)

Temas populares, trending, diversos."
```

---

## 💬 Prompts Efectivos

### ❌ Malo (Muy vago)
```bash
npm run generate "crea tests"
```

### ✅ Bueno (Específico)
```bash
npm run generate "10 tests de personalidad sobre qué tipo de persona eres según tu horóscono. Cada uno para un signo zodiacal diferente."
```

### ✅ Mejor (Muy detallado)
```bash
npm run generate "
12 tests de personalidad:
- 6 sobre profesiones ideales (con emojis de profesiones)
- 3 sobre qué tipo de amigo eres
- 2 sobre qué hobby debería ser el tuyo
- 1 sobre qué superpoder prefieres

Cada uno con 6 preguntas, 4 resultados, emojis divertidos.
Público: 18-35 años, tono desenfadado."
```

---

## 🚀 Flujo Completo en 3 Pasos

```bash
# Paso 1: Generar
npm run generate "50 tests de personalidad sobre marcas de ropa"

# Paso 2: Validar (opcional, el generate ya valida)
npm run validate

# Paso 3: Publicar
npm run build
```

**Tiempo total**: 3-4 minutos para 50 tests.

---

## 🔒 Seguridad & Costos

### Costos Claude API
- **Muy barato**: ~$0.003 por test generado
- 100 tests = ~$0.30
- 1000 tests = ~$3

### Alternativa Gratuita
Si no quieres pagar API:
```bash
# 1. Le pides a Claude directamente (en chat)
# "Genera 10 tests en formato CSV según ejemplo-simple.csv..."
# 2. Claude te da el CSV
# 3. Copias el CSV a tests/mi-lote.csv
# 4. npm run csv tests/mi-lote.csv
# 5. npm run import tests/mi-lote.quiz.json
```

Sin costo, pero más pasos manuales.

---

## 🐛 Troubleshooting

### "ANTHROPIC_API_KEY no está configurada"
```bash
# Verifica que .env tenga:
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Reinicia terminal después de agregar a .env
```

### "Validación fallida: Pregunta 3..."
Intenta con descripción más específica:
```bash
npm run generate "10 tests con 6 preguntas EXACTAS cada uno, 4 resultados, silo personalidad"
```

### "¿Cómo agrego más detalles al test?"
Sé más específico en el prompt:
```bash
# Malo
npm run generate "tests de viajes"

# Bueno
npm run generate "
15 tests de personalidad sobre viajes:
- Qué tipo de viajero eres (mochilero, lujo, familia, aventura)
- Qué destino prefieres (playa, montaña, ciudad, bosque)
- Cómo viajas (solo, con pareja, familia, amigos)
- Qué ritmo (relajado, acelerado)
Públic: 25-45 años, viajeros"
```

---

## 🎯 Caso Real: Tu Proyecto

### Escenario: Necesitas 200 tests

**Opción Manual (Vieja)**:
- 2 semanas creando en Excel
- Costo de tiempo: +40 horas

**Opción IA (Nueva)**:
```bash
# Día 1 - Mañana (5 minutos)
npm run generate "200 tests variados: 80 personalidad, 50 trivia, 40 curiosidades, 30 útiles. Temas populares y trending."

# Día 1 - Tarde (2 horas, opcional)
# Revisas manualmente algunos para QA
# Editas 10-20 que quieras mejorar manualmente

# Resultado: 180 tests listos en 1 día
# + 10-20 tests editados manualmente
# = 200 tests completos en 1-2 días
```

**Ahorro**: 38 horas de trabajo 🚀

---

## 📞 Soporte

Si necesitas help con prompts:
```bash
# Ejemplos de prompts efectivos están en este archivo

# O simplemente:
npm run generate "lo que necesito" 
# Si falla, ajusta la descripción
```

---

¡Ahora puedes crear 100+ tests en el tiempo que tardabas en crear 1 manualmente! 🤖✨
