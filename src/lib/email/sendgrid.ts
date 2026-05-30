import sgMail from '@sendgrid/mail';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const msg = {
    to: options.to,
    from: process.env.SENDGRID_FROM_EMAIL || 'compliance@quizlab.com',
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    await sgMail.send(msg);
    console.log(`✓ Email sent to ${options.to}`);
  } catch (error) {
    console.error(`✗ Error sending email to ${options.to}:`, error);
    throw error;
  }
}

// Deletion confirmation email
export async function sendDeletionConfirmationEmail(
  email: string,
  confirmationToken: string,
  expiresInHours: number = 48
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const confirmationLink = `${baseUrl}/api/privacy/confirm-deletion?token=${confirmationToken}`;

  const html = `
    <h1>Confirma la eliminación de tu cuenta</h1>
    <p>Has solicitado eliminar tu cuenta de QuizLab. Para continuar, haz clic en el enlace de abajo:</p>
    <p>
      <a href="${confirmationLink}" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Confirmar Eliminación
      </a>
    </p>
    <p><strong>⏰ Importante:</strong> Este enlace expira en ${expiresInHours} horas.</p>
    <p>Si no solicitaste esto, ignora este email. Tu cuenta NO será eliminada.</p>
    <hr />
    <p><small>QuizLab - Privacidad y Compliance</small></p>
  `;

  await sendEmail({
    to: email,
    subject: 'Confirma eliminación de tu cuenta QuizLab',
    text: `Confirma tu solicitud de eliminación en: ${confirmationLink}`,
    html,
  });
}

// Consent renewal email
export async function sendConsentRenewalEmail(
  email: string,
  renewalLink: string
): Promise<void> {
  const html = `
    <h1>Renovación de Consentimiento - QuizLab</h1>
    <p>Cada 90 días renovamos el consentimiento para asegurar que sigas de acuerdo con nuestras políticas.</p>
    <p>
      <a href="${renewalLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Revisar y Renovar Consentimiento
      </a>
    </p>
    <p>Si no renuevas en 7 días, desactivaremos servicios personalizados para proteger tu privacidad.</p>
    <hr />
    <p><small>QuizLab - Privacidad y Compliance</small></p>
  `;

  await sendEmail({
    to: email,
    subject: 'Renovación de Consentimiento - QuizLab',
    text: `Revisa tu consentimiento en: ${renewalLink}`,
    html,
  });
}

// Data breach notification email
export async function sendDataBreachNotificationEmail(
  email: string,
  affectedData: string[],
  contactEmail: string = 'security@quizlab.com'
): Promise<void> {
  const dataList = affectedData.map(d => `<li>${d}</li>`).join('');

  const html = `
    <h1>⚠️ Notificación de Brecha de Seguridad</h1>
    <p>Hemos detectado un incidente de seguridad que puede afectar tu información.</p>
    <p><strong>Datos potencialmente afectados:</strong></p>
    <ul>${dataList}</ul>
    <p><strong>Qué hicimos:</strong></p>
    <ul>
      <li>✓ Contenemos el incidente inmediatamente</li>
      <li>✓ Investigación completa en curso</li>
      <li>✓ Fortalecemos seguridad</li>
    </ul>
    <p><strong>Qué debes hacer:</strong></p>
    <ul>
      <li>📧 Cambia tu contraseña en QuizLab</li>
      <li>🔐 Revisa actividad sospechosa en tu cuenta</li>
      <li>📞 Contacta: ${contactEmail}</li>
    </ul>
    <p>Consulta nuestra <a href="https://quizlab.com/privacy/security">política de seguridad</a> para más detalles.</p>
    <hr />
    <p><small>QuizLab Security Team</small></p>
  `;

  await sendEmail({
    to: email,
    subject: '⚠️ Notificación de Incidente de Seguridad - QuizLab',
    text: `Se ha detectado un incidente de seguridad. Contacta: ${contactEmail}`,
    html,
  });
}

// GDPR request receipt email
export async function sendGDPRReceiptEmail(
  email: string,
  requestType: 'access' | 'deletion' | 'rectification',
  caseNumber: string
): Promise<void> {
  const requestNames = {
    access: 'Acceso a datos',
    deletion: 'Eliminación de datos',
    rectification: 'Rectificación de datos',
  };

  const html = `
    <h1>Confirmación de Solicitud GDPR</h1>
    <p>Hemos recibido tu solicitud de <strong>${requestNames[requestType]}</strong>.</p>
    <p><strong>Número de caso:</strong> ${caseNumber}</p>
    <p><strong>Próximos pasos:</strong></p>
    <ul>
      <li>Procesamos tu solicitud dentro de 30 días hábiles</li>
      <li>Te enviaremos actualizaciones a este email</li>
      <li>Puedes contactar con preguntas en: privacy@quizlab.com</li>
    </ul>
    <p>Derechos bajo GDPR Art. ${requestType === 'access' ? '15' : requestType === 'deletion' ? '17' : '16'}</p>
    <hr />
    <p><small>QuizLab - Compliance Team</small></p>
  `;

  await sendEmail({
    to: email,
    subject: `Solicitud GDPR Recibida - Caso #${caseNumber}`,
    text: `Tu solicitud ${requestNames[requestType]} ha sido recibida.`,
    html,
  });
}
