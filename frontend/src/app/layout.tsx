import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hydration from '@/components/Hydration';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['cyrillic'] });

export const metadata: Metadata = {
  title: 'eMarket - Интернет-магазин',
  description: 'Лучший интернет-магазин с широким ассортиментом товаров',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${inter.className} bg-gray-50 min-h-screen flex flex-col`}>
        <Hydration>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Hydration>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
