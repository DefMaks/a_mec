import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/lib/query-provider';
import { APP_NAME, APP_SHORT_NAME } from '@/lib/config';

export const metadata: Metadata = {
  title: `${APP_NAME} (${APP_SHORT_NAME}) - E-RDC Admin`,
  description: `Portail d'Administration Éducative RDC - ${APP_NAME} (${APP_SHORT_NAME})`,
  icons: {
    icon: '/stem.avif',
    shortcut: '/stem.avif',
    apple: '/stem.avif',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="light">
      <body className="bg-[#F8FAFC] text-[#1E293B] min-h-screen">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
