import { Resend } from 'resend';
import * as React from 'react';
import { render } from '@react-email/render';
import { OrderConfirmation, OrderItem } from '@/emails/OrderConfirmation';
import { SignupWelcome } from '@/emails/SignupWelcome';
import { PaymentSuccess } from '@/emails/PaymentSuccess';
import { PaymentFailed } from '@/emails/PaymentFailed';

// Lazily create the Resend client so importing this module never throws at
// build time when RESEND_API_KEY is not set (e.g. during Next "collect page
// data"). It only fails if an email is actually sent without a key.
let resendClient: Resend | null = null;
function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export interface EmailQueueItem {
  id?: string;
  user_id?: string;
  template: 'order_confirmation' | 'signup_welcome' | 'payment_success' | 'payment_failed';
  data: Record<string, any>;
  status?: 'pending' | 'sent' | 'failed';
  retry_count?: number;
  created_at?: string;
}

/**
 * Send email using Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@quizlab.com';

  try {
    const result = await getResend().emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      reply_to: options.replyTo,
    });

    if (result.error) {
      console.error(`✗ Error sending email to ${options.to}:`, result.error);
      throw new Error(`Resend error: ${result.error.message}`);
    }

    console.log(`✓ Email sent to ${options.to} (ID: ${result.data?.id})`);
  } catch (error) {
    console.error(`✗ Error sending email to ${options.to}:`, error);
    throw error;
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  items: OrderItem[],
  totalPrice: number
): Promise<void> {
  try {
    const html = await render(
      React.createElement(OrderConfirmation, {
        customerEmail,
        customerName,
        orderId,
        items,
        totalPrice,
      })
    );

    await sendEmail({
      to: customerEmail,
      subject: `Confirmación de Orden #${orderId} - QuizLab`,
      html,
    });
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
}

/**
 * Send signup welcome email
 */
export async function sendSignupWelcomeEmail(
  email: string,
  displayName: string
): Promise<void> {
  try {
    const html = await render(
      React.createElement(SignupWelcome, {
        email,
        displayName,
      })
    );

    await sendEmail({
      to: email,
      subject: 'Bienvenido a QuizLab',
      html,
    });
  } catch (error) {
    console.error('Error sending signup welcome email:', error);
    throw error;
  }
}

/**
 * Send payment success email
 */
export async function sendPaymentSuccessEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  amount: number,
  transactionId?: string
): Promise<void> {
  try {
    const html = await render(
      React.createElement(PaymentSuccess, {
        customerEmail,
        customerName,
        orderId,
        amount,
        transactionId,
      })
    );

    await sendEmail({
      to: customerEmail,
      subject: `Pago Confirmado - Orden #${orderId}`,
      html,
    });
  } catch (error) {
    console.error('Error sending payment success email:', error);
    throw error;
  }
}

/**
 * Send payment failed email
 */
export async function sendPaymentFailedEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  amount: number,
  reason?: string,
  retryUrl?: string
): Promise<void> {
  try {
    const html = await render(
      React.createElement(PaymentFailed, {
        customerEmail,
        customerName,
        orderId,
        amount,
        reason,
        retryUrl,
      })
    );

    await sendEmail({
      to: customerEmail,
      subject: `Pago No Procesado - Orden #${orderId}`,
      html,
    });
  } catch (error) {
    console.error('Error sending payment failed email:', error);
    throw error;
  }
}

/**
 * Generic email sender for templates
 */
export async function sendTemplateEmail(
  template: EmailQueueItem['template'],
  data: Record<string, any>
): Promise<void> {
  switch (template) {
    case 'order_confirmation':
      await sendOrderConfirmationEmail(
        data.customerEmail,
        data.customerName,
        data.orderId,
        data.items,
        data.totalPrice
      );
      break;
    case 'signup_welcome':
      await sendSignupWelcomeEmail(data.email, data.displayName);
      break;
    case 'payment_success':
      await sendPaymentSuccessEmail(
        data.customerEmail,
        data.customerName,
        data.orderId,
        data.amount,
        data.transactionId
      );
      break;
    case 'payment_failed':
      await sendPaymentFailedEmail(
        data.customerEmail,
        data.customerName,
        data.orderId,
        data.amount,
        data.reason,
        data.retryUrl
      );
      break;
    default:
      throw new Error(`Unknown email template: ${template}`);
  }
}
