import Link from 'next/link';

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-6 overflow-x-auto">
            <Link href="/privacy/policies" className="text-sm font-semibold text-gray-900 hover:text-blue-600 whitespace-nowrap">
              📋 Políticas
            </Link>
            <Link href="/privacy/cookies" className="text-sm font-semibold text-gray-900 hover:text-blue-600 whitespace-nowrap">
              🍪 Cookies
            </Link>
            <Link href="/privacy/my-rights" className="text-sm font-semibold text-gray-900 hover:text-blue-600 whitespace-nowrap">
              👤 Tus Derechos
            </Link>
            <Link href="/privacy/delete-account" className="text-sm font-semibold text-gray-900 hover:text-blue-600 whitespace-nowrap">
              🗑️ Eliminar Cuenta
            </Link>
          </nav>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
