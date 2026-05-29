# 📋 RECURSOS NECESARIOS - Checklist Completo

**Fase**: Implementación Compliance (Semana 1 completada ✅)  
**Estado**: Listo para integración de dependencias externas  
**Última actualización**: 29 de mayo de 2026

---

## 🔑 APIs & Keys Requeridas

### 1. ✅ ANTHROPIC API KEY (Para generador de tests)

**Ya implementado en admin panel**

```
Ubicación: .env
ANTHROPIC_API_KEY=sk-ant-v...
```

**Dónde obtenerla**: https://console.anthropic.com/  
**Costo**: Pay-as-you-go (~$0.003 por test)  
**Ya en**: `/src/app/api/generate/route.ts`

### 2. 📧 SENDGRID API KEY (Para emails de confirmación)

**NECESARIO para GDPR compliance**

```
Ubicación: .env
SENDGRID_API_KEY=SG.xxx...
```

**Dónde obtenerla**: https://sendgrid.com/  
**Costo**: Gratuito hasta 100 emails/día, luego $19.95/mes  
**Endpoint**: `/api/privacy/send-confirmation-email`

**Plantillas de email necesarias:**
1. Confirmación de eliminación de cuenta (48h deadline)
2. Renovación de consentimiento (cada 90d)
3. Notificación de brecha de datos (si ocurre)
4. Recibo de solicitud GDPR (acceso, eliminación)

**Código de implementación**:
```typescript
// .env
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=compliance@quizlab.com

// src/lib/email/sendgrid.ts (crear)
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendDeletionConfirmationEmail(
  email: string,
  confirmationLink: string
) {
  await sgMail.send({
    to: email,
    from: 'compliance@quizlab.com',
    templateId: 'd-xxxxx', // Crear en SendGrid
    dynamicTemplateData: {
      confirmationLink,
      expiresIn: '48 hours',
    },
  });
}
```

### 3. 🗄️ DATABASE CONFIGURATION (Para audit logs & deletion)

**NECESARIO para almacenar logs inmutables**

Opciones:
- ✅ **PostgreSQL** (recomendado)
- ✅ **MongoDB** 
- ✅ **DynamoDB** (AWS - best for immutable logs)
- ✅ **MySQL**

**Tabla de Activity Logs**:
```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL,
  activityType VARCHAR(50),
  resource VARCHAR(100),
  resourceId VARCHAR(100),
  details JSONB,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  consentLevel VARCHAR(20),
  timestamp TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_activity_userId_timestamp ON activity_logs(userId, timestamp);
CREATE INDEX idx_activity_action ON activity_logs(activityType);
```

**Tabla de Deletion Requests**:
```sql
CREATE TABLE deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  confirmationToken VARCHAR(255) UNIQUE,
  tokenExpiresAt TIMESTAMP,
  confirmed BOOLEAN DEFAULT FALSE,
  confirmedAt TIMESTAMP,
  deletedAt TIMESTAMP,
  status VARCHAR(20), -- 'pending', 'confirmed', 'completed'
  createdAt TIMESTAMP DEFAULT NOW()
);
```

**Tabla de Consent Logs**:
```sql
CREATE TABLE consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL,
  consentType VARCHAR(50), -- 'privacy_policy', 'cookies', 'marketing'
  accepted BOOLEAN,
  version VARCHAR(10),
  ipAddress VARCHAR(45),
  userAgent TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

### 4. 🔐 ENCRYPTION KEYS (Para datos sensibles)

**NECESARIO para AES-256 encryption**

```
Ubicación: .env
ENCRYPTION_KEY=base64_encoded_256bit_key
ENCRYPTION_IV=base64_encoded_128bit_iv
```

**Generar keys**:
```bash
# OpenSSL (macOS/Linux)
openssl rand -base64 32  # Para ENCRYPTION_KEY
openssl rand -base64 16  # Para ENCRYPTION_IV

# O en Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Implementación en**: `src/lib/compliance/encryption.ts`

