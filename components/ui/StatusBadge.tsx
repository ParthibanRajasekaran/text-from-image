import React from 'react';

type StatusVariant = 'live' | 'developer-beta' | 'planned' | 'coming-soon' | 'evidence-pending';

interface StatusBadgeProps {
  variant: StatusVariant;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig: Record<StatusVariant, { bg: string; text: string; label: string }> = {
  live: {
    bg: 'bg-status-live/10 dark:bg-status-live/15',
    text: 'text-status-live dark:text-status-live',
    label: 'Live',
  },
  'developer-beta': {
    bg: 'bg-status-beta/10 dark:bg-status-beta/15',
    text: 'text-status-beta dark:text-status-beta',
    label: 'Developer Beta',
  },
  planned: {
    bg: 'bg-status-planned/10 dark:bg-status-planned/15',
    text: 'text-status-planned dark:text-status-planned',
    label: 'Planned',
  },
  'coming-soon': {
    bg: 'bg-status-planned/10 dark:bg-status-planned/15',
    text: 'text-status-planned dark:text-status-planned',
    label: 'Coming Soon',
  },
  'evidence-pending': {
    bg: 'bg-status-evidence-pending/10 dark:bg-status-evidence-pending/15',
    text: 'text-status-evidence-pending dark:text-status-evidence-pending',
    label: 'Evidence Pending',
  },
};

/**
 * StatusBadge: Visual indicator for feature state
 * Live and Beta badges have subtle pulsing dot
 * WCAG AA accessible with explicit dark: classes
 */
export function StatusBadge({
  variant,
  label,
  size = 'sm',
  className = '',
}: StatusBadgeProps) {
  const config = statusConfig[variant];
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  const showPulse = variant === 'live' || variant === 'developer-beta';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold border ${config.bg} ${config.text} border-status-live/20 dark:border-status-live/30 ${sizeClasses} ${className}`}
      aria-label={`${config.label}${label ? ': ' + label : ''}`}
    >
      {showPulse && (
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${config.text} animate-pulse-slow`} />
      )}
      {label || config.label}
    </span>
  );
}
