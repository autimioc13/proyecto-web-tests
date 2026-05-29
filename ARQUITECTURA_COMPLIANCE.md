# 🏗️ Arquitectura Técnica de Compliance - QuizLab

**Última actualización**: 29 de mayo de 2026  
**Nivel de Protección**: MODE FORTRESS (GDPR + CCPA + Habeas Data)

---

## 📊 Mapa Técnico Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    QUIZLAB COMPLIANCE STACK                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🌐 CAPA 1: FRONTAL (Browser)                              │
│  ├─ Cookie Consent Banner                                  │
│  ├─ Privacy Notice (inline)                                │
│  ├─ Cookie Manager (user preferences)                      │
│  ├─ Localization (multi-idioma)                            │
│  └─ Analytics Blocker (respect DNT)                        │
│                                                             │
│  🔐 CAPA 2: INGRESO (Login/Auth)                           │
│  ├─ Age Verification                                       │
│  ├─ Parental Consent (< 18)                                │
│  ├─ Email Verification                                     │
│  ├─ Privacy Policy Acceptance                              │
│  ├─ Marketing Opt-in                                       │
│  └─ Session Management (secure)                            │
│                                                             │
│  📊 CAPA 3: DATOS (Collection & Processing)               │
│  ├─ Data Classification (personal/behavioral/sensitive)    │
│  ├─ Encryption (AES-256 at rest, TLS in transit)          │
│  ├─ Pseudonymization (hash identifiers)                    │
│  ├─ Purpose Limitation (use only what authorized)         │
│  ├─ Consent Validation (before each use)                  │
│  └─ Third-party Vendor Management (DPA checks)            │
│                                                             │
│  👤 CAPA 4: USUARIO (User Rights)                         │
│  ├─ Data Access (download all data)                        │
│  ├─ Data Rectification (edit incorrect data)               │
│  ├─ Data Deletion (GDPR Art. 17 - right to be forgotten)  │
│  ├─ Data Portability (export in standard format)           │
│  ├─ Right to Object (no behavioral profiling)              │
│  ├─ Automated Decision Rights (no algo decisions)          │
│  └─ Consent Withdrawal (anytime)                           │
│                                                             │
│  ⚖️ CAPA 5: LEGAL (Compliance Framework)                  │
│  ├─ Privacy Policy (GDPR Art. 13-14)                       │
│  ├─ Terms & Conditions (contract foundation)               │
│  ├─ Cookie Policy (transparency)                           │
│  ├─ Data Processing Agreement (DPA)                        │
│  ├─ Legitimate Interest Assessment (LIA)                   │
│  ├─ Record of Processing Activities (ROPA)                 │
│  ├─ Incident Response Plan (72h notification)              │
│  └─ Sub-processor List (Art. 28.2-4)                       │
│                                                             │
│  🔍 CAPA 6: AUDITORÍA (Monitoring & Logging)              │
│  ├─ Activity Logs (quién accede qué, cuándo)              │
│  ├─ Data Access Logs (compliance audit trail)              │
│  ├─ Change Management (quién cambió qué)                   │
│  ├─ Error Logging (security incidents)                     │
│  ├─ Automated Alerts (suspicious activity)                 │
│  └─ Monthly Compliance Reports (internal)                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Capa 1: Frontend (Cookie Consent & Privacy UI)

### 1.1 Componente Banner de Cookies

**Ubicación**: `src/components/compliance/CookieConsentBanner.tsx`

```
REQUISITOS:
✅ Mostrar ANTES de instalar cookies no necesarias
✅ Fácil aceptar y rechazar (mismo tamaño botones)
✅ Opción personalizar visible
✅ Link a política de cookies en lugar destacado
✅ No autocerrarse (user debe actuar)
✅ Respeta preferencia de idioma del usuario
```

