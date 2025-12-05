import type { Metadata } from 'next';
import { Bangers, Nunito, Geist_Mono } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const bangers = Bangers({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bangers',
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'Wallet Roast - Get Savagely Roasted',
  description:
    'AI-powered crypto portfolio roasts. Enter your wallet address and get roasted based on your on-chain data. Powered by x402 and Grok AI.',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Wallet Roast - Get Roasted for $0.01',
    description: 'The dumbest x402 demo. Also the best one.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wallet Roast - Get Roasted for $0.01',
    description: 'The dumbest x402 demo. Also the best one.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bangers.variable} ${nunito.variable} ${geistMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
