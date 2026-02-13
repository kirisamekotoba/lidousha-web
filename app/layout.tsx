import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lidousha Music',
  description: '豆沙宝贝的歌单 - A collection of songs',
};

import { ToastProvider } from '../components/Toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