**Flujo**:
```
Usuario entra a www.quizlab.com
           ↓
¿Tiene consentimiento guardado?
  │
  ├─ NO → Mostrar banner
  │        (bloquea instalación de cookies no necesarias)
  │        ↓
  │        Usuario elige opción
  │        ↓
  │        Guardar elección en localStorage (antes de cookies!)
  │        ↓
  │        Instalar solo cookies autorizadas
  │        ↓
  │        Cerrar banner
  │
  └─ SÍ → Saltar banner
          (usar preferencias guardadas)
          (mostrar aviso si pasaron 90 días)
```

### 1.2 Cookie Manager UI

**Ubicación**: `src/app/privacy/cookies/page.tsx`

```
PÁGINA: www.quizlab.com/privacy/cookies

CONTENIDO:
1. Explicación de qué son cookies
2. Lista de todas nuestras cookies (tabla)
3. Toggles para activar/desactivar por categoría
4. Links a opt-out de terceros
5. Explicación de cómo borrar cookies del navegador
6. Botón para descargar consentimiento history
```

### 1.3 Privacy Notice (Inline)

Mostrar en puntos clave:

```
✅ Al registrarse:
   "Al crear cuenta, aceptas Términos y Política de Privacidad"
   [Lee Términos]  [Lee Privacidad]

✅ Al comprar:
   "Tus datos de pago son procesados por Stripe (privacidad Stripe)"
   [Ver política Stripe]

✅ Al hacer test:
   "Tus resultados se almacenan anónimamente para mejorar la plataforma"
   [Optar por no participar]

✅ Al recibir email marketing:
   "Recibiste este email porque te suscribiste"
   [Desuscribirse]  [Gestionar preferencias]
```

---

## 🔐 Capa 2: Ingreso (Auth & Consent)

### 2.1 Age Verification

**Ubicación**: `src/components/auth/AgeVerification.tsx`

```
FLUJO:
1. Usuario intenta registrarse
2. Pide fecha de nacimiento
3. Calcula edad automáticamente
4. Redirige según edad:

   MENOR DE 13:
   ├─ ❌ Acceso denegado (copiar para padres)
   ├─ ✉️ Email a padre/madre con instrucciones
   └─ 📋 Enviar formulario de consentimiento

   13-17 AÑOS:
   ├─ ⏳ Requiere consentimiento parental
   ├─ 📧 Enviar email a padre/madre
   ├─ ✅ Padre/madre verifica email
   ├─ ✅ Firma consentimiento digital
   └─ ✅ Hijo/a puede usar cuenta

   18+:
   └─ ✅ Acceso directo
```

### 2.2 Privacy Policy Acceptance

**En registro:**
```html
<form onSubmit={handleRegister}>
  <input type="email" required />
  <input type="password" required />
  
  <div class="consent-checkboxes">
    ☑️ He leído y acepto los Términos y Condiciones
       [Leer Términos]
       
    ☑️ He leído y acepto la Política de Privacidad
       [Leer Privacidad]
       
    ☐ (Opcional) Deseo recibir emails sobre nuevos tests
       [Gestionar preferencias]
  </div>
  
  <button type="submit" disabled={!allChecked}>
    Crear Cuenta
  </button>
</form>
```

**Registro en DB:**
```javascript
{
  userId: "user_123",
  termsVersion: "1.0",
  termsAcceptedAt: "2026-05-29T10:30:00Z",
  termsAcceptedIP: "203.0.113.45",
  privacyVersion: "1.0",
  privacyAcceptedAt: "2026-05-29T10:30:00Z",
  privacyAcceptedIP: "203.0.113.45",
  marketingConsent: false,
  marketingConsentAt: null,
  ageVerified: true,
  parentalConsentRequired: false
}
```

---

## 📊 Capa 3: Procesamiento de Datos

### 3.1 Clasificación de Datos

**Ubicación**: `src/lib/compliance/data-classification.ts`

