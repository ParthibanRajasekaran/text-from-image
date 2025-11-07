/**
 * Environment variable utilities for Vite
 * Vite exposes env vars via import.meta.env
 */

export const isUXV2Enabled = (): boolean => {
  // In Vite, env vars are accessed via import.meta.env
  // VITE_ prefix is required for client-side access
  return import.meta.env.VITE_UX_V2 === '1' || import.meta.env.VITE_UX_V2 === 'true';
};

export const getEnv = (key: string, defaultValue: string = ''): string => {
  return (import.meta.env[key] as string) || defaultValue;
};
