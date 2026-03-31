// app/layout.jsx
import './globals.css';

export const metadata = {
  title:       'SenCompta IA — Comptabilité intelligente pour commerçants',
  description: 'Gérez votre boutique via WhatsApp. Analyse IA en français et wolof.',
  manifest:    '/manifest.json',
  themeColor:  '#0D1B14',
  icons:       { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