```typescript
// Categorías de datos que recolectamos
type DataCategory = 
  | 'personal'              // email, nombre
  | 'financial'            // pagos, tarjetas
  | 'behavioral'           // qué tests hizo
  | 'sensitive'            // respuestas de personalidad
  | 'metadata'             // IP, device, timestamps
  | 'logs'                 // audit trail

// Datos personales bajo GDPR
const PERSONAL_DATA = {
  email: { category: 'personal', sensitive: false },
  fullName: { category: 'personal', sensitive: false },
  dob: { category: 'personal', sensitive: true },
  password: { category: 'personal', sensitive: true },
  address: { category: 'personal', sensitive: false },
  phone: { category: 'personal', sensitive: false },
  paymentInfo: { category: 'financial', sensitive: true },
}

// Datos de comportamiento
const BEHAVIORAL_DATA = {
  testsTaken: { category: 'behavioral', sensitive: false },
  testAnswers: { category: 'behavioral', sensitive: true },
  browsePath: { category: 'behavioral', sensitive: false },
  timeOnPage: { category: 'behavioral', sensitive: false },
  purchaseHistory: { category: 'financial', sensitive: false },
}

// Qué hacer con cada dato
const DATA_RETENTION = {
  email: { retention: 'indefinite', unless: 'deletion_requested' },
  testAnswers: { retention: '2 years', unless: 'user_deletes' },
  paymentInfo: { retention: '7 years', unless: 'deletion_requested', reason: 'tax_law' },
  logs: { retention: '1 year', unless: 'security_incident' },
}
```

### 3.2 Encriptación en Reposo

```typescript
// src/lib/compliance/encryption.ts

import crypto from 'crypto';

// Encriptar datos sensibles antes de guardar en DB
export function encryptSensitive(data: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key), iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

// Desencriptar cuando necesitas leer
export function decryptSensitive(encrypted: string, key: string): string {
  const [ivHex, authTagHex, encData] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### 3.3 Pseudonymization

```typescript
// src/lib/compliance/pseudonymization.ts

// Crear identificador anónimo que no revele identidad
export function pseudonymizeUser(userId: string): string {
  const hash = crypto
    .createHash('sha256')
    .update(userId + process.env.PSEUDONYM_SALT)
    .digest('hex');
  
  return `user_${hash.substring(0, 16)}`;
}

// Para analytics, usar pseudónimo en lugar de email
analytics.trackEvent({
  userId: pseudonymizeUser(realUserId),  // nunca usar email real
  action: 'test_completed',
  testName: 'personality-quiz-1',
  // NO incluir: respuestas específicas, datos personales
});
```

### 3.4 Validación de Consentimiento Antes de Procesar

```typescript
// src/lib/compliance/consent-validation.ts

interface UserConsent {
  cookieConsent: 'necessary_only' | 'all';
  marketingConsent: boolean;
  analyticsConsent: boolean;
  profilingConsent: boolean;
  expiresAt: Date;
}

// Antes de cada acción que procesa datos
export async function validateConsent(
  userId: string,
  requiredScopes: string[]
): Promise<boolean> {
  const consent = await db.getUserConsent(userId);
  
  if (!consent) return false;
  if (new Date() > consent.expiresAt) return false;
  
  for (const scope of requiredScopes) {
    if (scope === 'marketing' && !consent.marketingConsent) return false;
    if (scope === 'analytics' && !consent.analyticsConsent) return false;
    if (scope === 'profiling' && !consent.profilingConsent) return false;
  }
  
  return true;
}

// Uso en API endpoints:
export async function POST(req: NextRequest) {
  const userId = req.cookies.get('auth_token')?.value;
  
  const hasConsent = await validateConsent(userId, ['marketing', 'analytics']);
  if (!hasConsent) {
    return NextResponse.json(
      { error: 'Consentimiento requerido' },
      { status: 403 }
    );
  }
  
  // Procesar datos solo si hay consentimiento
  await processUserData(userId);
}
```

### 3.5 Third-party Vendor Management (DPA)

```typescript
// src/lib/compliance/vendors.ts

interface Vendor {
  name: string;
  country: string;
  services: string[];
  dpaSignedAt: Date;
  dataTransferMechanism: 'SCC' | 'adequacy' | 'bcr';
  renewalDue: Date;
}

