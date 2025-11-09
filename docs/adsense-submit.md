# Site verification nuance

- We load the AdSense script in Production when a pub ID is set so Google can verify the site.
- Ad slot rendering remains consent-gated (Consent Mode v2 compliant).
- Check with Tag Assistant: consent default(denied) on first paint, script present, slots inactive until consent.

### Vercel Production env vars (reminder)

```
VITE_SITE_URL=https://freetextfromimage.com
VITE_UX_V2=true
VITE_ADSENSE_PUB_ID=ca-pub-xxxxxxxxxxxxxxxx
```
(Set after signup/approval if you prefer; script presence is ok for verification)

Note: No slots render without consent even if script is present.

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

---

## Environment Configuration Matrix

To avoid Vercel deployment spam and ensure proper flag configuration across environments:

### Local Development
```bash
# .env.local (not committed)
VITE_SITE_URL=http://localhost:3000
VITE_UX_V2=true
# No ad flags - ads disabled by default
```

### Preview Deployments (Vercel)
```bash
# Vercel Preview Environment Variables
VITE_SITE_URL=https://freetextfromimage.com
VITE_UX_V2=true
VITE_ENABLE_ADS_IN_PREVIEW=true              # Enable AutoAds script in preview
VITE_ADS_SLOTS_ENABLED=true                  # Optional: enable InArticle slots for testing
# VITE_ADSENSE_PUB_ID not set in preview (or use test ID)
```

**Preview Behavior:**
- AutoAds script loads when `VITE_ENABLE_ADS_IN_PREVIEW=true`
- InArticle slots render when `VITE_ADS_SLOTS_ENABLED=true`
- Slots remain consent-gated (no ads without user consent)
- Use for testing ad layout/CLS without affecting production

### Production Deployment (Vercel)
```bash
# Vercel Production Environment Variables
VITE_SITE_URL=https://freetextfromimage.com
VITE_UX_V2=true
VITE_ADSENSE_PUB_ID=ca-pub-XXXXXXXXXXXX      # Your actual publisher ID
VITE_ADS_SLOTS_ENABLED=false                 # Start with false; enable after CMP integration
```

**Production Behavior:**
- AutoAds script loads automatically when `VITE_ADSENSE_PUB_ID` is set
- InArticle slots only render when `VITE_ADS_SLOTS_ENABLED=true`
- All slots are consent-gated via Consent Mode v2
- Script presence allows Google to verify site ownership

---

## Tag Assistant Verification Steps

### 1. Install Google Tag Assistant
- Add the [Tag Assistant Chrome extension](https://tagassistant.google.com/)
- Open your site (preview or production)
- Click the Tag Assistant icon

### 2. Verify Consent Mode v2 Default State
**On page load (before user interaction):**
- Check consent state should show:
  ```javascript
  {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  }
  ```
- AdSense script present in `<head>` (if pub ID set)
- InArticle slots render reserved space (min-height: 280px)
- No `<ins class="adsbygoogle">` elements mounted

### 3. Verify Consent Mode v2 Granted State
**After user grants consent:**
- Check consent state should update to:
  ```javascript
  {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted'
  }
  ```
- `<ins class="adsbygoogle">` elements mount inside slots
- `adsbygoogle.push()` calls execute
- Ads begin loading (may take a few seconds)

### 4. Common Issues
- **Script not loading:** Check `VITE_ADSENSE_PUB_ID` is set and MODE is 'production' or preview flag enabled
- **Slots not showing:** Verify `VITE_ADS_SLOTS_ENABLED=true` or route is in guide list
- **Ads load without consent:** Bug! Consent gating failed - review `InArticle.tsx`
- **CLS violations:** Check all slots have `min-h-[280px]` reserved space

---

## Google Search Console Setup

### 1. Verify Site Ownership
- Go to [Google Search Console](https://search.google.com/search-console)
- Add property: `https://freetextfromimage.com`
- Verify via HTML file upload, DNS, or Google Analytics

### 2. Submit Sitemap
- In Search Console, go to **Sitemaps** → **Add a new sitemap**
- Submit: `https://freetextfromimage.com/sitemap.xml`
- Wait for Google to crawl (usually 24-48 hours)

### 3. Request Indexing for Guide Pages
Prioritize these URLs for faster indexing:
- `https://freetextfromimage.com/image-to-text`
- `https://freetextfromimage.com/extract-text-from-image`
- `https://freetextfromimage.com/copy-text-from-image`
- `https://freetextfromimage.com/jpg-to-word`
- `https://freetextfromimage.com/jpg-to-excel`

**Steps:**
1. Go to **URL Inspection** tool
2. Enter guide URL
3. Click **Request Indexing**
4. Repeat for all 5 guides

### 4. Monitor Coverage
- Check **Coverage** report weekly
- Ensure all 11 routes are indexed (6 guides + home + 4 legal pages)
- Fix any errors (404s, redirect chains, etc.)

---

## ads.txt Configuration

### During AdSense Review (Before Approval)
Use a placeholder `ads.txt` to signal intent:

```txt
# /public/ads.txt
# AdSense application pending review
# Will be updated with publisher ID after approval
google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
```

### After AdSense Approval
Replace with your actual publisher ID:

```txt
# /public/ads.txt
google.com, pub-XXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

**Important:**
- Use your real publisher ID from AdSense dashboard
- Deploy immediately after approval
- Verify at: `https://freetextfromimage.com/ads.txt`
- Google will re-crawl within 24 hours

---

## Deployment Checklist

**Before applying to AdSense:**
- ✅ All 11 routes render without errors
- ✅ Sitemap includes all routes with absolute URLs
- ✅ robots.txt references sitemap
- ✅ Privacy policy and terms pages are live
- ✅ CLS < 0.1 on all pages (Lighthouse)
- ✅ All ad slots have reserved space (min-height: 280px)

**During AdSense review:**
- ✅ VITE_ADSENSE_PUB_ID set in production
- ✅ Placeholder ads.txt deployed
- ✅ Tag Assistant confirms Consent Mode v2 default denied
- ✅ No ads load without user consent

**After AdSense approval:**
- ✅ Update ads.txt with real publisher ID
- ✅ Set VITE_ADS_SLOTS_ENABLED=true when ready for live ads
- ✅ Monitor IVT (invalid traffic) reports in AdSense
- ✅ Track CLS/UX metrics in production

---

## Troubleshooting

### Ads not showing in preview
- Check `VITE_ENABLE_ADS_IN_PREVIEW=true` is set
- Check `VITE_ADS_SLOTS_ENABLED=true` for InArticle slots
- Verify route is in guide list: `/image-to-text`, `/extract-text-from-image`, `/copy-text-from-image`, `/jpg-to-word`, `/jpg-to-excel`

### Ads not showing in production
- Check `VITE_ADSENSE_PUB_ID` is set correctly (starts with `ca-pub-`)
- Check `VITE_ADS_SLOTS_ENABLED=true` (if using InArticle slots)
- Verify user has granted consent
- Wait 5-10 minutes for AdSense to fill inventory (new accounts may have delays)

### CLS violations
- All slots must have `min-h-[280px]` reserved space
- Use `will-change: transform` on animated elements
- Test with Lighthouse in incognito mode

### Consent Mode not working
- Check CMP integration fires before AdSense script
- Verify `gtag('consent', 'default', {...})` called on page load
- Use Tag Assistant to inspect consent state
- Test consent flow: deny → verify no ads → grant → verify ads load
