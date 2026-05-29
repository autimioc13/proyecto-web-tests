# 📋 Guía: Crear Tests Masivamente con CSV

El pipeline permite crear y publicar nuevos tests SIN editar código. Todo se maneja desde CSV.

## 🎯 Flujo Completo

```
Tu Hoja de Cálculo (Excel/Sheets)
         ↓ Exportar como CSV
   tests/mi-lote.csv
         ↓ npm run csv
   tests/mi-lote.quiz.json (validado)
         ↓ npm run import
   data/quizzes-store.json (actualizado)
         ↓ npm run build
   🚀 Tests publicados
```

---

## 📝 Paso 1: Escribir el CSV

Usa `tests/ejemplo-simple.csv` como plantilla. El formato tiene 3 secciones:

### Sección 1: Metadatos

```csv
slug,silo,type,title,description,emoji,timeEstimate
mi-test,personalidad,personality,Mi Test,Descripción,🎭,5
```

- **slug**: Identificador único (kebab-case: `mi-primer-test`)
- **silo**: Categoría (`personalidad`, `trivia`, `curiosidades`, `util`)
- **type**: Tipo de scoring (`personality`, `trivia`, `curiosity`, `useful`)
- **title**: Título (10-90 caracteres)
- **description**: Descripción (10-200 caracteres)
- **emoji**: Icono del test
- **timeEstimate**: Minutos estimados

### Sección 2: Preguntas

Deja una fila vacía, luego:

```csv
q_text,opt_a,opt_a_val,opt_b,opt_b_val,opt_c,opt_c_val,opt_d,opt_d_val
Pregunta 1?,Opción A,resultado1:3;resultado2:1,Opción B,resultado1:0;resultado2:3,...
Pregunta 2?,Opción A,resultado1:2;resultado2:2,Opción B,resultado1:1;resultado2:2,...
```

Para **personality** y **useful**:
- `opt_X_val`: Formato `resultId:puntos;resultId2:puntos2`
- Puntos pueden ser 0-3 (recomendado)

Para **trivia**:
- Agrega columna `correct` con letra (`a`, `b`, `c`, `d`) de respuesta correcta

### Sección 3: Resultados

Deja una fila vacía, luego:

```csv
id,emoji,title,description,shareText
resultado1,💡,Mi Resultado,Descripción del resultado,Texto para compartir
resultado2,🎯,Otro Resultado,Descripción,Texto para compartir
```

- **id**: Identificador único (debe coincidir con los `opt_X_val`)
- **emoji**: Icono del resultado
- **title**: Nombre (ej: "El Innovador")
- **description**: Descripción del resultado
- **shareText**: Texto cuando comparten (ej: "Soy un Innovador 💡")

---

## ✅ Paso 2: Validar y Convertir

```bash
npm run csv tests/mi-test.csv
```

Salida:
```
📖 Leyendo mi-test.csv...
📊 Procesando...

🔍 Validando: "Mi Primer Test"

✅ Quiz validado!
📋 4 preguntas
🎁 3 resultados
💾 Guardado: mi-test.quiz.json
```

Si hay errores, muestra exactamente qué falta (ej: "Pregunta 3: solo tiene 1 opción, necesita 2-5").

---

## 📥 Paso 3: Importar al Sitio

```bash
npm run import tests/mi-test.quiz.json
```

Salida:
```
✅ Importación exitosa!
📊 Store actualizado: 15 quizzes totales

📈 Distribución por silo:
   personalidad: 8
   trivia: 4
   curiosidades: 2
   util: 1

💡 Distribución recomendada (por cada 100):
   personalidad: ~40 (actual: 8) ← Necesitas más
   trivia: ~25 (actual: 4)      ← Necesitas más
   ...
```

**Detecta duplicados automáticamente:**
```
⚠️ 1 quiz duplicado: "que-eres"
Usa --force para sobrescribir, o elimina los duplicados del CSV.
```

Para sobrescribir:
```bash
npm run import tests/mi-test.quiz.json --force
```

---

## 🔍 Paso 4: Validar Catálogo Completo

```bash
npm run validate
```

Verifica TODOS los tests (incluidos los existentes):
- ✅ Estructura correcta
- ✅ Slugs únicos
- ✅ Resultados referenciados existen
- ✅ Rango de preguntas/opciones válido

