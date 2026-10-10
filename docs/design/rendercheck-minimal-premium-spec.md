# RenderCheck Minimal Premium Design Specification

## Design Thesis

RenderCheck is a **premium developer tool** built by a serious AI-era engineering leader. Not a free OCR utility. Not a marketing template. Not a design-agency clone.

Premium through restraint: 45-55% whitespace, typography hierarchy, minimal visual noise, real product proof, one memorable interaction.

---

## Visual Principles

### Whitespace
- **Hero sections**: 45-55% empty space
- **Major sections**: Generous vertical spacing (4rem between sections)
- **Card-based layouts**: ELIMINATE. Use semantic spacing only.
- **Information density**: Sparse and curated, not comprehensive

### Typography Hierarchy
- **Headlines**: Via SIZE, not excessive font weight
- **Headings**: 600-700 weight, tight letter-spacing (-0.025rem to -0.03rem)
- **Body**: 400 weight, generous line-height (1.5-1.73)
- **Code**: JetBrains Mono, monospace treatment only

### Surfaces & Borders
- **Card borders**: ELIMINATE entirely
- **Shadows**: Light only (elevation-1 maximum)
- **Backgrounds**: White/dark mode neutral (no decorative colors)
- **Separation**: Use whitespace, not visual containers

### Color & Contrast
- **Primary text**: High contrast (21:1 ratio minimum)
- **Accent color**: Single brand primary only
- **Decorative gradients**: ELIMINATE entirely
- **Status badges**: Minimal colors (live=green, beta=amber, planned=gray)

### Motion
- **UI interactions**: 150-250ms (fade or color shift only)
- **Page reveals**: 300-600ms (scroll-triggered fade)
- **Hover effects**: Color change or light shadow only, NO scale
- **Animation on badges**: ELIMINATE (removed pulsing dots)
- **Respect**: All motion honors `prefers-reduced-motion`

### Product Proof
- **Screenshot role**: Carries the narrative, not supporting
- **Visual quality**: Real dashboards, real usage, no mockups
- **Contrast**: High, to signal importance
- **Example format**: 
  ```
  Expected: "Payment successful"
  Detected: "Payment succesful"
  Result: FAIL
  ```

---

## Typography System

### Font Stack
- **Headings**: Space Grotesk, Manrope, or Geist (all free/licensed)
- **Body**: Inter or Geist (free, well-supported)
- **Code**: JetBrains Mono (already in use)
- **Fallback**: system-ui (for performance)

### Heading Scale
| Level | Mobile | Tablet | Desktop | Line-Height | Letter-Spacing |
|-------|--------|--------|---------|-------------|-----------------|
| H1    | 2.5rem | 3.5rem | 4.5rem  | 1.1         | -0.03rem        |
| H2    | 2rem   | 2.5rem | 3.5rem  | 1.15        | -0.025rem       |
| H3    | 1.5rem | 1.875rem | 2.25rem | 1.2        | -0.02rem        |
| H4    | 1.25rem | 1.5rem | 1.75rem | 1.25        | 0               |

### Body Copy Scale
| Role         | Size   | Line-Height | Letter-Spacing |
|--------------|--------|-------------|-----------------|
| Large body   | 1.125rem | 1.6         | 0               |
| Standard     | 1rem   | 1.6         | 0.01rem         |
| Small/label  | 0.875rem | 1.5         | 0.02rem         |
| Code/mono    | 0.875rem | 1.5         | 0               |

---

## Color Palette

### Light Mode
| Role | Value | Usage |
|------|-------|-------|
| Background | #FFFFFF | Page background |
| Foreground | #1a1a1a | Primary text |
| Muted | #64748b | Secondary text, labels |
| Border | #e5e7eb | Minimal borders only |
| Primary | #0891b2 (cyan/teal) | Brand accent, CTAs |
| Live | #22c55e | Success badge |
| Beta | #f59e0b | Beta badge |
| Planned | #94a3b8 | Planned badge |

### Dark Mode
| Role | Value | Usage |
|------|-------|-------|
| Background | #0f172a | Page background |
| Foreground | #f1f5f9 | Primary text |
| Muted | #94a3b8 | Secondary text |
| Border | #1e293b | Minimal borders |
| Primary | #06b6d4 | Brand accent |
| Live/Beta/Planned | (same as light) | Status badges |

---

## Shadows & Elevation

| Level | Usage | CSS |
|-------|-------|-----|
| None | Most elements | `box-shadow: none` |
| elevation-1 | Cards, buttons | `0 1px 2px rgba(0,0,0,0.05)` |
| elevation-2 | Hovered cards | `0 4px 6px rgba(0,0,0,0.1)` |

**Rule**: No shadow > 0.1 opacity. No dramatic depth.

---

## Motion Guidelines

