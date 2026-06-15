import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../router';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ThemeToggle';

interface HeaderProps {
  theme: string | null;
  onToggleTheme: () => void;
}

/**
 * Header: Global sticky navigation with theme toggle
 * - Scroll-aware: transparent → blurred background when scrolling
 * - Logo with Developer Beta badge
 * - Main nav: Product | RenderCheck | Labs | Developers | Security | Access
 * - Mobile: hamburger menu with focus trap
 * - CTA: Join Beta button
 */
export function Header({ theme, onToggleTheme }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Close mobile menu on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: 'RenderCheck', href: ROUTES.RENDERCHECK },
    { label: 'Developers', href: ROUTES.DEVELOPERS },
    { label: 'Labs', href: ROUTES.LABS },
    { label: 'Access', href: ROUTES.ACCESS },
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/90 dark:bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-elevation-1'
          : 'bg-transparent'
      }`}
      style={{ height: 'var(--header-h)' }}
    >
      <nav
        className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Logo + Badge */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2 group">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:from-primary/80 group-hover:to-accent/80 transition-colors">
            RenderCheck
          </span>
          <StatusBadge variant="developer-beta" size="sm" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          <ul className="flex items-center gap-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary'
                      : 'text-foreground/70 hover:text-foreground'
                  }`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right slot: Theme + CTA */}
        <div className="flex items-center gap-4">
          {theme && <ThemeToggle theme={theme} toggleTheme={onToggleTheme} />}
          <Button href={ROUTES.ACCESS} size="sm" variant="solid">
            Join Beta
          </Button>

          {/* Mobile menu button */}
          <button
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="lg:hidden p-2 hover:bg-muted rounded-md transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isMobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden absolute top-full left-0 right-0 bg-background border-b border-border/50 shadow-elevation-2"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="container mx-auto px-4 py-4">
            <ul className="flex flex-col gap-3">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`block px-3 py-2 rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground hover:bg-muted'
                    }`}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
