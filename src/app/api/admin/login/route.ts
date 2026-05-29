import { NextRequest, NextResponse } from 'next/server';
import { isValidPassword, createAdminSession } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Contraseña requerida' },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    // Crear sesión
    const session = createAdminSession();

    // Crear response con cookie
    const response = NextResponse.json({
      success: true,
      message: 'Sesión iniciada',
    });

    // Configurar cookie segura
    response.cookies.set('admin_session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 horas
      path: '/admin',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: `Error: ${error instanceof Error ? error.message : 'Unknown'}` },
      { status: 500 }
    );
  }
}