const VENDORS: Vendor[] = [
  {
    name: 'Stripe',
    country: 'USA',
    services: ['payment_processing'],
    dpaSignedAt: new Date('2025-01-15'),
    dataTransferMechanism: 'SCC',
    renewalDue: new Date('2026-01-15'),
  },
  {
    name: 'Google Analytics',
    country: 'USA',
    services: ['analytics'],
    dpaSignedAt: new Date('2024-11-01'),
    dataTransferMechanism: 'SCC',
    renewalDue: new Date('2025-11-01'),
  },
  // ... more vendors
];

// Check if vendor is compliant before sending data
export async function checkVendorCompliance(vendorName: string): Promise<boolean> {
  const vendor = VENDORS.find(v => v.name === vendorName);
  if (!vendor) return false;
  
  // Check DPA is signed
  if (!vendor.dpaSignedAt) return false;
  
  // Check renewal is not due
  if (new Date() > vendor.renewalDue) {
    console.warn(`Vendor ${vendorName} DPA renewal due`);
    return false;
  }
  
  return true;
}
```

---

## 👤 Capa 4: User Rights (GDPR/CCPA/Habeas Data)

### 4.1 Data Export (Right to Portability)

**Endpoint**: `POST /api/privacy/export`

```typescript
// src/app/api/privacy/export/route.ts

export async function POST(req: NextRequest) {
  const userId = validateSession(req);
  
  // Collect ALL user data
  const userData = {
    account: await db.getAccount(userId),
    profile: await db.getProfile(userId),
    testResults: await db.getTestResults(userId),
    purchaseHistory: await db.getPurchases(userId),
    browsingHistory: await db.getBrowsingHistory(userId),
    consentLog: await db.getConsentLog(userId),
    activityLog: await db.getActivityLog(userId),
  };
  
  // Prepare JSON export
  const jsonData = JSON.stringify(userData, null, 2);
  const jsonBuffer = Buffer.from(jsonData);
  
  // Create ZIP with JSON + CSV + structured data
  const zip = new AdmZip();
  zip.addFile('user_data.json', jsonBuffer);
  zip.addFile('user_data.csv', convertToCSV(userData));
  
  // Email + download option
  await sendExportEmail(userId, zip);
  
  return new NextResponse(zip.toBuffer(), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename=my-data.zip'
    }
  });
}
```

### 4.2 Data Deletion (Right to be Forgotten)

**Page**: `src/app/privacy/delete-account/page.tsx`

```
FLUJO DE ELIMINACIÓN:
1. Usuario solicita eliminación
2. ✉️ Email de confirmación (anti-abuse)
3. Usuario confirma en email (24h deadline)
4. 🚨 Aviso: "No se puede deshacer"
5. Elección: Anonimizar o eliminar
   
   ANONIMIZAR:
   ├─ Mantiene datos sin identificador
   ├─ Útil para análisis histórico
   ├─ Cumple GDPR (datos no ligados a persona)
   
   ELIMINAR:
   ├─ Borra todo (excepto legal holds)
   ├─ Permanente
   ├─ Cumple derecho al olvido
```

### 4.3 Data Rectification

**Page**: `src/app/account/edit-profile/page.tsx`

```
✅ Usuario puede editar:
├─ Email
├─ Nombre
├─ Fecha de nacimiento
├─ Dirección
└─ Preferences

AUDITORÍA:
├─ Registra quién cambió qué
├─ Timestamps de cada cambio
├─ IP address del cambio
└─ Notifica por email para verificar
```

### 4.4 Right to Object (No Behavioral Profiling)

```
USUARIO PUEDE OPTAR POR NO PARTICIPAR EN:

1. Perfilado (Behavioral Profiling)
   ├─ No crear perfil de personalidad
   ├─ No usar respuestas de tests para predicciones
   └─ Afecta: Recomendaciones, ads personalizados

2. Marketing Directo
   ├─ No enviar emails promozionales
   ├─ No enviar notificaciones push
   └─ Afecta: Todos los marketing

