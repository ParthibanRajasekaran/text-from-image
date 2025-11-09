# AdSense Submission Guide

## Steps for Approval

1. **CMP + Consent Mode v2**
   - Implement a Consent Management Platform (CMP) with IAB TCF v2.2 support.
   - Wire CMP to Google Consent Mode v2 using the provided mapping:
     - Purpose 1 → `ad_storage`
     - Purposes 7/8/9/10 → `ad_user_data`, `ad_personalization`
   - See `src/consent/consent.ts` for a safe wiring example.

2. **Google Search Console**
   - Verify site ownership in Search Console.
   - Submit sitemap for indexing.

3. **Sitemap**
   - Ensure all key routes are listed:
     `/`, `/image-to-text`, `/extract-text-from-image`, `/copy-text-from-image`, `/jpg-to-word`, `/jpg-to-excel`, `/privacy-policy`, `/terms`, `/about`, `/contact`
   - See `scripts/build-sitemap.mjs`.

4. **How to Apply**
   - Apply via AdSense dashboard.
   - Wait for approval email.

5. **ads.txt**
   - After approval, add your ads.txt file to `/public/ads.txt`.

6. **Set VITE_ADSENSE_PUB_ID**
   - Add your publisher ID to `.env` or Vercel environment settings.

7. **Tag Assistant Checks**
   - In development, verify consent state logs and AdSense tags using Tag Assistant.
   - No logs in production.

8. **Lighthouse CLS Target**
   - Ensure Cumulative Layout Shift (CLS) is below 0.1 for AdSense compliance.
