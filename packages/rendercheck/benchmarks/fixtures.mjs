// Self-made fixtures. Each one is a tiny page with one target element (#target).
//   truth: 'bug' = the DOM contains the expected text but a user cannot read it as expected
//          'ok'  = a user can read the expected text (a control or a limit probe)
// "truth" is the author's judgement, stated in `why`. It is not an independent label.
// `html` may be a function of ctx (ctx.images holds PNG data URIs rendered during setup).

const page = (body, css = '') => `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;background:#fff;color:#111;font:24px/1.3 sans-serif}
.box{position:relative;padding:32px 24px;height:56px;overflow:hidden}
${css}
</style></head><body><div class="box">${body}</div></body></html>`;

export const fixtures = [
  // ---- bug classes ----
  {
    id: 'white-on-near-white',
    cls: 'low contrast',
    truth: 'bug',
    expected: 'Order confirmed',
    why: '#ffffff text on #fefefe, ratio about 1.01:1',
    html: page('<p id="target" style="margin:0;color:#fff;background:#fefefe">Order confirmed</p>'),
  },
  {
    id: 'very-light-grey',
    cls: 'low contrast',
    truth: 'bug',
    expected: 'Payment received',
    why: '#e0e0e0 on white, ratio about 1.3:1',
    html: page('<p id="target" style="margin:0;color:#e0e0e0">Payment received</p>'),
  },
  {
    id: 'mid-grey-fails-aa',
    cls: 'low contrast',
    truth: 'bug',
    expected: 'Delivery by Friday',
    why: '#999999 on white, ratio about 2.8:1, readable but fails WCAG AA 4.5:1',
    html: page('<p id="target" style="margin:0;color:#999">Delivery by Friday</p>'),
  },
  {
    id: 'clipped-overflow-hidden',
    cls: 'clipped',
    truth: 'bug',
    expected: 'Your session has expired',
    why: 'text pushed below a 56px overflow:hidden box',
    html: page('<p id="target" style="margin:90px 0 0">Your session has expired</p>'),
  },
  {
    id: 'ellipsis-truncated',
    cls: 'clipped',
    truth: 'bug',
    expected: 'Order confirmed for Alice Johnson',
    why: 'nowrap + text-overflow:ellipsis in a 230px box; the end of the string is not shown',
    html: page(
      '<p id="target" style="margin:0;width:230px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Order confirmed for Alice Johnson</p>'
    ),
  },
  {
    id: 'covered-by-overlay',
    cls: 'covered',
    truth: 'bug',
    expected: 'Confirm your email address',
    why: 'opaque cookie-banner style panel sits over the text',
    html: page(
      '<p id="target" style="margin:0">Confirm your email address</p><div style="position:absolute;left:0;top:0;right:0;bottom:0;background:#1a3a6b"></div>'
    ),
  },
  {
    id: 'opacity-near-zero',
    cls: 'invisible',
    truth: 'bug',
    expected: 'Welcome back, Sam',
    why: 'opacity 0.02 (a fade-in that never finished)',
    html: page('<p id="target" style="margin:0;opacity:0.02">Welcome back, Sam</p>'),
  },
  {
    id: 'font-size-1px',
    cls: 'invisible',
    truth: 'bug',
    expected: 'Terms and conditions apply',
    why: 'font-size: 1px',
    html: page('<p id="target" style="margin:0;font-size:1px">Terms and conditions apply</p>'),
  },
  {
    id: 'offscreen-left',
    cls: 'invisible',
    truth: 'bug',
    expected: 'Checkout complete',
    why: 'position:absolute; left:-9999px',
    html: page('<p id="target" style="margin:0;position:absolute;left:-9999px">Checkout complete</p>'),
  },
  {
    id: 'color-transparent',
    cls: 'invisible',
    truth: 'bug',
    expected: 'Reset your password',
    why: 'color: transparent (a broken gradient-text fallback)',
    html: page('<p id="target" style="margin:0;color:transparent">Reset your password</p>'),
  },
  {
    id: 'wrong-currency-css-content',
    cls: 'wrong text rendered',
    truth: 'bug',
    expected: 'Total: $14.00',
    why: 'DOM says "$14.00"; the "$" is font-size:0 and a ::before paints a euro sign instead',
    html: page(
      '<p id="target" style="margin:0">Total: <span class="cur">$</span>14.00</p>',
      '.cur{font-size:0}.cur::before{content:"\\20AC";font-size:24px}'
    ),
  },
  {
    id: 'text-in-image-stale',
    cls: 'wrong text rendered',
    truth: 'bug',
    expected: 'Free delivery over $50',
    why: 'banner is an image saying "$30"; the DOM copy (off-screen screen-reader text) says "$50"',
    html: (ctx) =>
      page(
        `<img src="${ctx.images.bannerStale}" alt="" style="display:block;height:40px"><p id="target" style="position:absolute;left:-9999px;margin:0">Free delivery over $50</p>`
      ),
  },

  {
    id: 'limit-same-text-visible-elsewhere',
    cls: 'limit probe',
    truth: 'bug',
    expected: 'Order confirmed',
    why: 'the #target element is invisible (opacity 0) but a different, visible element on the page shows the same words; a whole-screenshot check cannot tell them apart (a region or locator screenshot would)',
    html: page(
      '<p id="target" style="margin:0;opacity:0">Order confirmed</p><p style="margin:0;position:absolute;left:24px;top:80px">Order confirmed (toast)</p>'
    ),
  },

  // ---- controls and limit probes (a user can read these) ----
  {
    id: 'control-black-on-white',
    cls: 'control',
    truth: 'ok',
    expected: 'Order confirmed',
    why: 'plain #111 on white',
    html: page('<p id="target" style="margin:0">Order confirmed</p>'),
  },
  {
    id: 'control-dark-mode',
    cls: 'control',
    truth: 'ok',
    expected: 'Payment received',
    why: '#e8e8e8 on #121212',
    html: page('<p id="target" style="margin:0;color:#e8e8e8;background:#121212;padding:6px">Payment received</p>'),
  },
  {
    id: 'control-aa-boundary-grey',
    cls: 'control',
    truth: 'ok',
    expected: 'Delivery by Friday',
    why: '#767676 on white, about 4.5:1, just passes AA',
    html: page('<p id="target" style="margin:0;color:#767676">Delivery by Friday</p>'),
  },
  {
    id: 'control-correct-currency',
    cls: 'control',
    truth: 'ok',
    expected: 'Total: $14.00',
    why: 'same markup as the currency bug but the ::before paints "$"',
    html: page(
      '<p id="target" style="margin:0">Total: <span class="cur">$</span>14.00</p>',
      '.cur{font-size:0}.cur::before{content:"$";font-size:24px}'
    ),
  },
  {
    id: 'control-text-in-image-ok',
    cls: 'control',
    truth: 'ok',
    expected: 'Free delivery over $50',
    why: 'banner image says "$50", matching the DOM copy',
    html: (ctx) =>
      page(
        `<img src="${ctx.images.bannerOk}" alt="" style="display:block;height:40px"><p id="target" style="position:absolute;left:-9999px;margin:0">Free delivery over $50</p>`
      ),
  },
  {
    id: 'limit-large-text-3-to-1',
    cls: 'limit probe',
    truth: 'ok',
    expected: 'Big Sale',
    why: '64px #8a8a8a on white (about 3.4:1): passes WCAG AA for large text (3:1) but not the 4.5:1 this run asks for',
    html: page('<p id="target" style="margin:-14px 0 0;font-size:64px;line-height:1;color:#8a8a8a">Big Sale</p>'),
  },
  {
    id: 'limit-decorative-font',
    cls: 'limit probe',
    truth: 'ok',
    expected: 'Grand Opening Sale',
    why: 'asks for a cursive italic face, but on the benchmark machine no cursive font is installed so it fell back to the default sans (italic); this probe did not test a true decorative face',
    html: page(
      '<p id="target" style="margin:0;font-family:cursive,fantasy;font-style:italic;font-size:30px">Grand Opening Sale</p>'
    ),
  },
  {
    id: 'limit-small-text-9px',
    cls: 'limit probe',
    truth: 'ok',
    expected: 'Terms and conditions apply',
    why: '9px #222 on white: small, but legible to a person at 1x',
    html: page('<p id="target" style="margin:0;font-size:9px;color:#222">Terms and conditions apply</p>'),
  },
];

// Banner images are rendered from HTML at setup so no binary assets are committed.
export const bannerHtml = (text) =>
  `<!doctype html><html><body style="margin:0"><div style="width:360px;height:40px;background:#fff7d6;color:#3a2a00;font:bold 22px/40px sans-serif;text-align:center">${text}</div></body></html>`;
