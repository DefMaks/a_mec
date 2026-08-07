import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/lib/query-provider';
import { APP_NAME, APP_SHORT_NAME } from '@/lib/config';

export const metadata: Metadata = {
  title: `${APP_NAME} (${APP_SHORT_NAME}) - E-RDC Admin`,
  description: `Portail d Administration Éducative RDC - ${APP_NAME} (${APP_SHORT_NAME})`,
};

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="fr" className="dark">
//       <body className="bg-slate-950 text-slate-100 min-h-screen">
//         <QueryProvider>{children}</QueryProvider>
//       </body>
//     </html>
//   );
// }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body
        className="bg-slate-950 text-slate-100 min-h-screen"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
