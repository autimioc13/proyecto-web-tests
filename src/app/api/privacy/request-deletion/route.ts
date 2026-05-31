import { NextRequest, NextResponse } from 'next/server';

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

interface DeletionRequestPayload {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) as DeletionRequestPayload;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email válido requerido' },
        { status: 400 }
      );
    }

    // Dynamic imports to avoid Prisma client initialization at build time
    const { createDeletionRequest } = await import('@/lib/db/deletionRequest');
    const { sendDeletionConfirmationEmail } = await import('@/lib/email/sendgrid');

    // Get IP address from request headers
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create deletion request in database
    // Note: createDeletionRequest already calls createActivityLog internally
    const deletionRequest = await createDeletionRequest({
      email,
      ipAddress,
      userAgent,
    });

    // Send confirmation email
    await sendDeletionConfirmationEmail(
      email,
      deletionRequest.confirmationToken,
      48 // hours
    );

    console.log(`✓ Deletion request created: ${email}, token expires: ${deletionRequest.tokenExpiresAt}`);

    return NextResponse.json({
      success: true,
      message: 'Email de confirmación enviado',
      deletionRequestId: deletionRequest.id,
      email: email,
      expiresAt: deletionRequest.tokenExpiresAt,
      status: 'pending',
    });

  } catch (error) {
    console.error('Error in request-deletion:', error);

    // Check if it's a known error (e.g., duplicate pending request)
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { error: 'Ya existe una solicitud de eliminación pendiente para este email' },
        { status: 409 } // Conflict
      );
    }

    return NextResponse.json(
      { error: 'Error procesando solicitud de eliminación' },
      { status: 500 }
    );
  }
}
