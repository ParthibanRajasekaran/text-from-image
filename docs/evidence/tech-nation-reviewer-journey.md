# Tech Nation Reviewer Journey

Simulate what a Tech Nation visa reviewer would do when assessing your application. This document traces the "golden path" through the website to verify claims.

## Reviewer Context

Reviewers are looking for:
1. **Is this a real problem?** (AI-era verification gap)
2. **Did the applicant build a real solution?** (Working product)
3. **Is there evidence of adoption or recognition?** (Public platform, early users, case studies)
4. **Is the applicant credible?** (No overclaiming, honest beta messaging, technical depth)

**They will NOT trust:**
- Fake enterprise maturity signals
- Customer logos without verification
- Compliance claims without audits
- Claims without proof

---

## Typical Reviewer Session (30 minutes)

### Minute 1-2: First Impression

**Reviewer lands on homepage**

Observations:
- ✓ Clear headline: "Extract text from images in your browser"
- ✓ Hero shows working demo (OCR tool is live)
- ✓ Trust chips say: "No signup", "Browser OCR runs locally", honest about stage
- ✓ Call-to-action is clear: "Try Now" (not "Buy Now" or "Sign Up")

**Red flags they'd notice (but don't):**
- ❌ No fake "Trusted by X" logos
- ❌ No "Enterprise Grade" claim
- ❌ No GDPR claim
- ❌ No WCAG AA claim (says "Keyboard accessible" instead)

### Minute 3-5: Try the Product

**Reviewer uses the OCR tool**

Flow:
1. Click "Try Now" → downloads headshot.jpg
2. Tool extracts: "Parthiban Rajasekaran" and "Founder & Engineer"
3. Results appear instantly (browser OCR, no API call)
4. Copy button works, export works
5. Works offline (Tesseract.js WASM)

**Their assessment:** "OK, this is a real, working product. Not vapourware."

### Minute 6-8: Check the Claim About "Developer Platform"

**Reviewer clicks `/developers`**

Observations:
- ✓ Explicit product state matrix (Live, Beta, Planned)
- ✓ npm package listed: `@rendercheck/sdk`
- ✓ Code examples for Playwright and Cypress (working tests, not marketing speak)
- ✓ API reference shows input/output types (TypeScript interfaces)
- ✓ No "Coming Soon" without a state badge
- ✓ "1,000 calls/month during beta" is specific (not "unlimited")

**Open question:** "Is this actually on npm?"

### Minute 9-10: Verify npm Package

**Reviewer opens new tab → npmjs.com**

Search: `@rendercheck/sdk`

Results:
- Package exists ✓
- Version 0.1.0 ✓
- MIT License ✓
- README with usage examples ✓
- GitHub link ✓
- Last published: [recently] ✓

**Their assessment:** "Real open-source package. This person is serious about the developer community."

### Minute 11-13: Check the Adoption Claim

**Reviewer clicks `/case-studies`**

Observations:
- ✓ Honest title: "Real-World Adoption (In Progress)"
- ✓ Doctor4Africa case study marked: `evidence-pending` (not fabricated)
- ✓ Shows what's known: "AWS Glue healthcare pipeline"
- ✓ Shows what's pending: "Metrics and permission TBC"
- ✓ No fake logos or testimonials
- ✓ Invites beta testers: "Be among the first"

**Red flags they'd reject (but don't see):**
- ❌ No customer logos
- ❌ No inflated numbers ("200 customers")
- ❌ No testimonials without names
- ❌ Honest "0 public installs" (precision = credibility)

### Minute 14-15: Test the "No Data Storage" Claim

**Reviewer opens DevTools → Network tab**

Action:
1. Go back to homepage
2. Use OCR tool with a screenshot
3. Check Network tab

Observation:
- ✓ No external image upload to any API
- ✓ Only local processing (Tesseract.js worker thread)
- ✓ No upload to image storage (S3, Cloudinary, etc.)

**Their assessment:** "Privacy claim is accurate. Not storing images."

### Minute 16-17: Check Security Claims

**Reviewer clicks Page > View Page Source**

Looks for:
- CSP headers ✓ (in response headers)
- HTTPS ✓ (site uses HTTPS, no mixed content)
- No external ad trackers on `/developers` page ✓

**Their assessment:** "Security approach is coherent: privacy-first, no ads on dev pages."

### Minute 18-20: Check Code Quality and Honesty

**Reviewer clicks `/developers` → Code examples**

Observations:
- ✓ Playwright example uses real API (`verify()` function)
- ✓ Cypress example shows proper buffer handling
- ✓ API reference matches real implementation
- ✓ No "mock" or "placeholder" code

**Open question:** "Can I verify this code actually exists?"

### Minute 21-22: Verify GitHub

**Reviewer opens GitHub**

Search: `github.com/ParthibanRajasekaran/text-from-image`

Results:
- Repository exists ✓
- Code matches what's on the website ✓
- MIT License ✓
- Recent commits (shows active development) ✓
- Package source in `packages/rendercheck/` ✓

### Minute 23-25: Check for Red Flags

**Reviewer re-reads entire site looking for overclaims**

Searches for:
- "enterprise" → not found ✓
- "production ready" → not found ✓
- "trusted by" → not found ✓
- "GDPR" → not found ✓
- "customers" → only in case studies section with context ✓
- "WCAG AA" → not found (says "Keyboard accessible" instead) ✓
- "Sign In" → not found (no fake auth) ✓

**Their assessment:** "Applicant is honest. Claims are modest and verifiable."

### Minute 26-30: Research and Closing Questions

**Reviewer synthesizes findings**

Their summary:
- ✅ Real problem: AI-generated UI can fail verification
- ✅ Real solution: OCR-based testing in Playwright/Cypress
- ✅ Real code: Published on npm, open source, GitHub
- ✅ Real credibility: Honest about beta, no fake maturity
- ⚠️ Limited adoption: But honest ("0 public installs", "early access")
- ⚠️ Case study pending: But transparent ("evidence-pending")

**Conclusion they reach:**
> "This person built a real developer tool for a real problem. They're honest about the stage. They could use more independent validation and case studies, but the foundation is credible."

---

## What Makes the Difference

### What Worked
- ✓ Working demo (browser OCR)
- ✓ Real open-source code
- ✓ Honest beta messaging
- ✓ No fake maturity claims
- ✓ Transparent about pending adoption
- ✓ Technical depth (API reference, code examples)
- ✓ Privacy-first (no data storage)

### What Didn't Work
- ❌ No major customer case studies (yet)
- ❌ No large-scale adoption (but honest about it)
- ❌ Small npm download numbers (but growing)
- ❌ No WCAG AA audit (but keyboard accessible)

---

## Conclusion

A Tech Nation reviewer spending 30 minutes on the site would likely think:

> **"This is a smart developer who identified a real gap (AI verification debt), built a working tool, published it open-source, and is honestly presenting it in beta. There's no adoption yet, but there's no bullshit either. This person is credible."**

And credibility, not hype, is what visa reviewers are looking for.

---

## Verification Checklist for This Scenario

- [ ] Homepage demo actually works
- [ ] npm package actually exists and is installable
- [ ] GitHub repository is public and matches website claims
- [ ] CSP and HTTPS headers are in place
- [ ] No overclaims found when searching for red-flag terms
- [ ] Case studies are marked pending (not fake)
- [ ] All code examples are functional and real
- [ ] Privacy claims are accurate (local OCR, no storage)
- [ ] No fake logos or testimonials
- [ ] Beta messaging is consistent throughout
