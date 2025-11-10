import React from 'react';
import { Glass } from './Glass';

export interface PillarCardProps {
  /** Icon component or JSX element */
  icon: React.ReactNode;
  /** Card title */
  title: string;
  /** Card description/body text */
  body: string;
  /** Optional additional className for the Glass container */
  className?: string;
}

/**
 * PillarCard: Icon + Title + Body inside Glass container
 * Used for value pillars and feature highlights
 */
export function PillarCard({ icon, title, body, className = '' }: PillarCardProps) {
  return (
    <Glass className={`space-y-3 ${className}`.trim()}>
      <div className="text-3xl">{icon}</div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-foreground/80 leading-relaxed">{body}</p>
    </Glass>
  );
}
