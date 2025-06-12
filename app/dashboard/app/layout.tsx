import React from 'react';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from './components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ping-Me | Keep Your Services Awake',
  description: 'Keep your web services and APIs awake and responsive with automatic pinging.',
  keywords: ['uptime', 'monitoring', 'ping', 'backend', 'free tier', 'render', 'railway', 'cyclic', 'vercel'],
  authors: [{ name: 'Eshank Tyagi' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ping-me.eshank.tech',
    title: 'Ping-Me - Keep Your Backends Alive',
    description: 'Monitor your backend services with automatic pinging to prevent sleep cycles on free hosting platforms.',
    siteName: 'Ping-Me',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ping-Me - Keep Your Backends Alive',
    description: 'Monitor your backend services with automatic pinging to prevent sleep cycles on free hosting platforms.',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
} 