'use client';

import { useState } from 'react';
import { Download, Trash2, Edit, Eye, Lock } from 'lucide-react';
import Link from 'next/link';

export default function MyRightsPage() {
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const rights = [
    {
      id: 'access',
      title: 'Derecho de Acceso (Right to Know)',
      description: 'Descarga todos tus datos en un formato legible',
      icon: Download,
      action: 'Descargar mis datos',
      color: 'blue',
      details: `
        ✅ Incluye: Email, perfil, historial de tests, compras
        ✅ Formato: ZIP con JSON, CSV
        ✅ Plazo: Inmediato
        ⏱️ Garantizado en 30 días (GDPR Art. 15)
      `
    },
    {
      id: 'rectification',
      title: 'Derecho de Rectificación (Right to Correct)',
      description: 'Corrige datos inexactos en tu cuenta',
      icon: Edit,
      action: 'Editar mis datos',
      color: 'green',
      details: `
        ✅ Puedes cambiar: Email, nombre, fecha de nacimiento
        ✅ Cambios inmediatos
        ✅ Historial de cambios guardado
        ⏱️ Garantizado en 30 días (GDPR Art. 16)
      `
    },
    {
      id: 'deletion',
      title: 'Derecho al Olvido (Right to Delete)',
      description: 'Solicita eliminación permanente de tu cuenta',
      icon: Trash2,
      action: 'Eliminar mi cuenta',
      color: 'red',
      details: `
        ✅ Elimina: Email, perfil, historial
        ⚠️ Excepto: Registros legales (7 años por ley)
        ⚠️ Irreversible: No se puede deshacer
        ⏱️ Garantizado en 30 días (GDPR Art. 17)
      `
    },
    {
      id: 'portability',
      title: 'Derecho de Portabilidad (Right to Export)',
      description: 'Obtén tus datos en formato transferible',
      icon: Lock,
      action: 'Exportar en formato estándar',
      color: 'purple',
      details: `
        ✅ Formatos: JSON, CSV, XML
        ✅ Estructura: Legible por otras plataformas
        ✅ Completo: Todos tus datos
        ⏱️ Garantizado en 30 días (GDPR Art. 20)
      `
    },
    {
      id: 'objection',
      title: 'Derecho de Objeción (Right to Opt-Out)',
      description: 'Rechaza ciertos tipos de procesamiento',
      icon: Eye,
      action: 'Gestionar preferencias',
      color: 'orange',
      details: `
        ✅ Puedes rechazar: Marketing, profiling, analytics
        ✅ Cambios inmediatos
        ✅ Sin penalizaciones
        ⏱️ Respuesta en 24 horas
      `
    },
  ];

  const handleExportData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/privacy/export', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quizlab-data-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Error descargando datos. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">👤 Tus Derechos de Privacidad</h1>
          <p className="text-lg text-gray-600">
            Tienes control total sobre tus datos. Aquí están todos tus derechos bajo GDPR, CCPA y Habeas Data.
          </p>
        </div>

        {/* Legal Framework Pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
            🇪🇺 GDPR (UE)
          </div>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
            🇺🇸 CCPA (California)
          </div>
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
            🇨🇴 Habeas Data (Colombia)
          </div>
        </div>

        {/* Rights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {rights.map((right) => {
            const Icon = right.icon;
            const bgColors: Record<string, string> = {
              blue: 'bg-blue-50 border-blue-200',
              green: 'bg-green-50 border-green-200',
              red: 'bg-red-50 border-red-200',
              purple: 'bg-purple-50 border-purple-200',
              orange: 'bg-orange-50 border-orange-200',
            };
            const btnColors: Record<string, string> = {
              blue: 'bg-blue-600 hover:bg-blue-700',
              green: 'bg-green-600 hover:bg-green-700',
              red: 'bg-red-600 hover:bg-red-700',
              purple: 'bg-purple-600 hover:bg-purple-700',
              orange: 'bg-orange-600 hover:bg-orange-700',
            };

            return (
              <div
                key={right.id}
                className={`border-2 rounded-lg p-6 transition ${bgColors[right.color]}`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <Icon size={32} className="text-gray-700 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{right.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{right.description}</p>
                  </div>
                </div>

                {selectedRight === right.id && (
                  <div className="bg-white bg-opacity-70 rounded p-4 mb-4 text-sm whitespace-pre-wrap text-gray-700 font-mono text-xs">
                    {right.details}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedRight(selectedRight === right.id ? null : right.id)}
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    {selectedRight === right.id ? '▼ Menos detalles' : '▶ Más detalles'}
                  </button>

                  {right.id === 'access' && (
                    <button
                      onClick={handleExportData}
                      disabled={loading}
                      className={`${btnColors[right.color]} text-white font-semibold py-2 px-4 rounded transition disabled:opacity-50`}
                    >
                      {loading ? 'Preparando...' : right.action}
                    </button>
                  )}
                  {right.id === 'rectification' && (
                    <Link
                      href="/account/edit-profile"
                      className={`${btnColors[right.color]} text-white font-semibold py-2 px-4 rounded transition text-center`}
                    >
                      {right.action}
                    </Link>
                  )}
                  {right.id === 'deletion' && (
                    <Link
                      href="/privacy/delete-account"
                      className={`${btnColors[right.color]} text-white font-semibold py-2 px-4 rounded transition text-center`}
                    >
                      {right.action}
                    </Link>
                  )}
                  {right.id === 'objection' && (
                    <Link
                      href="/account/preferences"
                      className={`${btnColors[right.color]} text-white font-semibold py-2 px-4 rounded transition text-center`}
                    >
                      {right.action}
                    </Link>
                  )}
                  {right.id === 'portability' && (
                    <button
                      onClick={handleExportData}
                      disabled={loading}
                      className={`${btnColors[right.color]} text-white font-semibold py-2 px-4 rounded transition disabled:opacity-50`}
                    >
                      {loading ? 'Exportando...' : right.action}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">❓ Preguntas Frecuentes</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">¿Cuánto tiempo tarda?</h3>
              <p className="text-gray-600">
                Garantizamos respuesta en 30 días (GDPR), pero generalmente procesamos en 24-48 horas.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">¿Hay costo?</h3>
              <p className="text-gray-600">
                ❌ No. Todos tus derechos son GRATIS. No pagamos menos o más por ejercer derechos.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">¿Qué pasa si no responden?</h3>
              <p className="text-gray-600">
                Puedes reportar a autoridades como AEPD (España), FTC (USA), o SIC (Colombia).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">¿Qué datos NO se eliminan?</h3>
              <p className="text-gray-600">
                ✅ Tus registros de pago (requerido por ley, 7 años)
                <br />
                ✅ Logs de seguridad (para auditoría, 1 año)
                <br />
                ✅ Órdenes judiciales (obligadas por ley)
              </p>
            </div>
          </div>
        </div>

        {/* Contact DPO */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">📧 Data Protection Officer (DPO)</h2>
          <p className="text-gray-600 mb-4">
            Si tienes inquietudes sobre privacidad, puedes contactar directamente a nuestro DPO:
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> dpo@quizlab.com</p>
            <p><strong>Teléfono:</strong> +57 601 234 5678</p>
            <p><strong>Correo postal:</strong> Cra 7 #123-45, Bogotá, Colombia</p>
          </div>
        </div>
      </div>
    </div>
  );
}
