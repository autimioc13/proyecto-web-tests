import Link from 'next/link';
import { FileText, AlertCircle, Clock } from 'lucide-react';

export default function PoliciesPage() {
  const policies = [
    {
      id: 'privacy',
      title: 'Política de Privacidad',
      emoji: '🔒',
      description: 'Cómo recopilamos, usamos y protegemos tus datos',
      compliance: ['GDPR', 'CCPA', 'Habeas Data'],
      lastUpdated: '29 de mayo de 2026',
      version: '1.0',
      file: 'PRIVACIDAD.md',
      highlights: [
        'Qué datos recolectamos',
        'Cómo usamos tu información',
        'Tus derechos (acceso, eliminación, etc)',
        'Cómo protegemos tus datos',
        'Cuánto tiempo guardamos datos',
      ]
    },
    {
      id: 'terms',
      title: 'Términos y Condiciones',
      emoji: '⚖️',
      description: 'Acuerdo legal entre tú y QuizLab',
      compliance: ['Derecho Español', 'Derecho Colombiano'],
      lastUpdated: '29 de mayo de 2026',
      version: '1.0',
      file: 'TERMINOS.md',
      highlights: [
        'Descripción del servicio',
        'Uso permitido y prohibido',
        'Limitación de responsabilidad',
        'Políticas de pago y reembolso',
        'Resolución de disputas',
      ]
    },
    {
      id: 'cookies',
      title: 'Política de Cookies',
      emoji: '🍪',
      description: 'Cómo usamos cookies y tecnologías similares',
      compliance: ['GDPR', 'CCPA', 'ePrivacy'],
      lastUpdated: '29 de mayo de 2026',
      version: '1.0',
      file: 'COOKIES.md',
      highlights: [
        'Qué son las cookies',
        'Tipos de cookies que usamos',
        'Tu consentimiento',
        'Cómo gestionar cookies',
        'Opt-out de tracking',
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">📋 Políticas Legales</h1>
          <p className="text-lg text-gray-600">
            Aquí encontrarás todos los documentos legales de QuizLab. Léelos detenidamente para entender tus derechos y responsabilidades.
          </p>
        </div>

        {/* Compliance Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r">
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">✅ Compliant con regulaciones globales</h3>
              <p className="text-blue-800 text-sm">
                Nuestras políticas cumplen con GDPR (UE), CCPA (California), Habeas Data (Colombia), y otras regulaciones internacionales de privacidad.
              </p>
            </div>
          </div>
        </div>

        {/* Policies Grid */}
        <div className="space-y-6 mb-12">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition border border-gray-200 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                      <span>{policy.emoji}</span>
                      {policy.title}
                    </h2>
                    <p className="text-gray-600">{policy.description}</p>
                  </div>
                  <FileText size={32} className="text-gray-400 flex-shrink-0" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-6 mb-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={16} />
                    Actualizado: {policy.lastUpdated}
                  </div>
                  <div className="text-gray-600">v{policy.version}</div>
                  <div className="flex gap-2">
                    {policy.compliance.map((comp) => (
                      <span
                        key={comp}
                        className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold"
                      >
                        ✅ {comp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Highlights */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Lo que encontrarás:</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {policy.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={`/docs/${policy.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition text-center"
                  >
                    📖 Leer Completo
                  </a>
                  <a
                    href={`/api/policies/download?file=${policy.file}`}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded transition text-center"
                  >
                    📥 Descargar PDF
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Resources */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📚 Recursos Adicionales</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Gestiona tu Consentimiento</h3>
              <Link
                href="/privacy/cookies"
                className="text-blue-600 hover:underline"
              >
                → Cambiar preferencias de cookies
              </Link>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Ejerce tus Derechos</h3>
              <Link
                href="/privacy/my-rights"
                className="text-blue-600 hover:underline"
              >
                → Descargar datos, eliminar cuenta, etc.
              </Link>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Data Processing Agreement</h3>
              <Link
                href="/docs/DPA.md"
                className="text-blue-600 hover:underline"
              >
                → Para contratantes empresariales
              </Link>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Contacta al DPO</h3>
              <p className="text-gray-600 text-sm">
                Preguntas sobre privacidad?{' '}
                <a href="mailto:dpo@quizlab.com" className="text-blue-600 hover:underline">
                  dpo@quizlab.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
