import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/layout/Navbar';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import GoogleTranslator from '../components/layout/GoogleTranslator';
import AppProviders from '../components/layout/AppProviders';

export const metadata: Metadata = {
  title: 'FLEXYWORK | Work flex. Earn more. Grow together.',
  description: 'A Cooperative Gig Services Platform for Household & Community Services.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col min-h-screen bg-surface-soft font-sans antialiased text-ink">
        {/* Dynamic Multi-Language Translator */}
        <GoogleTranslator />

        {/* Responsive Desktop Header */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-grow pb-16 md:pb-0">
          <AppProviders>
            {children}
          </AppProviders>
        </main>

        {/* Responsive Mobile Tab Navigation */}
        <MobileBottomNav />

        {/* Global Footer */}
        <footer className="hidden md:block bg-white border-t border-surface-border py-8 mt-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center md:flex md:items-center md:justify-between text-xs text-ink-subtle">
            <p className="font-semibold tracking-wide text-ink-muted">
              FLEXYWORK &copy; {new Date().getFullYear()} · Co-op Gig Services Platform
            </p>
            <p className="mt-2 md:mt-0 font-medium">
              "Work flex. Earn more. Grow together."
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
