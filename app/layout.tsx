import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/toast/ToastProvider';

export const metadata: Metadata = {
  title: 'ATS Careers Pages',
  description: 'Build beautiful branded careers pages for your company',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
