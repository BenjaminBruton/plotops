import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PlotOps - Film Production ERP',
  description: 'Cradle-to-Grave Film Production Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full font-sans antialiased">{children}</body>
    </html>
  );
}