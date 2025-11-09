// Minimal CMP wiring example for AdSense Consent Mode v2
// This pseudo-code shows how to connect a CMP (IAB TCF v2.2) to updateConsent()
// Do NOT import a vendor SDK. Use window.__tcfapi if present.
// Purpose mapping:
//   - Purpose 1 (Storage and access of information): maps to 'ad_storage'
//   - Purposes 7,8,9,10 (Measurement, Personalization, Ad selection, Content selection): map to 'ad_user_data', 'ad_personalization'
// See: https://support.google.com/adsense/answer/10000040

export type ConsentState = {
  ad_storage: boolean;
  ad_user_data: boolean;
  ad_personalization: boolean;
};

export let consentState: ConsentState = {
  ad_storage: false,
  ad_user_data: false,
  ad_personalization: false,
};

export function updateConsent(newState: Partial<ConsentState>) {
  consentState = { ...consentState, ...newState };
  // Tag Assistant self-check: log consent state in development only
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[CMP] Consent state updated:', consentState);
  }
}

// Example: connectCMP() hooks __tcfapi to updateConsent()
export function connectCMP() {
  // Pseudo-code: listen for TCF v2.2 consent changes
  if (typeof window !== 'undefined' && typeof window.__tcfapi === 'function') {
    window.__tcfapi('addEventListener', 2, (tcData: any) => {
      // Map TCF purposes to Consent Mode
      // Purpose 1: Storage and access of information
      // Purposes 7-10: Measurement, Personalization, Ad selection, Content selection
      const ad_storage = tcData.purpose.consents['1'] === true;
      const ad_user_data = ['7','8','9','10'].some(p => tcData.purpose.consents[p] === true);
      const ad_personalization = ['8','9','10'].some(p => tcData.purpose.consents[p] === true);
      updateConsent({ ad_storage, ad_user_data, ad_personalization });
    });
  }
  // Initial log in development
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[CMP] Initial consent state:', consentState);
  }
}// Consent Mode v2 hook for AdSense readiness
// Default: denied. Wire a Google-certified CMP here (see comments).

export type ConsentState = {
  ad_storage: 'granted' | 'denied';
  ad_user_data: 'granted' | 'denied';
  ad_personalization: 'granted' | 'denied';
};

export function injectDefaultConsentScript() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') return;
  if (document.getElementById('consent-default')) return;
  const script = document.createElement('script');
  script.id = 'consent-default';
  script.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied'
    });
  `;
  document.head.prepend(script);
}

export function updateConsent(state: ConsentState) {
  // Call this from your CMP callback (e.g., __tcfapi or vendor API)
  // Example mapping TCF purposes to Google consent types:
  // TCF Purpose 1 → ad_storage
  // TCF Purpose 7 → ad_user_data
  // TCF Purpose 4 → ad_personalization
  if (typeof window === 'undefined') return;
  // Declare window.dataLayer for TypeScript
  if (!('dataLayer' in window)) {
    (window as any).dataLayer = [];
  }
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(args);
  }
  gtag('consent', 'update', state);
}

// TODO: Wire a Google-certified CMP callback here and call updateConsent()
