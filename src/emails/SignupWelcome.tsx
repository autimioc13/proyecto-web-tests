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

interface SignupWelcomeProps {
  displayName: string;
  email: string;
}

export const SignupWelcome: React.FC<SignupWelcomeProps> = ({ displayName, email }) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://quizlab.com';
  const firstName = displayName.split(' ')[0];

  return (
    <Html>
      <Head />
      <Preview>Bienvenido a QuizLab</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={box}>
            <Row>
              <Column align="center">
                <Text style={heading}>🎯 Bienvenido a QuizLab</Text>
              </Column>
            </Row>
          </Section>

          {/* Content */}
          <Section style={box}>
            <Text style={paragraph}>¡Hola {firstName}!</Text>
            <Text style={paragraph}>
              Gracias por crear tu cuenta en QuizLab. Estamos emocionados de tenerte como parte
              de nuestra comunidad de aprendizaje.
            </Text>

            {/* Features Section */}
            <Section style={section}>
              <Text style={sectionTitle}>¿Qué puedes hacer ahora?</Text>

              <Row style={featureRow}>
                <Column style={featureIcon}>📚</Column>
                <Column style={featureContent}>
                  <Text style={featureTitle}>Accede a miles de quizzes</Text>
                  <Text style={featureDesc}>
                    Explora nuestro catálogo completo de quizzes interactivos sobre diversos
                    temas.
                  </Text>
                </Column>
              </Row>

              <Row style={featureRow}>
                <Column style={featureIcon}>🏆</Column>
                <Column style={featureContent}>
                  <Text style={featureTitle}>Gana puntos y logros</Text>
                  <Text style={featureDesc}>
                    Completa quizzes, suma experiencia y sube en los rankings.
                  </Text>
                </Column>
              </Row>

              <Row style={featureRow}>
                <Column style={featureIcon}>👥</Column>
                <Column style={featureContent}>
                  <Text style={featureTitle}>Compite con otros usuarios</Text>
                  <Text style={featureDesc}>
                    Desafía a otros jugadores y demuestra tus conocimientos.
                  </Text>
                </Column>
              </Row>

              <Row style={featureRow}>
                <Column style={featureIcon}>💎</Column>
                <Column style={featureContent}>
                  <Text style={featureTitle}>Acceso a contenido premium</Text>
                  <Text style={featureDesc}>
                    Compra cursos especializados y mantén tus aprendizajes actualizados.
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* CTA Button */}
            <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
              <Button style={button} href={`${baseUrl}/discover`}>
                Explorar Quizzes
              </Button>
            </Section>

            <Hr style={hr} />

            {/* Quick Tips */}
            <Section style={section}>
              <Text style={sectionTitle}>Consejos para empezar</Text>
              <ul style={list}>
                <li style={listItem}>
                  Completa tu perfil para tener una mejor experiencia personalizada
                </li>
                <li style={listItem}>Crea tu primer quiz para comenzar a ganar puntos</li>
                <li style={listItem}>Únete a nuestro Discord para conectar con la comunidad</li>
                <li style={listItem}>Lee nuestro blog para tips y estrategias de estudio</li>
              </ul>
            </Section>

            {/* Support */}
            <Section style={{ padding: '16px', backgroundColor: '#f0f4ff', borderRadius: '5px' }}>
              <Text style={{ ...paragraph, fontSize: '14px', margin: '0 0 8px 0' }}>
                ¿Preguntas? Nuestro equipo está aquí para ayudarte
              </Text>
              <Text style={{ ...paragraph, fontSize: '14px', margin: '0' }}>
                📧 Correo: support@quizlab.com | 💬 Chat: Disponible en tu panel
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
                  <Link href={`${baseUrl}/unsubscribe?email=${email}`} style={link}>
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

const heading = {
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '16px 0 0 0',
  color: '#1f2937',
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

const featureRow = {
  display: 'flex' as const,
  alignItems: 'flex-start' as const,
  marginBottom: '16px',
  paddingBottom: '16px',
  borderBottom: '1px solid #f0f0f0',
};

const featureIcon = {
  fontSize: '24px',
  marginRight: '12px',
  minWidth: '30px',
};

const featureContent = {
  flex: 1,
};

const featureTitle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 4px 0',
};

const featureDesc = {
  fontSize: '13px',
  color: '#6b7280',
  margin: '0',
};

const list = {
  margin: '16px 0',
  paddingLeft: '20px',
  color: '#525252',
  fontSize: '14px',
  lineHeight: '20px',
};

const listItem = {
  marginBottom: '8px',
};

const hr = {
  borderColor: '#e5e5e5',
  margin: '20px 0',
};

const button = {
  backgroundColor: '#7c3aed',
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
  color: '#7c3aed',
  textDecoration: 'underline',
};
