# 🔐 Admin Panel Completo - Documentación

Tu admin panel tiene TODO integrado: Analytics + Generador de Tests IA.

---

## 🎯 Resumen Rápido

| Función | URL | Descripción |
|---------|-----|-------------|
| **Login** | `/admin/login` | Acceso protegido con contraseña |
| **Analytics** | `/admin/analytics` | Dashboard con KPIs y métricas |
| **Generador IA** | `/admin/generate` | Crear tests con Claude IA |

---

## 🔒 Seguridad: Solo Tu Equipo

### ¿Cómo funciona?

```
Usuario entra a /admin/login
        ↓
Ingresa contraseña (ADMIN_PASSWORD de .env)
        ↓
Se crea sesión por 24 horas
        ↓
Acceso a /admin/analytics y /admin/generate
        ↓
Cookie segura (httpOnly, sameSite=strict)
        ↓
Luego de 24h, vuelve a pedir contraseña
```

### Configurar la Contraseña

**Opción 1: Via .env**
```bash
ADMIN_PASSWORD=mi-contraseña-super-secreta-123
```

**Opción 2: Via ambiente (Vercel, Netlify)**
```
Agregar variable de entorno: ADMIN_PASSWORD=...
```

⚠️ **Importante**: Cambia `changeme` a algo fuerte!

---

## 📊 Dashboard Analítico (`/admin/analytics`)

### Qué ves:

1. **KPIs Globales**
   - Ingresos estimados en USD
   - Total de inicios de tests
   - Tasa promedio de completación

2. **Diagnóstico Automático**
   - Recomendaciones para mejorar RPM
   - Tests con baja completación
   - Oportunidades de optimización

3. **Ranking por RPM**
   - Tabla completa de todos los tests
   - Ordenado por Revenue Per Mille (RPM)
   - Distribuido por silo

4. **Detalles por Test**
   - Tarjetas individuales
   - Métrica: inicios, completaciones, compartidas, RPM

### Desde aquí:
- ✅ Monitorea monetización
- ✅ Identifica tests underperforming
- ✅ **Un botón rápido al Generador IA** → `[✨ Generar Tests IA]`

---

## 🤖 Generador de Tests IA (`/admin/generate`)

### Flujo Visual

```
┌─────────────────────────────────────┐
│      GENERADOR DE TESTS CON IA       │
└─────────────────────────────────────┘

1️⃣ ESCRIBIR
   ┌──────────────────────────────────┐
   │ Describe los tests que deseas...│
   │                                  │
   │ "20 tests de personalidad...    │
   │  sobre animales"                 │
   └──────────────────────────────────┘

2️⃣ GENERAR
   ┌──────────────────────┐
   │ [✨ Generar Tests]   │ ← Llama a Claude API
   └──────────────────────┘

3️⃣ PREVIEW
   ✅ 20 tests generados
   📋 6 preguntas cada uno
   🎁 4 resultados
   
   🟢 20 válidos
   🔴 0 con errores

4️⃣ IMPORTAR
   ┌────────────────────────────┐
   │ [📥 Importar al Store]     │ ← Guarda en BD
   └────────────────────────────┘

5️⃣ PUBLICAR
   npm run build ← Desde tu terminal
```

### Panel de Control

- **Descripción**: Textarea para escribir qué quieres
- **Generar**: Botón que llama a Claude
- **Preview**: Muestra CSV en tiempo real
- **Estadísticas**: Cantidad y validez de tests
- **Descargar CSV**: Por si quieres editarlo manualmente
- **Importar**: Uno-click para guardar al store
- **Ver CSV**: Expande para ver el código generado

---

## 🎯 Flujo Completo: De Cero a Publicado

### Escenario: Necesitas 50 tests

**Paso 1: Acceder (2 segundos)**
```
1. Ve a https://tuapp.com/admin/login
2. Ingresa contraseña
3. ¡Adentro!
```

**Paso 2: Generar (10 segundos)**
```
1. Click en [Generar Tests IA]
2. Escribes: "50 tests de personalidad sobre viajes"
3. Click [✨ Generar Tests]
4. Claude IA genera en ~10 segundos
```

**Paso 3: Revisar (30 segundos)**
```
1. Ves preview con cada test
2. Verifica: ✅ 50 tests válidos, 0 errores
3. Expande CSV para ver detalles si quieres
```

**Paso 4: Importar (2 segundos)**
```
1. Click [📥 Importar al Store]
2. ✅ 50 tests en tu base de datos
3. Mensaje: "50 tests importados correctamente"
```

**Paso 5: Publicar (60 segundos)**
```
1. Abre terminal en tu PC
2. npm run build
3. ✅ Build completa en ~1 minuto
4. Tests en vivo en tu sitio
```

**⏱️ Tiempo total: ~2 MINUTOS para 50 tests**

---

## 🔐 Arquitectura de Seguridad

### Capas de Protección

