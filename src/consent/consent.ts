// Google Consent Mode v2 — single source of truth for consent state.
// Values match what Google expects: 'granted' | 'denied'.
export type ConsentValue = 'granted' | 'denied';
export interface ConsentState {
  ad_storage: ConsentValue;
  ad_user_data: ConsentValue;
  ad_personalization: ConsentValue;
}

// Safe-by-default.
let consentState: ConsentState = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
};

// Idempotent gtag shim: pushes into dataLayer.
function gtag(..._args: any[]) {
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push(arguments);
}

/**
 * Apply default consent (denied) at page start.
 * Call once in the app shell (Production only) before any Google tags.
 */
export function applyDefaultConsent(): void {
  gtag('consent', 'default', { ...consentState });
}

/**
 * Merge and notify Google of updated consent after CMP returns a decision.
 * Accepts a partial update of ConsentState.
 */
export function updateConsent(update: Partial<ConsentState>): void {
  consentState = { ...consentState, ...update };
  gtag('consent', 'update', { ...consentState });
}

/** Read-only snapshot for UI/tests. */
export function getConsent(): ConsentState {
  return { ...consentState };
}

/** Convenience: returns true if ad_storage is granted. */
export function isAdStorageGranted(): boolean {
  return consentState.ad_storage === 'granted';
}

/**
 * Example mapper from a TCF v2.2 CMP payload → ConsentState.
 * Wire your CMP callback to call updateConsent(mapTcfToConsent(tcf)).
 */
export function mapTcfToConsent(tcf: {
  purpose?: Record<string, { consent?: boolean }>;
}): ConsentState {
  const p1  = tcf?.purpose?.['1']?.consent ? 'granted' : 'denied'; // Storage/access
  const p7  = tcf?.purpose?.['7']?.consent ? 'granted' : 'denied'; // Measurement
  const p8  = tcf?.purpose?.['8']?.consent ? 'granted' : 'denied'; // Content selection
  const p9  = tcf?.purpose?.['9']?.consent ? 'granted' : 'denied'; // Ad selection/delivery/reporting
  const p10 = tcf?.purpose?.['10']?.consent ? 'granted' : 'denied'; // Content measurement
  return {
    ad_storage: p1,
    ad_user_data: p7, // Adjust mapping to your CMP needs
    ad_personalization: (p9 === 'granted' || p8 === 'granted' || p10 === 'granted') ? 'granted' : 'denied',
  };
}
