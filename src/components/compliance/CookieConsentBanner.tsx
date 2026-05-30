'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookieConsentBannerProps {
  onConsent?: (preferences: CookiePreferences) => void;
}

export default function CookieConsentBanner({ onConsent }: CookieConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user already gave consent
    const hasConsent = localStorage.getItem('cookie_consent');
    const consentTime = localStorage.getItem('cookie_consent_time');

    // Show banner if no consent OR if consent is older than 90 days
    if (!hasConsent) {
      setIsVisible(true);
    } else if (consentTime) {
      const consentDate = new Date(consentTime);
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      if (consentDate < ninetyDaysAgo) {
        setIsVisible(true);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allConsent: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    saveConsent(allConsent);
  };

  const handleNecessaryOnly = () => {
    const minimalConsent: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    saveConsent(minimalConsent);
  };

  const handleCustomize = () => {
    const customConsent: CookiePreferences = {
      ...preferences,
      necessary: true,
    };
    saveConsent(customConsent);
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie_consent', JSON.stringify(prefs));
    localStorage.setItem('cookie_consent_time', new Date().toISOString());

    // Set actual cookies only if consent given
    if (prefs.analytics) {
      initializeGoogleAnalytics();
    }
    if (prefs.marketing) {
      initializeMarketingCookies();
    }

    onConsent?.(prefs);
    setIsVisible(false);
  };

  const initializeGoogleAnalytics = () => {
    // Initialize Google Analytics only if consented
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (!win.gtag) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`;
        document.head.appendChild(script);

        win.dataLayer = win.dataLayer || [];
        function gtag(...args: any[]) {
          win.dataLayer.push(args);
        }
        win.gtag = gtag;
        gtag('js', new Date());
        gtag('config', process.env.NEXT_PUBLIC_GA_ID);
      }
    }
  };

  const initializeMarketingCookies = () => {
    // Initialize Facebook Pixel, etc.
    // Only if user consented to marketing cookies
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
      `;
      document.head.appendChild(script);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {!showDetails ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">🍪 Usamos Cookies</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Usamos cookies para personalizar contenido, mostrar anuncios relevantes y analizar nuestro tráfico.
                  {' '}
                  <a
                    href="/privacy/cookies"
                    className="underline hover:text-blue-400"
                  >
                    Lee nuestra Política de Cookies
                  </a>
                </p>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="flex-shrink-0 text-gray-400 hover:text-white"
                aria-label="Cerrar"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleNecessaryOnly}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-semibold text-sm transition"
              >
                ❌ Solo Necesarias
              </button>
              <button
                onClick={() => setShowDetails(true)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-semibold text-sm transition"
              >
                ⚙️ Personalizar
              </button>
              <button
                onClick={handleAcceptAll}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold text-sm transition"
              >
                ✅ Aceptar Todo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Personalizar Cookies</h3>

            <div className="space-y-3 bg-gray-800 p-4 rounded">
              {/* Necesarias - Always on */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">🔐 Cookies Necesarias</p>
                  <p className="text-xs text-gray-400">Mantienen la plataforma funcionando</p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="w-5 h-5"
                />
              </div>

              {/* Funcionales */}
              <div className="flex items-center justify-between border-t border-gray-700 pt-3">
                <div>
                  <p className="font-semibold">✨ Cookies Funcionales</p>
                  <p className="text-xs text-gray-400">Recuerdan tus preferencias (tema, idioma)</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) => setPreferences({...preferences, functional: e.target.checked})}
                  className="w-5 h-5"
                />
              </div>

              {/* Analíticas */}
              <div className="flex items-center justify-between border-t border-gray-700 pt-3">
                <div>
                  <p className="font-semibold">📊 Cookies Analíticas</p>
                  <p className="text-xs text-gray-400">Nos ayudan a entender cómo usas QuizLab</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                  className="w-5 h-5"
                />
              </div>

              {/* Marketing */}
              <div className="flex items-center justify-between border-t border-gray-700 pt-3">
                <div>
                  <p className="font-semibold">📢 Cookies de Marketing</p>
                  <p className="text-xs text-gray-400">Mostrar ads relevantes a tus intereses</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})}
                  className="w-5 h-5"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDetails(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-semibold text-sm transition"
              >
                ← Volver
              </button>
              <button
                onClick={handleCustomize}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold text-sm transition"
              >
                ✅ Guardar Preferencias
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