---

## 🚀 Paso 5: Publicar

```bash
npm run build
```

El validador corre automáticamente ANTES del build.
Si falla → build no se completa (protección contra tests malformados).

Los tests aparecen en:
- ✅ Página de inicio (feed)
- ✅ Página de su silo
- ✅ Recomendador
- ✅ Analytics admin
- ✅ Búsqueda

---

## 📊 Reglas del Esquema

| Elemento | Mín | Máx | Notas |
|----------|-----|-----|-------|
| Preguntas | 4 | 12 | Mínimo 4 para engagement |
| Opciones/pregunta | 2 | 5 | 4 es ideal |
| Resultados | 1 | 8 | 4-6 recomendado |
| Caracteres (título) | 10 | 90 | — |
| Caracteres (descripción) | 10 | 200 | — |
| Slug | — | — | kebab-case: `mi-test-123` |

---

## 🤖 Generar con IA (Fase Crecimiento)

Pídele a Claude:

> "Crea 5 tests de personalidad en formato CSV siguiendo la plantilla tests/ejemplo-simple.csv.
> Tema: Profesiones ideales
> - 6 preguntas cada uno
> - 4 resultados
> - Diferentes silos: 3 personalidad, 1 trivia, 1 curiosidades
> Solo dame el CSV, sin explicaciones."

Luego:
1. Copia/pega el CSV a un archivo
2. `npm run csv tests/ia-batch.csv`
3. `npm run import tests/ia-batch.quiz.json`
4. El validador es tu red de seguridad

---

## 🎯 Distribución Recomendada

Por cada 100 tests nuevos:

| Tipo | Cantidad | Razón |
|------|----------|-------|
| Personalidad | 40 | Alto virality, CPC premium |
| Trivia | 25 | SEO, repeat plays |
| Curiosidades | 20 | Evergreen content, shares |
| Útiles | 15 | CPM premium, engagement |

---

## ❌ Errores Comunes

### "Slug inválido"
```csv
slug,silo,...
Mi Test Nuevo,personalidad,...  ❌ Espacios y mayúsculas
```
✅ Solución: `mi-test-nuevo`

### "Falta 'values'"
Para personality/useful, SIEMPRE agregar:
```csv
opt_a_val,opt_b_val,...
resultado1:2;resultado2:1,resultado1:0;resultado2:3,...
```

### "Referencia a resultado inexistente"
Asegúrate que el `id` en la sección de resultados 
coincida exactamente con los que usas en `opt_X_val`:
```csv
opt_a_val: "innovador:2"   ← debe existir
id: innovador              ← ✅ Correcto
```

### "Solo tiene 1 opción"
Mínimo 2 opciones por pregunta:
```csv
Pregunta?,Opción 1,opt_1_val,Opción 2,opt_2_val
```

---

## 📈 Checklist Antes de Publicar

- [ ] CSV valida sin errores: `npm run csv tests/mi-lote.csv`
- [ ] Importa sin duplicados: `npm run import tests/mi-lote.quiz.json`
- [ ] Catálogo válido: `npm run validate`
- [ ] Build completo: `npm run build`
- [ ] Verificaste el layout en navegador (home, silo, quiz detail)

---

## 🔄 Workflow de Equipo

1. **Content Manager** crea CSV en Sheets/Excel
2. **Developer** (o cualquiera):
   - Descarga CSV
   - `npm run csv`
   - `npm run import`
   - `npm run build`
3. **Deploy**: La app detecta automáticamente los cambios

**No se necesita editar código en ningún paso.**

---

## 💡 Tips Avanzados

### Actualizar un test existente

```bash
# Hacer cambios al CSV
npm run csv tests/updated.csv
npm run import tests/updated.quiz.json --force  # ← force sobrescribe
npm run build
```

### Backup automático

Cada importación crea backup:
```
data/quizzes-store.backup.1684509123456.json
```

### Crear múltiples lotes

```bash
npm run csv tests/lote-1.csv
npm run csv tests/lote-2.csv
npm run csv tests/lote-3.csv

npm run import tests/lote-1.quiz.json
npm run import tests/lote-2.quiz.json
npm run import tests/lote-3.quiz.json

npm run build
```

---

¡Listo! Ahora cualquiera del equipo puede crear tests sin tocar código. 🚀
