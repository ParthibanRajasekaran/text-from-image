import React from 'react';
import { Link } from 'react-router-dom';

type ButtonVariant = 'solid' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  href?: string;
  external?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  solid:
    'bg-primary text-primary-foreground hover:bg-[hsl(220_89%_35%)] dark:hover:bg-[hsl(220_83%_53%)] shadow-elevation-1 hover:shadow-elevation-2',
  outline:
    'border border-border text-foreground hover:bg-muted/50 dark:border-border dark:hover:bg-muted/50',
  ghost:
    'text-foreground hover:bg-muted/50 dark:hover:bg-muted/50',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-base rounded-lg',
  lg: 'px-6 py-3 text-lg rounded-lg',
};

/**
 * Button: Primary interactive component
 * Supports internal links (React Router) and external links
 * Variant: solid (primary), outline, ghost
 * Size: sm, md, lg
 */
export function Button({
  variant = 'solid',
  size = 'md',
  children,
  href,
  external,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed';

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  // Internal link via React Router
  if (href && !external) {
    return (
      <Link to={href} className={classes}>
        {children}
      </Link>
    );
  }

  // External link
  if (href && external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
      </a>
    );
  }

  // Regular button
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
