'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
// import { ThemeToggle } from '@/components/theme-toggle';
import { useState } from 'react';

type BillingPeriod = 'monthly' | 'yearly';

interface Plan {
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  cta: string;
  highlight: boolean;
}

export default function Pricing(): React.ReactElement {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

  const plans: Plan[] = [
    {
      name: 'Free',
      description: 'For personal projects and small applications',
      price: {
        monthly: 0,
        yearly: 0
      },
      features: [
        'Up to 3 endpoints',
        '5-minute ping interval',
        'Email notifications',
        '24-hour metrics history',
        'Community support'
      ],
      cta: 'Get Started',
      highlight: false
    },
    {
      name: 'Pro',
      description: 'For professional developers and small teams',
      price: {
        monthly: 9,
        yearly: 90
      },
      features: [
        'Up to 20 endpoints',
        '1-minute ping interval',
        'Email & webhook notifications',
        '30-day metrics history',
        'Priority support'
      ],
      cta: 'Subscribe Now',
      highlight: true
    },
    {
      name: 'Business',
      description: 'For businesses with multiple services',
      price: {
        monthly: 29,
        yearly: 290
      },
      features: [
        'Unlimited endpoints',
        '30-second ping interval',
        'All notification channels',
        '90-day metrics history',
        '24/7 dedicated support'
      ],
      cta: 'Contact Sales',
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-xl">Ping-Me</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/features" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Features
              </Link>
              <Link href="/pricing" className="text-foreground">
                Pricing
              </Link>
              <Link href="/docs" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Documentation
              </Link>
              <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Dashboard
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="flex items-center">
              <ThemeToggle />
              <Link href="/signup" className="ml-4 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container py-12 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Simple, Transparent Pricing</h1>
          <p className="mt-4 text-muted-foreground md:text-xl">Choose the plan that's right for you</p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-muted p-1 rounded-lg">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                billingPeriod === 'yearly'
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly <span className="text-xs text-primary">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg border bg-card shadow-sm overflow-hidden ${
                plan.highlight ? 'border-primary/50 ring-1 ring-primary/50' : 'border-border'
              }`}
            >
              {plan.highlight && (
                <div className="bg-primary py-1 text-center text-xs font-medium text-primary-foreground">
                  MOST POPULAR
                </div>
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold">{plan.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold">
                    ${plan.price[billingPeriod]}
                  </span>
                  <span className="ml-1 text-muted-foreground">
                    {plan.price[billingPeriod] > 0 ? `/${billingPeriod === 'monthly' ? 'mo' : 'yr'}` : ''}
                  </span>
                </div>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <svg
                        className="h-5 w-5 text-primary flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link
                    href="/signup"
                    className={`w-full inline-flex justify-center items-center rounded-md py-2 px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${
                      plan.highlight
                        ? 'bg-primary text-primary-foreground shadow hover:bg-primary/90'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold mb-2">What happens if I exceed my plan's limits?</h3>
              <p className="text-muted-foreground">
                We'll notify you when you're approaching your plan's limits. You can upgrade at any time to increase your limits.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Can I change plans later?</h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Do you offer a free trial?</h3>
              <p className="text-muted-foreground">
                Yes, all paid plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards and PayPal. For annual Business plans, we also accept bank transfers.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6">
            Sign up now and start monitoring your web services and APIs in minutes.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-8 py-2"
          >
            Get Started
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="container py-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ping-Me. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
} 