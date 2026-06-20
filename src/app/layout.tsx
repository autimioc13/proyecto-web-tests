import type { ReactNode } from 'react';

// Root layout is a passthrough: the <html>/<body> live in app/[locale]/layout.tsx
// (required for next-intl locale routing).
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
