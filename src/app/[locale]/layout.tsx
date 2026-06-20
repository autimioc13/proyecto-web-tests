import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { DEFAULT_METADATA } from '@/lib/metadata';
import { routing } from '@/i18n/routing';
import SidebarWrapper from '@/components/nav/SidebarWrapper';
import Footer from '@/components/Footer';
import CookieConsentBanner from '@/components/compliance/CookieConsentBanner';
import { SoundProvider } from '@/components/providers/SoundProvider';
import ThemeProvider from '@/components/providers/ThemeProvider';
import { CartProvider } from '@/lib/contexts/CartContext';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import '../globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  await params;
  return {
    ...DEFAULT_METADATA,
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: 'any' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
      other: [{ rel: 'manifest', url: '/manifest.json' }],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'QuizLab',
    },
    formatDetection: { telephone: false },
    // hreflang alternates for SEO across locales
    alternates: {
      languages: {
        es: '/',
        en: '/en',
        pt: '/pt',
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering for this locale
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="msapplication-TileColor" content="#8b5cf6" />

        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G_XXXXXXXXXX'}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || 'G_XXXXXXXXXX'}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body className="text-gray-900 dark:text-white antialiased bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <CartProvider>
              <ThemeProvider>
                <SoundProvider>
                  <SidebarWrapper />
                  <main className="min-h-screen relative z-10 md:ml-24">{children}</main>
                  <Footer />
                  <CookieConsentBanner />
                </SoundProvider>
              </ThemeProvider>
            </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