### 5. 🌐 GOOGLE ANALYTICS (Para analytics consent)

**Ya implementado en layout, pero necesita configuración**

```
.env
NEXT_PUBLIC_GA_ID=G_XXXXXXXXXX
```

**Dónde obtenerlo**: https://analytics.google.com/  
**Costo**: Gratuito  
**Status**: Ya configurado en `src/app/layout.tsx`

---

## 📦 Librerías npm Necesarias

### Instaladas ✅ (Verificar con `npm list`)

```bash
npm install
```

### Nuevas a Instalar ⚠️

```bash
# Email
npm install @sendgrid/mail dotenv

# Encriptación  
npm install crypto-js

# Tipos TypeScript
npm install -D @types/node

# Validación de emails
npm install email-validator

# Generación de tokens seguros
npm install uuid

# Base de datos (elige una)
npm install pg              # PostgreSQL
# O
npm install mongodb         # MongoDB
# O
npm install @aws-sdk/client-dynamodb  # DynamoDB
```

**package.json actualizado**:
```json
{
  "dependencies": {
    "@sendgrid/mail": "^7.7.0",
    "crypto-js": "^4.1.1",
    "email-validator": "^2.1.2",
    "uuid": "^9.0.0",
    "pg": "^8.11.0"
  }
}
```

---

## 🔧 Configuración de Infraestructura

### Hosting/Deployment

**Ya configurado**: Vercel (desde proyecto anterior)

```
.env (Vercel Environment Variables):
├─ ANTHROPIC_API_KEY
├─ SENDGRID_API_KEY
├─ DATABASE_URL
├─ ENCRYPTION_KEY
├─ NEXT_PUBLIC_GA_ID
├─ ADMIN_PASSWORD (del admin panel anterior)
└─ NODE_ENV=production
```

### Base de Datos (Producción)

Opciones:
1. **PostgreSQL + Vercel Postgres** (recomendado)
   - Proveedor: Vercel
   - Plan: $0.24/horas de cálculo
   - Link: https://vercel.com/docs/storage/postgres

2. **MongoDB Atlas** (alternativa)
   - Proveedor: MongoDB
   - Plan: Gratuito hasta 512MB
   - Link: https://www.mongodb.com/cloud/atlas

3. **AWS DynamoDB** (para logs inmutables)
   - Proveedor: Amazon AWS
   - Plan: Gratuito 1er año, luego pay-as-you-go
   - Mejor para auditoría inmutable

**Recomendación**: Vercel Postgres (integra perfectamente con Next.js en Vercel)

---

## 📧 Email Service

### SendGrid Setup

1. **Crear cuenta**: https://sendgrid.com/
2. **Generar API Key**:
   - Settings → API Keys → Create API Key
   - Scope: Mail Send, Template Management
3. **Crear plantillas**:
   ```
   Nombre: "Account Deletion Confirmation"
   Template ID: d-xxxxx (guardar en .env)
   
   Subject: Confirma eliminación de cuenta
   Body: Click aquí para confirmar eliminación: {{confirmationLink}}
   ```

4. **Verificar dominio** (para production):
   - Settings → Sender Authentication
   - Agregar dominio quizlab.com
   - Cambiar DNS records según instrucciones

### Plantillas Necesarias

| Plantilla | Propósito | Urgencia |
|-----------|----------|----------|
| Account Deletion | Confirmación eliminación | CRÍTICA |
| Consent Renewal | Renovar consentimiento (90d) | Alta |
| Data Breach | Notificar si hay brecha | CRÍTICA |
| GDPR Request Receipt | Confirmar solicitud | Alta |
| Marketing Unsubscribe | Confirmar desuscripción | Media |

---

## 🗃️ Archivos de Configuración

### .env (Ya debería tener estos)

