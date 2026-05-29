'use client';

import { useState } from 'react';
import { AlertTriangle, Mail, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function DeleteAccountPage() {
  const [step, setStep] = useState<'info' | 'confirm' | 'email' | 'success'>('info');
  const [email, setEmail] = useState('');
  const [agreeToDelete, setAgreeToDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestDeletion = async () => {
    if (!email || !agreeToDelete) {
      setError('Debes completar todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/privacy/request-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Error al solicitar eliminación');
      }

      setStep('email');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-red-900 mb-3 flex items-center gap-3">
            <AlertTriangle size={40} className="text-red-600" />
            🗑️ Eliminar mi Cuenta
          </h1>
          <p className="text-lg text-gray-600">
            Solicita la eliminación permanente de tu cuenta y todos tus datos.
          </p>
        </div>

        {/* Step 1: Information */}
        {step === 'info' && (
          <div className="space-y-6">
            {/* Warning Box */}
            <div className="bg-red-50 border-2 border-red-300 p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-red-900 mb-4">⚠️ Esto es Permanente</h2>
              <ul className="space-y-3 text-red-800">
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold">❌</span>
                  <span>Todos tus datos serán <strong>eliminados permanentemente</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold">❌</span>
                  <span>Tu cuenta será <strong>cerrada para siempre</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold">❌</span>
                  <span>No podrás recuperar tu historial de tests o compras</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold">✅</span>
                  <span>Registros legales se guardarán por 7 años (requerimiento fiscal)</span>
                </li>
              </ul>
            </div>

            {/* What Stays vs What Goes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                <h3 className="font-bold text-red-900 mb-4">🗑️ Se Elimina</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>✅ Nombre y email</li>
                  <li>✅ Perfil y foto</li>
                  <li>✅ Historial de tests</li>
                  <li>✅ Compras y downloads</li>
                  <li>✅ Actividad de navegación</li>
                  <li>✅ Preferencias personales</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <h3 className="font-bold text-blue-900 mb-4">📋 Se Mantiene (Legal)</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>📊 Datos agregados anónimizados</li>
                  <li>💰 Registros de pago (7 años - fisco)</li>
                  <li>🛡️ Logs de seguridad (1 año)</li>
                  <li>📜 Órdenes judiciales (si aplica)</li>
                  <li className="text-xs text-gray-600">
                    = No te identificamos, solo números
                  </li>
                </ul>
              </div>
            </div>

            {/* Alternatives */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r">
              <h3 className="font-bold text-blue-900 mb-3">💡 Alternativas</h3>
              <p className="text-blue-800 text-sm mb-3">
                Si solo quieres pausar, puedes:
              </p>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li>✅ <strong>Desactivar</strong> tu cuenta (puedes reactivarla después)</li>
                <li>✅ <strong>Cambiar</strong> tus preferencias de email</li>
                <li>✅ <strong>Desuscribirse</strong> del marketing</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setStep('confirm')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded transition"
              >
                🗑️ Continuar con Eliminación
              </button>
              <Link
                href="/account"
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition text-center"
              >
                Volver a Cuenta
              </Link>
            </div>
          </div>
        )}

        {/* Step 2: Confirmation */}
        {step === 'confirm' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirma tu Eliminación</h2>

              {/* Email Input */}
              <div className="mb-6">
                <label className="block text-gray-900 font-semibold mb-2">
                  Email de tu cuenta:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Checkbox Confirm */}
              <div className="mb-6 p-4 bg-red-50 rounded border-2 border-red-300">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeToDelete}
                    onChange={(e) => setAgreeToDelete(e.target.checked)}
                    className="w-5 h-5 mt-1"
                  />
                  <span className="text-gray-900">
                    <strong>Entiendo que esta acción es permanente e irreversible.</strong> He leído todo y quiero eliminar mi cuenta y datos personales.
                  </span>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-800">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleRequestDeletion}
                  disabled={!agreeToDelete || !email || loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded transition disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Enviando...' : '🗑️ Eliminar mi Cuenta'}
                </button>
                <button
                  onClick={() => setStep('info')}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition"
                >
                  ← Volver
                </button>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r text-sm text-blue-800">
              <strong>Nota legal:</strong> Al solicitar eliminación, tienes derecho a ser olvidado bajo GDPR Art. 17. Responderemos en máximo 30 días. Necesitarás confirmar por email.
            </div>
          </div>
        )}

        {/* Step 3: Email Confirmation */}
        {step === 'email' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <Mail size={64} className="mx-auto text-blue-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifica tu Email</h2>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r mb-8">
                <p className="text-gray-900 mb-4">
                  ✉️ Hemos enviado un email de confirmación a:
                </p>
                <p className="text-lg font-bold text-blue-600 mb-4">{email}</p>

                <p className="text-gray-700 text-sm">
                  <strong>Qué hacer ahora:</strong>
                </p>
                <ol className="list-decimal ml-5 text-gray-700 text-sm space-y-2 mt-2">
                  <li>Abre tu email</li>
                  <li>Busca mensaje de "QuizLab - Confirma Eliminación"</li>
                  <li>Haz clic en el enlace de confirmación</li>
                  <li>Tu cuenta será eliminada en 24-48 horas</li>
                </ol>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r mb-8">
                <p className="text-yellow-800">
                  <strong>⏰ Tiempo limite:</strong> El enlace de confirmación expira en 48 horas. Si no confirmas, no se eliminará nada.
                </p>
              </div>

              <div className="bg-gray-100 p-6 rounded text-center">
                <p className="text-gray-700 mb-4">¿No ves el email?</p>
                <ul className="text-gray-700 text-sm space-y-2">
                  <li>✅ Revisa la carpeta de spam/junk</li>
                  <li>✅ Espera 5 minutos (puede tardar)</li>
                  <li>✅ Contacta: privacy@quizlab.com</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold text-green-900 mb-4">
                Solicitud Recibida
              </h2>
              <p className="text-gray-700 mb-6">
                Tu solicitud de eliminación ha sido recibida. Te enviaremos un email de confirmación.
              </p>

              <Link
                href="/"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded transition"
              >
                ← Volver al Inicio
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
