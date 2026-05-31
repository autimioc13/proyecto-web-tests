import { NextRequest, NextResponse } from 'next/server';

/**
 * GET/POST /api/privacy/confirm-deletion
 *
 * Confirm account deletion request (GDPR Art. 17 - Right to be Forgotten)
 * Part of 2-step process:
 * 1. User requests deletion
 * 2. We send confirmation email
 * 3. User clicks email link to confirm (this endpoint)
 * 4. We delete account + data within 24-48 hours
 *
 * Supports both:
 * - GET: from email confirmation link (?token=...)
 * - POST: from frontend form or API call ({ token: "..." })
 */

interface ConfirmDeletionRequest {
  token?: string;
}

async function handleConfirmation(token: string | null, request: NextRequest) {
  if (!token) {
    return NextResponse.json(
      { error: 'Token de confirmación requerido' },
      { status: 400 }
    );
  }

  // Dynamic imports to avoid Prisma client initialization at build time
  const { confirmDeletionRequest } = await import('@/lib/db/deletionRequest');
  const { createActivityLog } = await import('@/lib/db/activityLog');

  // Confirm the deletion request
  const deletionRequest = await confirmDeletionRequest(token);

  if (!deletionRequest) {
    return NextResponse.json(
      { error: 'Token inválido o expirado' },
      { status: 404 }
    );
  }

  // Get IP for audit logging
  const ipAddress = request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Log the confirmation activity
  await createActivityLog({
    userId: deletionRequest.email,
    activityType: 'confirm_account_deletion',
    resource: 'deletion_request',
    resourceId: deletionRequest.id,
    details: {
      email: deletionRequest.email,
      confirmedAt: deletionRequest.confirmedAt,
    },
    ipAddress,
    userAgent,
  });

  console.log(`✓ Deletion confirmed for ${deletionRequest.email}`);

  return NextResponse.json({
    success: true,
    message: 'Eliminación de cuenta confirmada. Tu cuenta será eliminada en 24-48 horas.',
    email: deletionRequest.email,
    status: 'confirmed',
    confirmedAt: deletionRequest.confirmedAt,
    nextSteps: 'Tu cuenta y datos personales serán eliminados en 24-48 horas. Recibirás un email de confirmación cuando se complete.',
  });
}

export async function GET(request: NextRequest) {
  try {
    // Get token from URL query parameter
    const token = request.nextUrl.searchParams.get('token');
    return await handleConfirmation(token, request);
  } catch (error) {
    console.error('Error in confirm-deletion GET:', error);
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  // Support both GET and POST for flexibility
  // POST: { "token": "..." }
  try {
    const body = (await request.json()) as ConfirmDeletionRequest;
    const token = body.token || null;
    return await handleConfirmation(token, request);
  } catch (error) {
    console.error('Error in confirm-deletion POST:', error);

    if (error instanceof Error && error.message.includes('Unexpected token')) {
      return NextResponse.json(
        { error: 'JSON inválido en request' },
        { status: 400 }
      );
    }

    return handleError(error);
  }
}

function handleError(error: unknown) {
  // Check for specific errors
  if (error instanceof Error) {
    if (error.message.includes('expired')) {
      return NextResponse.json(
        { error: 'El enlace de confirmación ha expirado. Solicita uno nuevo.' },
        { status: 410 } // Gone
      );
    }

    if (error.message.includes('Invalid')) {
      return NextResponse.json(
        { error: 'Token de confirmación inválido' },
        { status: 400 }
      );
    }

    if (error.message.includes('already')) {
      return NextResponse.json(
        { error: 'Esta solicitud ya ha sido confirmada' },
        { status: 409 } // Conflict
      );
    }
  }

  return NextResponse.json(
    { error: 'Error al confirmar eliminación' },
    { status: 500 }
  );
}