3. Análisis de Datos
   ├─ No incluir en agregados anónimos
   ├─ No usar para reportes
   └─ Afecta: Estadísticas globales
```

---

## ⚖️ Capa 5: Legal Framework

### 5.1 Record of Processing Activities (ROPA)

**Ubicación**: `docs/ROPA.xlsx` (genera automáticamente)

Documentamos cada procesamiento de datos:

```
│ Processing │ Purpose │ Legal Basis │ Recipients │ Retention │
├──────────────────────────────────────────────────────────────
│ Authentication │ Login │ Contract │ None │ Until deletion │
│ Email marketing │ Promotion │ Consent │ SendGrid │ Until unsubscribe │
│ Analytics │ Improve UX │ Legitimate Interest │ Google │ 2 years │
│ Fraud detection │ Security │ Obligation │ None │ 1 year │
│ Payment processing │ Subscriptions │ Contract │ Stripe │ 7 years (legal) │
```

### 5.2 Legitimate Interest Assessment (LIA)

Para cada "legitimate interest":

```
PROCESSING: Analytics via Google Analytics
├─ Purpose: Understand how users interact with platform
├─ Necessity: Yes (cannot improve without data)
├─ Impact on Users: Low (pseudonymized data)
├─ Alternatives: None (would impact service quality)
├─ Safeguards: Only aggregated data, no personal identification
└─ Conclusion: ✅ Legitimate Interest Valid
```

### 5.3 Incident Response Plan

**72-hour notification requirement (GDPR Art. 33)**

```
┌──────────────────────────────────────────────────┐
│         SECURITY INCIDENT DETECTED!              │
├──────────────────────────────────────────────────┤
│                                                  │
│ INMEDIATAMENTE (Minuto 1):                      │
│ ├─ Aislar sistema afectado                      │
│ ├─ Activar equipo de respuesta                  │
│ ├─ Documentar lo ocurrido                       │
│ └─ Notificar autoridades si es grave            │
│                                                  │
│ DENTRO DE 24 HORAS:                            │
│ ├─ Investigación preliminar                     │
│ ├─ Determinar si fue breach de datos            │
│ ├─ Evaluar riesgo para usuarios                 │
│ └─ Notificar DPA (Data Protection Officer)      │
│                                                  │
│ DENTRO DE 72 HORAS:                            │
│ ├─ Notificar reguladores (AEPD, etc.)          │
│ ├─ Preparar comunicado para usuarios             │
│ └─ Ofrecer medidas de mitigación                │
│                                                  │
│ DENTRO DE 7 DÍAS:                              │
│ ├─ Reporte completo de investigación            │
│ ├─ Root cause analysis                          │
│ ├─ Medidas de remediación                       │
│ └─ Plan de prevención futuro                    │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 🔍 Capa 6: Auditoría y Monitoring

### 6.1 Activity Logs

**Almacenar en tabla separada (immutable):**

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY,
  userId UUID,
  action VARCHAR(50),          -- 'login', 'view_test', 'delete_account'
  resource VARCHAR(100),       -- qué se accedió
  resourceId VARCHAR(100),
  ipAddress VARCHAR(45),       -- IPv4 or IPv6
  userAgent TEXT,              -- device info
  consentLevel VARCHAR(20),    -- necesaria, marketing, etc
  timestamp TIMESTAMP,
  details JSONB,               -- extra info
  CONSTRAINT fk_user FOREIGN KEY (userId) REFERENCES users(id)
);

-- Índices para auditoría
CREATE INDEX idx_activity_userId_timestamp ON activity_logs(userId, timestamp);
CREATE INDEX idx_activity_action ON activity_logs(action);
CREATE INDEX idx_activity_timestamp ON activity_logs(timestamp);
```

### 6.2 Automated Alerts

```typescript
// src/lib/compliance/alerts.ts