```
1️⃣ AUTENTICACIÓN
   ├─ Contraseña (ADMIN_PASSWORD)
   ├─ Sesión con cookie segura
   └─ Timeout de 24 horas

2️⃣ AUTORIZACIÓN
   ├─ Solo /admin/analytics si validaSession
   ├─ Solo /admin/generate si validaSession
   └─ API endpoints verifican sesión

3️⃣ VALIDACIÓN
   ├─ Claude genera CSV
   ├─ Schema validator verifica estructura
   ├─ Detecta preguntas, opciones, resultados
   └─ RECHAZA tests malformados

4️⃣ SEGURIDAD DE DATOS
   ├─ Backup automático de store
   ├─ Validación en servidor (no confiar en cliente)
   ├─ Cookies httpOnly (no accesibles via JS)
   └─ HTTPS en producción (recomendado)
```

### Dónde se almacenan las sesiones

- **Cliente**: Cookie segura `admin_session`
- **Formato**: `token:expiresAt` (24 horas)
- **Validación**: En cada endpoint `/api/*`
- **Logout**: Cookie expira automáticamente (o borra manualmente)

---

## 💻 Casos de Uso

### 1️⃣ Crear tests rápidamente

```bash
# Tu flujo actual (sin generador)
1. Abrir Excel
2. Escribir 20 tests manualmente
3. Exportar CSV
4. npm run csv ...
5. npm run import ...
6. npm run build
⏱️ 30-60 minutos

# Tu flujo NUEVO (con generador)
1. /admin/login
2. Escribir: "20 tests de personalidad sobre películas"
3. Click [Generar] + [Importar]
4. npm run build
⏱️ 2 MINUTOS
```

### 2️⃣ Monitorear en tiempo real

```
Dashboard Analytics:
├─ ¿Cuánto dinero hoy?
├─ ¿Qué test genera más $?
├─ ¿Tasa de completación?
└─ Recomendaciones automáticas
```

### 3️⃣ Iteración rápida

```
1. Ves que trivia tiene RPM bajo
2. Vas a /admin/generate
3. Generas 10 trivias NUEVAS
4. Importas
5. Build
6. Monitoreas RPM nuevamente
```

---

## ⚙️ Variables de Entorno Necesarias

```bash
# .env (o variables de entorno en tu hosting)

# Obligatorio para Admin
ADMIN_PASSWORD=tu-contraseña-fuerte

# Obligatorio para Generador IA
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Opcionales (ya existen)
NEXT_PUBLIC_GA_ID=G_XXXXX
NEXT_PUBLIC_BASE_URL=https://tuapp.com
```

---

## 🚀 Cómo Deployar (Vercel, Netlify, etc.)

### Vercel (Recomendado - 1 click)

1. Push a GitHub desde tu PC
2. Ve a vercel.com
3. Conecta tu repo
4. Agrega variables de entorno en Settings:
   ```
   ADMIN_PASSWORD=tu-contraseña
   ANTHROPIC_API_KEY=sk-ant-xxxxx
   ```
5. Click Deploy
6. ✅ Live en https://tuapp.vercel.app

### Tuyo (VPS manual)

```bash
# En tu servidor
git clone https://github.com/tuuser/proyecto-web-tests.git
cd proyecto-web-tests
npm install
npm run build

# Variables de entorno
export ADMIN_PASSWORD=tu-contraseña
export ANTHROPIC_API_KEY=sk-ant-xxxxx

npm start
# ✅ Corre en http://localhost:3000
```

---

## 🔧 Troubleshooting

### "No encuentro /admin/login"

```bash
# Verifica que exista el archivo
ls src/app/admin/login/page.tsx
# Si no existe, asegúrate de haber seguido la instalación completa
```

### "Password incorrecta"

```bash
# Verifica .env tenga ADMIN_PASSWORD configurado
cat .env | grep ADMIN_PASSWORD

# Si está vacío:
echo 'ADMIN_PASSWORD=mi-contraseña' >> .env
# Reinicia el servidor
npm run dev
```

### "Claude API error"

```bash
# Verifica API key
cat .env | grep ANTHROPIC_API_KEY

# Si falta:
1. Ve a https://console.anthropic.com/
2. Copia tu API key
3. Agrega a .env:
   ANTHROPIC_API_KEY=sk-ant-xxxxx
4. Reinicia servidor
```

### "No puedo importar tests"

Posibles causas:
- [ ] No iniciaste sesión (`/admin/login`)
- [ ] Tu sesión expiró (24 horas)
- [ ] Tests no validados (errores en estructura)
- [ ] Slugs duplicados (cambiar nombre)

---

## 📈 Roadmap Futuro (Opcional)

Mejoras que podrías agregar:

- [ ] **Logout button** en admin panel
- [ ] **Download analytics** como CSV/PDF
- [ ] **Editar tests** directamente en admin
- [ ] **Auto-publish** (sin necesidad de `npm run build`)
- [ ] **Test scheduler** (programar cuándo publicar)
- [ ] **A/B testing** por resultado
- [ ] **Real-time analytics** (gráficos vivos)

---

## 🎓 Resumen

✅ **Autenticación segura**: Solo tú y tu equipo  
✅ **Generador IA integrado**: Tests en 2 minutos  
✅ **Validación automática**: Ningún test malformado  
✅ **Analytics en vivo**: Monitorea monetización  
✅ **Acceso web**: No necesitas terminal  
✅ **Escalable**: De 10 a 1000+ tests sin problema  

**Felicidades, ahora eres 10x más productivo! 🚀**