### Timing
- **Button click**: 200ms
- **Page scroll reveal**: 400-600ms
- **Fade in/out**: 300ms

### Easing
- **Standard**: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out)
- **All animations**: Respect `@media (prefers-reduced-motion: reduce)`

### What NOT to animate
- ❌ Card scale on hover
- ❌ Badge pulsing
- ❌ Gradient animations
- ❌ Spinning loaders
- ❌ Parallax scrolling

---

## Homepage Structure

### Section 1: Hero
**Whitespace**: 50%

```
[RenderCheck Logo + Developer Beta badge]

[H1] Verify what AI-generated UI actually shows

[Subheading, 18px]
RenderCheck uses privacy-first OCR to test screenshots, documents, 
and rendered interfaces, helping teams catch visible text failures 
that DOM checks and code reviews can miss.

[CTA Button] Try RenderCheck
[Secondary CTA link] Take the Verification Debt Score

[Hero Product Proof Panel, large]
```

### Section 2: Why This Matters
**Content**: 1-2 paragraphs on verification debt in AI-era development

### Section 3: RenderCheck Workflow
**Format**: 4 steps displayed as text flow, not numbered circles
1. Take screenshot
2. Pass to verify()
3. Get results
4. Assert in test

### Section 4: RenderCheck Labs Preview
**Cards**: 3 cards showing Verification Debt Score, AI UI Bug Gallery, OCR Challenge Lab
- **No shadows**
- **Light border only**
- **Status badges**

### Section 5: Developer Primitives
**Format**: Feature state matrix

| Feature | State | Badge |
|---------|-------|-------|
| Browser OCR | Live | green |
| API OCR | Developer Beta | amber |
| RenderCheck SDK | Early Access | amber |
| CLI | Planned | gray |

### Section 6: Privacy Architecture
**Headline**: How RenderCheck keeps your data safe

**Points**:
- Browser OCR runs locally (Tesseract.js)
- No image or text persistence
- HTTPS only
- Optional API mode for CI/CD

### Section 7: Proof, Not Claims
**Disclaimer**: Case studies in preparation. Doctor4Africa partnership in progress. 0 public npm installs (launching).

### Section 8: Access
**Headline**: Choose your path

**3 tiers**:
- Browser OCR (free, no signup)
- Developer Beta (request access, 1000 calls/month)
- Public Interest (free for NGOs/healthcare/education)

[Request Access CTA]

---

## What to Remove from Current Homepage

❌ "Extract Text from Image for Free" as headline  
❌ SEO keyword nav (Image to Text, JPG to Word, etc.)  
❌ Crowded hero with 4-step numbered flow  
❌ Gradient overlays and decorative effects  
❌ Too many card borders and shadows  
❌ Pulsing badge animations  
❌ Hover scale animations  
❌ Fake metrics or adoption claims  

---

## Acceptance Criteria (Homepage Prototype)

- [ ] Thesis is clear in 5 seconds
- [ ] Does NOT feel like a free OCR utility
- [ ] 45-55% whitespace in hero
- [ ] No decorative gradients
- [ ] Shadows used sparingly (elevation-1 max)
- [ ] Typography is generous and readable
- [ ] Mobile-first responsive
- [ ] No OCR/Tesseract loaded on initial render
- [ ] Dark mode works (no color shifts)
- [ ] All animations respect prefers-reduced-motion
- [ ] Claims audit passes
- [ ] Lighthouse > 85 performance
- [ ] No fake logos, pricing, sign-in, or compliance claims

---

## Implementation Notes

### Font Loading
Use Google Fonts for Space Grotesk (already loading Inter and JetBrains Mono). Preload with `<link rel="preload">`.

### Image Optimization
All product proof images should be:
- Full-bleed where possible
- High contrast
- No rounded corners or frames
- Real screenshots, not mockups

### Performance
- Homepage must not load OCR/Tesseract on initial render
- Lazy-load OCR dependencies only when user clicks "Try RenderCheck"
- Keep bundle under 150KB gzip for initial page load

### Dark Mode
Use CSS variables (already in place). Test both modes at 1440px and 375px.

---

## Reference: Framework Design Principles

This spec is inspired by weareframework.co.uk's approach:

1. Premium through whitespace, not decoration
2. Typography carries hierarchy (size > weight)
3. Asymmetrical layouts feel intentional
4. Zero decorative elements (no gradients, no shadows, no animations "just in case")
5. Product/work is the hero, not the design system
6. Personality through 1-2 memorable moments, not constant animation

**Key difference**: Framework is a portfolio/agency site. RenderCheck is a developer product. We adapt their principles (restraint, space, typography) but keep SaaS clarity (feature documentation, signup CTAs, code examples).

---

## Next Steps

1. **Prototype homepage only** using this spec
2. **Validate direction** with before/after screenshots
3. **Roll across** /rendercheck, /developers, /labs, /access only after approval
