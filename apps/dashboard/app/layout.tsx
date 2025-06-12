import { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ping-Me - Keep Your Backends Alive',
  description: 'Monitor your backend services with automatic pinging to prevent sleep cycles on free hosting platforms.',
  keywords: ['uptime', 'monitoring', 'ping', 'backend', 'free tier', 'render', 'railway', 'cyclic', 'vercel'],
  authors: [{ name: 'Eshank Tyagi' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ping-me.dev',
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
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
} 