```bash
# Existing (del admin panel)
ADMIN_PASSWORD=changeme
ANTHROPIC_API_KEY=sk-ant-v...

# NUEVOS para compliance
SENDGRID_API_KEY=SG.xxxxx
DATABASE_URL=postgresql://user:pass@host/db
ENCRYPTION_KEY=base64_key_256bit
ENCRYPTION_IV=base64_iv_128bit

# Existing (analytics)
NEXT_PUBLIC_GA_ID=G_XXXXXXXXXX
NEXT_PUBLIC_BASE_URL=https://quizlab.com
```

### .env.production (En Vercel)

```
ADMIN_PASSWORD=strongpassword
ANTHROPIC_API_KEY=sk-ant-v...
SENDGRID_API_KEY=SG.xxxxx
DATABASE_URL=postgres://...
ENCRYPTION_KEY=...
NODE_ENV=production
```

---

## 🔐 Variables de Entorno - Ejemplo Completo

```bash
# ========== COMPLIANCE & PRIVACY ==========
# SendGrid para emails
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=compliance@quizlab.com

# Base de datos (PostgreSQL)
DATABASE_URL=postgresql://user:password@db.xxx.vercel.app:5432/db_name

# Encriptación de datos sensibles
ENCRYPTION_KEY=base64_encoded_256bit_key
ENCRYPTION_IV=base64_encoded_128bit_iv

# ========== EXISTING (ADMIN PANEL) ==========
ADMIN_PASSWORD=tu-contraseña-fuerte-2024
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# ========== ANALYTICS ==========
NEXT_PUBLIC_GA_ID=G_XXXXXXXXXX
NEXT_PUBLIC_BASE_URL=https://quizlab.com

# ========== GENERAL ==========
NODE_ENV=production
```

---

## 🚀 Checklist de Implementación (Que Falta)

### Backend Services (Prioridad Alta)

- [ ] **Email Service Integration** (SendGrid)
  - [ ] Instalar `@sendgrid/mail`
  - [ ] Crear `src/lib/email/sendgrid.ts`
  - [ ] Crear plantillas en SendGrid
  - [ ] Implementar envío en `/api/privacy/request-deletion`

- [ ] **Database Integration**
  - [ ] Crear tablas (activity_logs, deletion_requests, consent_logs)
  - [ ] Conectar a aplicación (Prisma o TypeORM)
  - [ ] Implementar queries en `src/lib/db/*`
  - [ ] Migrar usuarios existentes (si aplica)

- [ ] **Encryption Service**
  - [ ] Crear `src/lib/compliance/encryption.ts`
  - [ ] Implementar en datos sensibles (DOB, respuestas)
  - [ ] Audit trail de desencriptación

### API Endpoints (Prioridad Alta)

- [ ] `/api/privacy/confirm-deletion` - Confirmar eliminación por email
- [ ] `/api/privacy/send-confirmation-email` - Enviar emails
- [ ] `/api/privacy/get-user-data` - Devolver datos exportados
- [ ] `/api/compliance/renew-consent` - Renovación 90d
- [ ] `/api/admin/compliance-report` - Reportes mensuales

### Frontend Pages (Prioridad Media)

- [ ] `/account/edit-profile` - Rectificación de datos
- [ ] `/account/preferences` - Objeción/opt-out
- [ ] `/privacy/data-deletion-status` - Estado de eliminación

### Documentación (Prioridad Media)

- [ ] Email templates (SendGrid)
- [ ] Database migration scripts
- [ ] Incident response procedures
- [ ] Staff training materials

### Testing (Prioridad Media)

- [ ] Test GDPR request flows
- [ ] Test email delivery
- [ ] Test encryption/decryption
- [ ] Load test activity logging

### Deployment (Prioridad Alta)

- [ ] Setup database en Vercel Postgres
- [ ] Configure SendGrid API keys
- [ ] Setup encryption keys (key rotation)
- [ ] Enable HTTPS (already done on Vercel)
- [ ] Setup monitoring alerts

---

## 📊 Estimación de Costos Mensuales

