import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { DEFAULT_METADATA } from '@/lib/metadata';
import Navigation from '@/components/nav/Navigation';
import Sidebar from '@/components/nav/Sidebar';
import Footer from '@/components/Footer';
import CookieConsentBanner from '@/components/compliance/CookieConsentBanner';
import AnimatedGradient from '@/components/backgrounds/AnimatedGradient';
import { SoundProvider } from '@/components/providers/SoundProvider';
import ThemeProvider from '@/components/providers/ThemeProvider';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  ...DEFAULT_METADATA,
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'manifest',
        url: '/manifest.json',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'QuizLab',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Favicon and theme colors */}
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
      <body className="text-gray-900 antialiased">
        <ThemeProvider>
          <SoundProvider>
            <AnimatedGradient>
              <Navigation />
              <Sidebar />
              <main className="min-h-screen relative z-10 md:ml-24">{children}</main>
              <Footer />
              <CookieConsentBanner />
            </AnimatedGradient>
          </SoundProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
