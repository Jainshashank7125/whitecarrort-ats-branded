import type { Metadata } from 'next';
import './globals.css';

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
