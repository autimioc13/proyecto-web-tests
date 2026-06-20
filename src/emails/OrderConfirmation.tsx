import React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Column,
} from '@react-email/components';

export interface OrderItem {
  product_title: string;
  quantity: number;
  product_price: number;
}

interface OrderConfirmationProps {
  customerName: string;
  orderId: string;
  items: OrderItem[];
  totalPrice: number;
  customerEmail: string;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  customerName,
  orderId,
  items,
  totalPrice,
  customerEmail,
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://quizlab.com';

  return (
    <Html>
      <Head />
      <Preview>Gracias por tu compra en QuizLab</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={box}>
            <Row>
              <Column align="center">
                <Text style={heading}>🎯 QuizLab</Text>
              </Column>
            </Row>
          </Section>

          {/* Content */}
          <Section style={box}>
            <Text style={paragraph}>Hola {customerName},</Text>
            <Text style={paragraph}>
              ¡Gracias por tu compra en QuizLab! Tu orden ha sido confirmada exitosamente.
            </Text>

            {/* Order Details */}
            <Section style={section}>
              <Text style={sectionTitle}>Detalles de tu Orden</Text>
              <Table>
                <Tr>
                  <Td style={{ ...tableCell, fontWeight: 'bold', width: '50%' }}>
                    Producto
                  </Td>
                  <Td style={{ ...tableCell, fontWeight: 'bold', width: '20%' }}>
                    Cantidad
                  </Td>
                  <Td
                    style={{ ...tableCell, fontWeight: 'bold', textAlign: 'right', width: '30%' }}
                  >
                    Precio
                  </Td>
                </Tr>
                {items.map((item, idx) => (
                  <Tr key={idx}>
                    <Td style={tableCell}>{item.product_title}</Td>
                    <Td style={tableCell}>{item.quantity}</Td>
                    <Td style={{ ...tableCell, textAlign: 'right' }}>
                      ${(item.product_price / 100).toFixed(2)}
                    </Td>
                  </Tr>
                ))}
              </Table>

              <Hr style={hr} />

              <Row>
                <Column>
                  <Text style={{ ...paragraph, fontSize: '16px', fontWeight: 'bold' }}>
                    Total: ${(totalPrice / 100).toFixed(2)}
                  </Text>
                </Column>
              </Row>

              <Text style={{ ...paragraph, fontSize: '12px', color: '#666' }}>
                Número de Orden: <strong>{orderId}</strong>
              </Text>
            </Section>

            {/* CTA Button */}
            <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
              <Button style={button} href={`${baseUrl}/orders/${orderId}`}>
                Ver Mi Orden
              </Button>
            </Section>

            <Hr style={hr} />

            {/* Footer Info */}
            <Section style={section}>
              <Text style={{ ...paragraph, fontSize: '12px' }}>
                📧 Recibirás otro email cuando tu orden sea procesada.
              </Text>
              <Text style={{ ...paragraph, fontSize: '12px' }}>
                Si tienes preguntas, contáctanos en: support@quizlab.com
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
  marginBottom: '12px',
};

const Table = ({ children }: { children: React.ReactNode }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
    <tbody>{children}</tbody>
  </table>
);

const Tr = ({ children }: { children: React.ReactNode }) => (
  <tr style={{ borderBottom: '1px solid #e5e5e5' }}>{children}</tr>
);

const Td = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <td style={{ padding: '12px 0', ...style }}>{children}</td>
);

const tableCell = {
  padding: '12px 8px',
  fontSize: '14px',
  color: '#525252',
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
