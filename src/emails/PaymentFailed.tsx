import React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Column,
} from '@react-email/components';

interface PaymentFailedProps {
  customerName: string;
  orderId: string;
  amount: number;
  customerEmail: string;
  reason?: string;
  retryUrl?: string;
}

export const PaymentFailed: React.FC<PaymentFailedProps> = ({
  customerName,
  orderId,
  amount,
  customerEmail,
  reason = 'Fondos insuficientes o datos inválidos',
  retryUrl,
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://quizlab.com';

  return (
    <Html>
      <Head />
      <Preview>Tu pago no pudo ser procesado</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={box}>
            <Row>
              <Column align="center">
                <Text style={heading}>⚠️ Pago No Procesado</Text>
              </Column>
            </Row>
          </Section>

          {/* Content */}
          <Section style={box}>
            <Text style={paragraph}>Hola {customerName},</Text>
            <Text style={paragraph}>
              Lamentablemente, tu pago no pudo ser procesado. Tu orden sigue pendiente, pero no
              te preocupes, puedes intentarlo de nuevo en cualquier momento.
            </Text>

            {/* Payment Details */}
            <Section style={section}>
              <Text style={sectionTitle}>Detalles del Intento de Pago</Text>

              <Row style={detailRow}>
                <Column style={detailLabel}>Orden:</Column>
                <Column style={detailValue}>{orderId}</Column>
              </Row>

              <Row style={detailRow}>
                <Column style={detailLabel}>Monto:</Column>
                <Column style={detailValue}>${(amount / 100).toFixed(2)}</Column>
              </Row>

              <Row style={detailRow}>
                <Column style={detailLabel}>Fecha:</Column>
                <Column style={detailValue}>{new Date().toLocaleDateString('es-ES')}</Column>
              </Row>

              <Row style={detailRow}>
                <Column style={detailLabel}>Estado:</Column>
                <Column style={detailValue}>
                  <span style={errorBadge}>✗ Fallido</span>
                </Column>
              </Row>
            </Section>

            {/* Reason */}
            <Section style={reasonSection}>
              <Text style={sectionTitle}>Razón del Rechazo</Text>
              <Text style={{ ...paragraph, margin: '0', color: '#dc2626', fontWeight: 'bold' }}>
                {reason}
              </Text>
            </Section>

            {/* Solutions */}
            <Section style={section}>
              <Text style={sectionTitle}>¿Qué puedes hacer?</Text>
              <ol style={list}>
                <li style={listItem}>Verifica que tu información de pago sea correcta</li>
                <li style={listItem}>Asegúrate de tener fondos suficientes en tu cuenta</li>
                <li style={listItem}>Intenta con otro método de pago (tarjeta, PayPal, etc.)</li>
                <li style={listItem}>Contacta con tu banco si el problema persiste</li>
              </ol>
            </Section>

            {/* CTA Button */}
            <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
              <Button style={button} href={retryUrl || `${baseUrl}/checkout?orderId=${orderId}`}>
                Reintentar Pago
              </Button>
            </Section>

            <Hr style={hr} />

            {/* Support */}
            <Section style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '5px' }}>
              <Text style={{ ...paragraph, fontSize: '14px', margin: '0 0 8px 0', color: '#991b1b' }}>
                ¿Necesitas ayuda?
              </Text>
              <Text style={{ ...paragraph, fontSize: '14px', margin: '0', color: '#7f1d1d' }}>
                Nuestro equipo de soporte está disponible para ayudarte: support@quizlab.com
              </Text>
            </Section>

            {/* Info */}
            <Section style={{ padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '5px', marginTop: '16px' }}>
              <Text
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '0',
                  lineHeight: '18px',
                }}
              >
                Tu orden seguirá en tu carrito durante 7 días. Después de ese tiempo, se
                eliminará automáticamente.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Row>
              <Column align="center">
                <Text style={footerText}>
                  © 2026 QuizLab. Todos los derechos reservados.
                </Text>
                <Text style={footerLinks}>
                  <Link href={`${baseUrl}/terms`} style={link}>
                    Términos
                  </Link>
                  {' | '}
                  <Link href={`${baseUrl}/privacy`} style={link}>
                    Privacidad
                  </Link>
                  {' | '}
                  <Link href={`${baseUrl}/unsubscribe?email=${customerEmail}`} style={link}>
                    Desuscribirse
                  </Link>
                </Text>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,Cantarell,"Open Sans","Helvetica","Arial",sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  marginBottom: '64px',
  marginTop: '32px',
  marginLeft: '8px',
  marginRight: '8px',
  borderRadius: '5px',
  overflow: 'hidden' as const,
};

const box = {
  padding: '24px',
};

const section = {
  padding: '24px',
  border: '1px solid #e5e5e5',
  borderRadius: '5px',
  marginBottom: '24px',
};

const reasonSection = {
  padding: '16px',
  backgroundColor: '#fee2e2',
  border: '1px solid #fecaca',
  borderRadius: '5px',
  marginBottom: '24px',
};

const heading = {
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '16px 0 0 0',
  color: '#dc2626',
};

const paragraph = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  margin: '16px 0',
};

const sectionTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
  marginBottom: '16px',
};

const detailRow = {
  display: 'flex' as const,
  justifyContent: 'space-between' as const,
  paddingBottom: '12px',
  borderBottom: '1px solid #f0f0f0',
};

const detailLabel = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#6b7280',
  width: '40%',
};

const detailValue = {
  fontSize: '14px',
  color: '#1f2937',
  fontWeight: 'bold',
};

const errorBadge = {
  display: 'inline-block',
  padding: '4px 12px',
  backgroundColor: '#fee2e2',
  color: '#dc2626',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: 'bold',
};

const list = {
  margin: '16px 0',
  paddingLeft: '20px',
  color: '#525252',
  fontSize: '14px',
  lineHeight: '22px',
};

const listItem = {
  marginBottom: '8px',
};

const hr = {
  borderColor: '#e5e5e5',
  margin: '20px 0',
};

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  maxWidth: '200px',
  margin: '0 auto',
};

const footer = {
  backgroundColor: '#f6f9fc',
  padding: '24px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  margin: '0',
};

const footerLinks = {
  color: '#8898aa',
  fontSize: '12px',
  margin: '8px 0 0 0',
};

const link = {
  color: '#dc2626',
  textDecoration: 'underline',
};
