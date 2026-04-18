import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HindiTranslator from '@/components/HindiTranslator';
import Script from 'next/script';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'DeshKhoj — Desh ki Soch, Bharat ki Khoj',
    template: '%s | DeshKhoj',
  },
  description:
    'DeshKhoj is India\'s premier local business directory. Find restaurants, hospitals, plumbers, electricians and more in your city with one search.',
  keywords: ['local business directory', 'India business search', 'DeshKhoj', 'JustDial alternative', 'find business near me', 'local services India'],
  authors: [{ name: 'DeshKhoj Team' }],
  creator: 'DeshKhoj',
  publisher: 'DeshKhoj',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://deshkhoj.com'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://deshkhoj.com',
    siteName: 'DeshKhoj',
    title: 'DeshKhoj — Desh ki Soch, Bharat ki Khoj',
    description: 'Find local businesses, services and products near you in India.',
    images: [{ url: '/logo.jpg', width: 400, height: 100, alt: 'DeshKhoj Logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeshKhoj — Local Business Directory India',
    description: 'Discover local businesses and services near you across India.',
    images: ['/logo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <HindiTranslator />
      </body>
    </html>
  );
}
