import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { validateAdminSession } from '@/lib/admin-auth';
import AITestGenerator from '@/components/admin/AITestGenerator';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Generador de Tests - Admin',
};

export default async function AdminGeneratePage() {
  // Verificar autenticación
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value;

  if (!validateAdminSession(session || '')) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/admin/analytics" className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
            <ArrowLeft size={16} />
            Volver al Dashboard
          </Link>
        </div>

        {/* Contenido */}
        <AITestGenerator />

        {/* Footer con instrucciones */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-3">📖 Instrucciones de Uso</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✅ <strong>Describe</strong> qué tests quieres crear</li>
            <li>⚡ Claude IA los <strong>genera automáticamente</strong></li>
            <li>📋 Se muestran en <strong>preview con validación</strong></li>
            <li>📥 Haz clic en <strong>Importar al Store</strong></li>
            <li>🚀 Corre <strong>npm run build</strong> para publicar</li>
          </ul>

          <div className="mt-4 p-3 bg-white rounded border border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>Nota:</strong> Los tests se validan automáticamente antes de importar.
              Ningún test malformado llegará a producción.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
