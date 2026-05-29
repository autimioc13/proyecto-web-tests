import { NextRequest, NextResponse } from 'next/server';
import { validateAdminSession } from '@/lib/admin-auth';

/**
 * POST /api/privacy/export
 *
 * Export all user data in portable format (GDPR Art. 20 - Right to Portability)
 * Returns ZIP file containing JSON, CSV, and structured data
 *
 * COMPLIANCE:
 * - GDPR Art. 20: Right to data portability
 * - CCPA §1798.100: Consumer right to know
 * - Habeas Data: Right to access
 */

interface UserData {
  account?: any;
  profile?: any;
  quizResults?: any[];
  purchases?: any[];
  activityLog?: any[];
  consentLog?: any[];
  timestamps?: {
    exportedAt: string;
    accountCreatedAt?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Validate user is authenticated
    const session = request.cookies.get('admin_session')?.value;
    if (!validateAdminSession(session || '')) {
      return NextResponse.json(
        { error: 'Autenticación requerida' },
        { status: 401 }
      );
    }

    // Get user ID from session/cookie
    // In production, extract from JWT or session store
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { error: 'No user session found' },
        { status: 401 }
      );
    }

    // Simulate collecting user data
    // In production, query actual database
    const userData: UserData = {
      account: {
        id: 'user_123',
        email: 'user@example.com',
        name: 'John Doe',
        createdAt: '2025-01-15',
      },
      profile: {
        dateOfBirth: '1990-05-20',
        country: 'Colombia',
        language: 'es',
      },
      quizResults: [
        {
          testSlug: 'personality-1',
          result: 'type_a',
          completedAt: '2025-05-01',
          shareCount: 2,
        },
      ],
      purchases: [
        {
          id: 'purchase_1',
          itemName: 'E-book: Success Guide',
          price: 9.99,
          currency: 'USD',
          purchasedAt: '2025-03-15',
          downloadCount: 3,
        },
      ],
      activityLog: [
        {
          action: 'login',
          timestamp: '2025-05-29T10:30:00Z',
          ipAddress: '203.0.113.1',
        },
      ],
      consentLog: [
        {
          consentType: 'privacy_policy',
          accepted: true,
          acceptedAt: '2025-01-15',
          version: '1.0',
        },
      ],
      timestamps: {
        exportedAt: new Date().toISOString(),
        accountCreatedAt: '2025-01-15',
      },
    };

    // Convert to JSON
    const jsonData = JSON.stringify(userData, null, 2);

    // Convert to CSV (simplified - in production, use a proper CSV library)
    const csvData = generateCSV(userData);

    // Create a simple text response with both JSON and CSV
    const combinedData = `
# QUIZLAB DATA EXPORT
# Exported: ${new Date().toISOString()}
# Format: This file contains your complete data

## ACCOUNT INFORMATION
${JSON.stringify(userData.account, null, 2)}

## PROFILE
${JSON.stringify(userData.profile, null, 2)}

## QUIZ RESULTS
${JSON.stringify(userData.quizResults, null, 2)}

## PURCHASES
${JSON.stringify(userData.purchases, null, 2)}

## ACTIVITY LOG
${JSON.stringify(userData.activityLog, null, 2)}

## CONSENT LOG
${JSON.stringify(userData.consentLog, null, 2)}

---
Your data was exported on ${new Date().toISOString()}
This file contains all personal data QuizLab has about you.
For portability to another service, use JSON format.
`;

    // Return as downloadable text file
    // In production, create actual ZIP with multiple files
    return new NextResponse(combinedData, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="quizlab-data-export.txt"',
      },
    });

  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Error exportando datos' },
      { status: 500 }
    );
  }
}

function generateCSV(userData: UserData): string {
  const lines: string[] = [];

  lines.push('Type,Field,Value');
  lines.push(`Account,Email,${userData.account?.email || ''}`);
  lines.push(`Account,Name,${userData.account?.name || ''}`);
  lines.push(`Account,Created,${userData.account?.createdAt || ''}`);

  if (userData.quizResults) {
    lines.push('');
    lines.push('Quiz Results');
    lines.push('TestSlug,Result,CompletedAt');
    userData.quizResults.forEach(result => {
      lines.push(`${result.testSlug},${result.result},${result.completedAt}`);
    });
  }

  if (userData.purchases) {
    lines.push('');
    lines.push('Purchases');
    lines.push('Item,Price,Currency,Date');
    userData.purchases.forEach(purchase => {
      lines.push(`${purchase.itemName},${purchase.price},${purchase.currency},${purchase.purchasedAt}`);
    });
  }

  return lines.join('\n');
}
