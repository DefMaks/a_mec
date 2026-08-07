import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/lib/query-provider';

export const metadata: Metadata = {
  title: 'E-RDC Admin (Mon Espace Classe)',
  description: 'Portail d Administration Éducative RDC - Next.js 15 & Supabase',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
