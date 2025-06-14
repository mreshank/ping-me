'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';

export default function Header() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">Ping-Me</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link 
              href="/features" 
              className={isActive('/features') 
                ? "text-foreground" 
                : "transition-colors hover:text-foreground/80 text-foreground/60"}
            >
              Features
            </Link>
            <Link 
              href="/pricing" 
              className={isActive('/pricing') 
                ? "text-foreground" 
                : "transition-colors hover:text-foreground/80 text-foreground/60"}
            >
              Pricing
            </Link>
            <Link 
              href="/docs" 
              className={isActive('/docs') 
                ? "text-foreground" 
                : "transition-colors hover:text-foreground/80 text-foreground/60"}
            >
              Documentation
            </Link>
            <Link 
              href="/dashboard" 
              className={isActive('/dashboard') 
                ? "text-foreground" 
                : "transition-colors hover:text-foreground/80 text-foreground/60"}
            >
              Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center">
            <ThemeToggle />
            {!isActive('/signup') && (
              <Link href="/signup" className="ml-4 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 