| Servicio | Plan | Costo | Notas |
|----------|------|-------|-------|
| **Vercel** | Pro | $20 | Hosting + Postgres |
| **SendGrid** | Pro | $29.95 | Hasta 100k emails |
| **Anthropic API** | Pay-as-you-go | ~$30 | Si usas generador |
| **Google Analytics** | Gratuito | $0 | Límite 10M hits/mes |
| **Total** | | ~$80 | Variable según uso |

---

## 🎓 Recursos de Aprendizaje

### GDPR & Compliance
- [GDPR Complete Guide](https://gdpr.eu/)
- [CCPA Compliance](https://oag.ca.gov/privacy/ccpa)
- [SendGrid Email Best Practices](https://docs.sendgrid.com/)

### Implementación Técnica
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [PostgreSQL on Vercel](https://vercel.com/docs/storage/postgres)
- [Node.js Crypto](https://nodejs.org/api/crypto.html)

### Seguridad
- [OWASP Top 10](https://owasp.org/Top10/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [Encryption in Transit/At Rest](https://cheatsheetseries.owasp.org/)

---

## 🔗 Links Útiles

### Desarrollo
- GitHub Repo: https://github.com/autimioc13/proyecto-web-tests
- Vercel Dashboard: https://vercel.com/dashboard
- SendGrid: https://app.sendgrid.com/

### Regulaciones
- GDPR: https://gdpr-info.eu/
- CCPA: https://oag.ca.gov/privacy/ccpa
- Habeas Data: https://www.sic.gov.co/

### Herramientas
- Generador de API Keys: https://console.anthropic.com/
- Validador GDPR: https://gdpr-checklist.intersoft.online/
- Privacy Scanner: https://www.siteimprove.com/

---

## ⚠️ Lo Que NO Es Necesario

❌ **NO necesitas**:
- Abogado externo (a menos que quieras segunda opinión)
- Auditor externo (puedes hacerlo internamente)
- Certificación ISO 27001 (voluntaria, no requerida)
- CDN especial (Vercel lo incluye)
- Firewall WAF (Vercel lo incluye)
- Balanceador de carga (Vercel lo incluye)

---

## 📅 Timeline de Implementación

### Semana 1 ✅ (Completada)
- [x] Políticas legales
- [x] Componentes UI
- [x] Rutas de privacidad
- [x] API endpoints básicos

### Semana 2 (Próxima)
- [ ] Database setup + migrations
- [ ] SendGrid integration
- [ ] Email templates
- [ ] Encryption implementation

### Semana 3
- [ ] Testing de flujos GDPR
- [ ] Deployment a producción
- [ ] Monitoring setup
- [ ] Staff training

### Semana 4
- [ ] Iteraciones basadas en uso real
- [ ] Optimizaciones de performance
- [ ] Documentación final
- [ ] Go-live

---

## 🎯 Resumen Rápido

**Necesitas estos recursos EXTERNOS:**

1. **APIs/Keys**
   - ✅ ANTHROPIC_API_KEY (ya tienes)
   - ⚠️ SENDGRID_API_KEY (crea gratis en sendgrid.com)
   - ⚠️ DATABASE_URL (usa Vercel Postgres - $0.24/hr)

2. **Librerías npm**
   - ⚠️ @sendgrid/mail
   - ⚠️ pg (PostgreSQL driver)
   - ⚠️ crypto-js (encriptación)

3. **Infraestructura**
   - ✅ Vercel Hosting (ya tienes)
   - ⚠️ Vercel Postgres (crea en Vercel)
   - ⚠️ SendGrid (crea gratis)

4. **Configuración**
   - Agregar 5 variables de entorno nuevas
   - Crear tablas en base de datos
   - Crear plantillas de email

**Costo Total Mensual**: ~$80-100 (variable según uso)  
**Tiempo de Implementación**: 3-4 semanas  
**Dificultad**: Media (puedo ayudarte con el código)

---

¿Quieres que implemente alguno de estos recursos en el siguiente paso?
