import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { Header } from './Header';
import { Footer } from './Footer';

/**
 * AppShell: Global layout wrapper for all routes
 * Provides:
 * - Single sticky header with theme toggle
 * - Single <main> landmark (all nested routes render within it)
 * - Footer with links and legal
 * - Centralized theme management
 */
export function AppShell() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Global header */}
      <Header theme={theme} onToggleTheme={toggleTheme} />

      {/* Main content (flex-1 to push footer to bottom) */}
      <main
        id="main-content"
        className="flex-1"
        tabIndex={-1}
        role="main"
      >
        <Outlet />
      </main>

      {/* Global footer */}
      <Footer />
    </div>
  );
}
