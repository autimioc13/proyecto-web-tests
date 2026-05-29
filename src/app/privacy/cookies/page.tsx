'use client';

import { useState, useEffect } from 'react';
import { Cookie, Trash2 } from 'lucide-react';

interface CookieData {
  name: string;
  value: string;
  domain: string;
  expires: string;
  type: 'necessary' | 'functional' | 'analytics' | 'marketing';
}

export default function CookiesPage() {
  const [cookies, setCookies] = useState<CookieData[]>([]);
  const [preferences, setPreferences] = useState({
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Load user's current preferences
    const consent = localStorage.getItem('cookie_consent');
    if (consent) {
      try {
        const prefs = JSON.parse(consent);
        setPreferences({
          functional: prefs.functionalConsent || false,
          analytics: prefs.analyticsConsent || false,
          marketing: prefs.marketingConsent || false,
        });
      } catch (e) {
        console.error('Failed to parse preferences:', e);
      }
    }
  }, []);

  const handleToggle = (type: keyof typeof preferences) => {
    const updated = { ...preferences, [type]: !preferences[type] };
    setPreferences(updated);

    // Save to localStorage
    const current = localStorage.getItem('cookie_consent');
    const consent = current ? JSON.parse(current) : {};
    consent.functionalConsent = updated.functional;
    consent.analyticsConsent = updated.analytics;
    consent.marketingConsent = updated.marketing;
    consent.updatedAt = new Date().toISOString();

    localStorage.setItem('cookie_consent', JSON.stringify(consent));
    window.dispatchEvent(
      new CustomEvent('consent_updated', { detail: consent })
    );
  };

  const handleClearAllCookies = () => {
    if (confirm('¿Eliminar TODAS las cookies? Esto puede afectar la funcionalidad del sitio.')) {
      document.cookie.split(';').forEach((c) => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
      localStorage.clear();
      sessionStorage.clear();
      alert('✅ Cookies eliminadas. Recarga la página para continuar.');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
            <Cookie size={40} className="text-blue-600" />
            🍪 Gestionar Cookies
          </h1>
          <p className="text-lg text-gray-600">
            Aquí puedes ver y controlar todas las cookies que usamos en QuizLab.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r">
          <h3 className="font-bold text-blue-900 mb-2">📋 Políticas Relacionadas</h3>
          <p className="text-blue-800 text-sm mb-3">
            Para información completa sobre cómo usamos cookies:
          </p>
          <a
            href="/public/docs/COOKIES.md"
            target="_blank"
            className="text-blue-600 hover:underline font-semibold"
          >
            → Leer Política Completa de Cookies
          </a>
        </div>

        {/* Cookie Categories */}
        <div className="space-y-6 mb-12">
          {/* Necesarias */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">🔐 Cookies Necesarias</h3>
                <p className="text-gray-600 text-sm mt-1">Mantienen la plataforma funcionando</p>
              </div>
              <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                ACTIVADAS
              </div>
            </div>
            <p className="text-gray-700 text-sm mb-3">
              <strong>No se pueden desactivar.</strong> Estas cookies son esenciales para autenticación, seguridad y funcionalidad básica.
            </p>
            <div className="bg-gray-50 p-3 rounded text-xs font-mono text-gray-700">
              <p>• auth_token (24h) - Mantener sesión</p>
              <p>• session_id (sesión) - Sesión activa</p>
              <p>• csrf_token (sesión) - Protección CSRF</p>
            </div>
          </div>

          {/* Funcionales */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">✨ Cookies Funcionales</h3>
                <p className="text-gray-600 text-sm mt-1">Recuerdan tus preferencias personales</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.functional}
                onChange={() => handleToggle('functional')}
                className="w-6 h-6 cursor-pointer"
              />
            </div>
            <p className="text-gray-700 text-sm mb-3">
              Recordamos tu idioma, tema (claro/oscuro), tamaño de texto, y otras preferencias.
            </p>
            <div className="bg-gray-50 p-3 rounded text-xs font-mono text-gray-700">
              <p>• preferences (1 año) - Tema y configuración</p>
              <p>• lang (1 año) - Tu idioma preferido</p>
              <p>• accessibility_mode (1 año) - Modos accesibilidad</p>
            </div>
          </div>

          {/* Analíticas */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">📊 Cookies Analíticas</h3>
                <p className="text-gray-600 text-sm mt-1">Nos ayudan a entender cómo usas la plataforma</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={() => handleToggle('analytics')}
                className="w-6 h-6 cursor-pointer"
              />
            </div>
            <p className="text-gray-700 text-sm mb-3">
              Google Analytics recopila datos <strong>anonimizados</strong> sobre visitas, páginas populares, ubicación. NO guardamos tu email ni respuestas específicas.
            </p>
            <div className="bg-gray-50 p-3 rounded text-xs font-mono text-gray-700">
              <p>• _ga (2 años) - Google Analytics</p>
              <p>• _gid (24h) - Sesión actual</p>
              <p>• _gat (1 minuto) - Rate limiting</p>
            </div>
          </div>

          {/* Marketing */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">📢 Cookies de Marketing</h3>
                <p className="text-gray-600 text-sm mt-1">Mostrar anuncios relevantes a tus intereses</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={() => handleToggle('marketing')}
                className="w-6 h-6 cursor-pointer"
              />
            </div>
            <p className="text-gray-700 text-sm mb-3">
              Facebook, Google Ads, y otros usan cookies para retargeting. Si rechazas, verás anuncios menos relevantes.
            </p>
            <div className="bg-gray-50 p-3 rounded text-xs font-mono text-gray-700">
              <p>• _fbp (3 meses) - Facebook Pixel</p>
              <p>• marketing_id (1 año) - Retargeting</p>
              <p>• ads_conversion (1 año) - Conversiones</p>
            </div>
          </div>
        </div>

        {/* Opt-Out Tools */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🔗 Herramientas Globales de Opt-Out</h2>

          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900">Google Analytics</h3>
              <p className="text-gray-600 text-sm mb-2">
                Desactiva Google Analytics en TODOS los sitios web:
              </p>
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                className="text-blue-600 hover:underline text-sm font-semibold"
              >
                → Instalar extensión de opt-out de Google
              </a>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900">Publicidad en Google</h3>
              <p className="text-gray-600 text-sm mb-2">
                Gestiona anuncios personalizados en Google:
              </p>
              <a
                href="https://adssettings.google.com"
                target="_blank"
                className="text-blue-600 hover:underline text-sm font-semibold"
              >
                → Ir a Google Ads Settings
              </a>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900">Publicidad en Facebook</h3>
              <p className="text-gray-600 text-sm mb-2">
                Limita anuncios de Facebook y terceros:
              </p>
              <a
                href="https://www.facebook.com/ads/preferences"
                target="_blank"
                className="text-blue-600 hover:underline text-sm font-semibold"
              >
                → Ir a Facebook Ad Preferences
              </a>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900">Red de Publicidad (NAI)</h3>
              <p className="text-gray-600 text-sm mb-2">
                Opt-out de 100+ compañías de publicidad:
              </p>
              <a
                href="https://optout.networkadvertising.org"
                target="_blank"
                className="text-blue-600 hover:underline text-sm font-semibold"
              >
                → Network Advertising Initiative Opt-Out
              </a>
            </div>
          </div>
        </div>

        {/* Browser Instructions */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🌐 Borrar Cookies en tu Navegador</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Google Chrome</h3>
              <ol className="text-gray-700 text-sm space-y-1 ml-4 list-decimal">
                <li>Abre Configuración</li>
                <li>Ve a "Privacidad y seguridad" → "Cookies"</li>
                <li>Selecciona "Bloquear todas las cookies" o personaliza</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Safari</h3>
              <ol className="text-gray-700 text-sm space-y-1 ml-4 list-decimal">
                <li>Abre Preferencias</li>
                <li>Ve a "Privacidad"</li>
                <li>Selecciona "Bloquear todas las cookies"</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Firefox</h3>
              <ol className="text-gray-700 text-sm space-y-1 ml-4 list-decimal">
                <li>Abre Preferencias</li>
                <li>Ve a "Privacidad"</li>
                <li>Bajo "Cookies", selecciona "Personalizado"</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Microsoft Edge</h3>
              <ol className="text-gray-700 text-sm space-y-1 ml-4 list-decimal">
                <li>Abre Configuración</li>
                <li>Ve a "Privacidad" → "Cookies"</li>
                <li>Elige tu nivel de protección</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-r">
          <h2 className="text-2xl font-bold text-red-900 mb-4 flex items-center gap-2">
            <Trash2 size={28} />
            ⚠️ Zona de Peligro
          </h2>
          <p className="text-red-800 mb-4">
            Esto eliminará <strong>TODAS</strong> las cookies, incluyendo tu sesión de login. Deberás loguearte nuevamente.
          </p>
          <button
            onClick={handleClearAllCookies}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition"
          >
            🗑️ Eliminar Todas las Cookies
          </button>
        </div>
      </div>
    </div>
  );
}