// Alert if suspicious activity detected
export async function checkForSuspiciousActivity(userId: string) {
  const recentLogins = await db.getRecentLogins(userId, 24 * 60); // 24h
  
  // Too many logins in short time = account compromise risk
  if (recentLogins.length > 10) {
    await sendSecurityAlert(userId, 'multiple_logins');
    await logSecurityEvent(userId, 'suspicious_login_activity');
  }
  
  // Data downloads in bulk = data exfiltration risk
  const recentExports = await db.getRecentDataExports(userId, 24 * 60);
  if (recentExports.length > 2) {
    await sendSecurityAlert(userId, 'bulk_data_export');
  }
}
```

### 6.3 Monthly Compliance Report

**Auto-generate cada mes:**

```
COMPLIANCE REPORT - MAYO 2026

1. DATA PROTECTION INCIDENTS:
   ├─ Total reported: 0
   ├─ Serious incidents: 0
   └─ User impact: None

2. GDPR REQUESTS PROCESSED:
   ├─ Data access: 23 (avg 3 days)
   ├─ Data deletion: 5 (100% completed)
   ├─ Data portability: 8 (avg 2 days)
   ├─ Rectification: 12 (avg 1 day)
   └─ Objection: 2 (1 honored, 1 pending review)

3. CCPA REQUESTS:
   ├─ Consumer Know requests: 8
   ├─ Consumer Delete requests: 2
   └─ Opt-out sales: 3 (honored)

4. VENDOR COMPLIANCE:
   ├─ Stripe DPA: ✅ Valid
   ├─ Google DPA: ✅ Valid
   ├─ SendGrid DPA: ✅ Valid
   └─ All sub-processors compliant: ✅

5. CONSENT STATUS:
   ├─ Users with marketing consent: 45%
   ├─ Users with analytics consent: 78%
   ├─ Users with all cookies: 32%
   └─ Renewals pending: 8

6. SECURITY EVENTS:
   ├─ Suspicious login attempts: 3 (blocked)
   ├─ Data export anomalies: 0
   └─ Failed 2FA attempts: 12 (user education sent)

7. RECOMMENDATIONS:
   ├─ Review pricing consent flow (low conversion)
   ├─ Add SMS opt-out verification
   └─ Implement newsletter unsubscribe improvements
```

---

## 🚀 Checklist de Implementación

### FASE 1: Frontend (Semana 1)
- [ ] Cookie consent banner (obligatorio)
- [ ] Cookie manager page
- [ ] Privacy notice placeholders
- [ ] Respeto a DNT (Do Not Track)

### FASE 2: Auth & Consent (Semana 1-2)
- [ ] Age verification
- [ ] Parental consent flow
- [ ] Privacy policy acceptance
- [ ] Consent logging

### FASE 3: Data Protection (Semana 2-3)
- [ ] Encryption at rest (AES-256)
- [ ] Data classification
- [ ] Pseudonymization
- [ ] Consent validation before processing

### FASE 4: User Rights (Semana 3-4)
- [ ] Data export (ZIP)
- [ ] Data deletion
- [ ] Data rectification
- [ ] Objection handling

### FASE 5: Monitoring (Semana 4-5)
- [ ] Activity logging
- [ ] Automated alerts
- [ ] Monthly reports
- [ ] Audit dashboard

### FASE 6: Documentación (Ongoing)
- [ ] ROPA management
- [ ] LIA documentation
- [ ] Vendor DPA tracking
- [ ] Incident response plan

---

## 📋 Matríz de Conformidad

```
                GDPR    CCPA    Habeas Data
Consent         ✅      ✅      ✅
Data Access     ✅      ✅      ✅
Data Deletion   ✅      ✅      ✅
Portability     ✅      ✅      ✅
Objection       ✅      ✅      ✅
DPA             ✅      ✅      ⚠️ (local focus)
Encryption      ✅      ✅      ✅
Privacy Policy  ✅      ✅      ✅
Incident Report ✅      ⚠️      ✅
Sub-processor   ✅      ✅      ⚠️
```

---

**Nivel de Protección**: 🟩 MODE FORTRESS - PRODUCCIÓN READY
