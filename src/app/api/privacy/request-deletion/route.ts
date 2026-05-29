import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * POST /api/privacy/request-deletion
 *
 * Request account deletion (GDPR Art. 17 - Right to be Forgotten)
 * 2-step process:
 * 1. User requests deletion via form
 * 2. We send confirmation email
 * 3. User clicks email link to confirm
 * 4. We delete account + data
 */

interface DeletionRequest {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) as DeletionRequest;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email válido requerido' },
        { status: 400 }
      );
    }

    // Generate confirmation token (valid for 48 hours)
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    // In production, store this in database:
    // await db.deletionRequests.create({
    //   email,
    //   confirmationToken,
    //   expiresAt,
    //   createdAt: new Date().toISOString(),
    // });

    // In production, send email via SendGrid:
    // await sendDeleteConfirmationEmail({
    //   email,
    //   confirmationLink: `https://quizlab.com/api/privacy/confirm-deletion?token=${confirmationToken}`,
    //   expiresIn: '48 hours'
    // });

    console.log(`[DELETION REQUEST] Email: ${email}, Token: ${confirmationToken}, Expires: ${expiresAt}`);

    return NextResponse.json({
      success: true,
      message: 'Email de confirmación enviado',
      expiresAt,
    });

  } catch (error) {
    console.error('Error in request-deletion:', error);
    return NextResponse.json(
      { error: 'Error procesando solicitud' },
      { status: 500 }
    );
  }
}
