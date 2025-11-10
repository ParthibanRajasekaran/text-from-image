# AdSense Readiness & Submission Guide

## ✅ Checklist Before Applying

- [ ] **Consent Mode v2** - CMP wired correctly (see below)
- [ ] **Policy Pages Live** - `/privacy-policy`, `/terms`, `/about`, `/contact` indexable
- [ ] **Guide Pages** - 5 SEO routes with FAQ rich snippets, all discoverable
- [ ] **Sitemap** - Auto-generated at `/sitemap.xml`, submitted to Search Console
- [ ] **robots.txt** - Present and references sitemap
- [ ] **Core Web Vitals** - Lighthouse score ≥90, CLS < 0.1 (on all pages)
- [ ] **No policy violations** - Harmful content, invalid traffic, etc. (Google policy check)

---

## Current Implementation Steps

### 1. Consent Mode v2 + CMP

**Status:** ✅ Implemented with fallback

- **File:** `lib/consent.ts` (manages `gtag.consent` state)
- **Integration:** Wire your CMP (OneTrust, CookieBot, etc.) to call `updateConsent({ ad_storage, ad_user_data, ad_personalization })`
- **Defaults:** Consent mode starts as `'denied'` on page load
- **Mapping:**
  - Purpose 1 (Storage/Cookies) → `ad_storage`
  - Purposes 7/8/9/10 (Targeting/Profiling) → `ad_user_data`, `ad_personalization`

**Example CMP integration:**
```typescript
// lib/consent.ts
export function initCMP() {
  // Get consent from your CMP
  const userConsent = await getCMPConsent(); // Your CMP library call
  
  // Update Google Consent Mode v2
  updateConsent({
    ad_storage: userConsent.purposes[1] ? 'granted' : 'denied',
    ad_user_data: userConsent.purposes[7] ? 'granted' : 'denied',
    ad_personalization: userConsent.purposes[10] ? 'granted' : 'denied',
  });
}
```

### 2. Policy Pages

All required policy pages must be:
- ✅ Live and indexable (not behind login)
- ✅ Linked from footer or navigation
- ✅ Have canonical absolute URLs
- ✅ Included in sitemap

**Routes (auto-generated):**
- `/privacy-policy` — Privacy Policy
- `/terms` — Terms of Service
- `/about` — About Us
- `/contact` — Contact Page

### 3. SEO Guide Pages

These 5 intent-specific pages are the core of your SEO strategy:

| Route | Title | FAQ | Indexed |
|-------|-------|-----|---------|
| `/image-to-text` | Extract text from any image | ✅ 6 FAQs | ✅ |
| `/extract-text-from-image` | Extract text guide | ✅ 5 FAQs | ✅ |
| `/copy-text-from-image` | Copy text from image | ✅ 4 FAQs | ✅ |
| `/jpg-to-word` | Convert JPG to Word | ✅ 5 FAQs | ✅ |
| `/jpg-to-excel` | JPG to Excel conversion | ✅ 5 FAQs | ✅ |

Each guide has:
- Unique title & meta description
- Absolute canonical URL
- OG image (1200×630px)
- FAQ schema (JSON-LD)
- Internal links to related guides
- Accessibility (WCAG 2.1 AA)

### 4. Sitemap Generation & Submission

**Generate sitemap:**
```bash
npm run sitemap
# Outputs: /public/sitemap.xml (auto-deployed)
```

**Includes (11 routes):**
- Home `/`
- 5 guide pages
- 4 policy pages
- Auto-priority based on importance

**Submit to Google Search Console:**
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Select your site property
3. Sitemaps → Add new sitemap
4. Enter: `https://freetextfromimage.com/sitemap.xml`
5. Request indexing for each guide page

### 5. Tag Assistant Verification

Use [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant/knlekepgipnigpmalhapjepnkglfdebg) to verify:

**On page load (should see):**
```javascript
{
  ad_storage: 'denied',           // ✓ Default denied
  ad_user_data: 'denied',
  ad_personalization: 'denied'
}
```

**Checks:**
- ✅ Google Ads script present (if `VITE_ADSENSE_PUB_ID` set)
- ✅ Consent defaults to `'denied'`
- ✅ No `<ins class="adsbygoogle">` slots rendered initially
- ✅ Ad slots reserve space with `min-h-[280px]`

**After user grants consent:**
```javascript
{
  ad_storage: 'granted',          // ✓ User updated this
  ad_user_data: 'granted',
  ad_personalization: 'granted'
}
```

- ✅ `<ins class="adsbygoogle">` elements now mount
- ✅ Ads begin loading (may take 5-10 seconds)

### 6. Core Web Vitals Requirements

**Lighthouse target:** ≥90 overall score  
**CLS (Cumulative Layout Shift):** < 0.1 (required for AdSense)

**All ad slots must reserve space:**
```tsx
// ✅ Good: Reserved space prevents layout shift
<div className="min-h-[280px]">
  <AdSlot slot="ca-pub-xxx" />
</div>

// ❌ Bad: Dynamic height causes CLS violation
<div>
  <AdSlot slot="ca-pub-xxx" />
</div>
```

**Check CLS locally:**
```bash
npm run build
npm run preview
# Open Lighthouse in DevTools → Measure
```

---

## Environment Configuration Matrix

### Local Development
```bash
# .env.local (NOT committed)
VITE_SITE_URL=http://localhost:5173
VITE_UX_V2=true
# Ads disabled (no pub ID set)
```

**Behavior:**
- AdSense script NOT loaded
- Ad slots NOT rendered
- Policy pages accessible for testing

### Preview Deployments (Vercel)
```bash
# Vercel Dashboard → Environment Variables → Preview
VITE_SITE_URL=https://freetextfromimage.com
VITE_UX_V2=true
VITE_ENABLE_ADS_IN_PREVIEW=true
VITE_ADS_SLOTS_ENABLED=true
# VITE_ADSENSE_PUB_ID=ca-pub-test-id (optional, for testing)
```

**Behavior:**
- AdSense script loads (test pub ID or none)
- InArticle slots render with reserved space
- Consent gating active (ads blocked until granted)
- Use for testing ad layout, CLS, consent flow

### Production Deployment (Vercel)
```bash
# Vercel Dashboard → Environment Variables → Production
VITE_SITE_URL=https://freetextfromimage.com
VITE_UX_V2=true
VITE_ADSENSE_PUB_ID=ca-pub-XXXXXXXXXXXX     # Real publisher ID
VITE_ADS_SLOTS_ENABLED=true                  # Enable after Google approval
```

**Behavior:**
- AdSense script loads with real pub ID
- InArticle slots render with reserved space
- Consent Mode v2 gates ad loading
- Script presence allows Google to verify site during review

---

## Post-Approval: ads.txt & Enabling Slots

### Step 1: Update ads.txt

After receiving AdSense approval email:

```bash
# /public/ads.txt
google.com, pub-XXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

**Deploy immediately:**
```bash
npm run build && npm run deploy:prod
```

Verify at: `https://freetextfromimage.com/ads.txt`

### Step 2: Enable Ad Slots

In Vercel dashboard (after ad provisioning):

```bash
# Vercel → Settings → Environment Variables → Production
VITE_ADS_SLOTS_ENABLED=true
```

Redeploy:
```bash
npm run deploy:prod
```

**Verify in Tag Assistant:**
- `<ins class="adsbygoogle">` slots mount after consent granted
- Ads load within 5-10 seconds
- No CLS violations

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
