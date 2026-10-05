This is a design system extracted from a webpage I find inspiring. I want to build my own site/app UI inspired by this design pattern. Do not copy or replicate brand assets, logos, or identity — use these tokens as a foundation to create something original for me. Match the design language, not the brand:

Vibe: monochrome · modern
Rhythm: 4px grid · subtly rounded · generous line-height (2) · flat (no shadows)

Key colors: Background: #E9E9E9 · Text: #222222

Full palette: #000000 accent, #E9E9E9 surface, #F8F8F8 elevated, #222222 text, #4E4E4E muted

This page has no chromatic primary — it is a monochrome design. The brand language lives in surface contrast and typography.

Typography:
• H1 — Inter Tight 108.163px 600, 1 line-height
• H2 — Inter Tight 14px 400, 2 line-height
• H3 — Inter Tight 108.163px 600, 1 line-height
• Type scale — 108px / 19px / 14px

Tokens:
• Radius — 8px buttons
• Radius vocabulary — chip:4px
• Radius tokens — rounded-small: 4px, rounded-normal: 8px, rounded-large: 1rem, button-rounded: 8px, button-rounded-full: 72px
• Spacing scale — 4,8,12,16,20,24
• Spacing tokens — budget-circle-size: 24px
• Border color — #222222

Named color tokens (from CSS custom properties):
• --nf-bg-1: #ededed
• --nf-bg-2: #f8f8f8
• --nf-bg-3: #fff
• --nf-bg-count: #FF9667
• --color-primary: #222
• --color-primary-rgb: 34, 34, 34
• --color-link: #222
• --color-white: #fff
• --color-white-rgb: 255, 255, 255
• --color-orange: #FA5D29
• --color-errors: #FA5D29
• --color-blue: #49B3FC
• --color-featured: #f8f0ee
• --color-red: #FA5D29
• --color-underlined: 34, 34, 34
• --color-connect: #FF602C
• --color-connect-2: #FFAE94
• --color-connect-3: #FFC5B1
• --color-inspire: #AAEEC4
• --color-inspire-2: #C8E4D3
• --color-inspire-3: #E2F4E9
• --color-awards: #502bd8
• --color-awards-2: #6749d1
• --color-awards-3: #917eda

Motion:
• Durations — 0.3s

Components:
• Button — #222222 bg, #FFFFFF text, 8px radius, 500 weight
• Card — default card
• Input — default input
• Link — #DEDEDE

Responsive breakpoints: 576px, 700px, 768px, 1000px, 1023px, 1024px, 1100px, 1168px

Layout grid: max-width 1219px, 20px gutter
Spacing scale: 4px / 8px / 12px / 16px / 20px / 24px
Focus ring: 0px

Interaction states:
• hover — scale(1.05) translateY(-10px), opacity 0
• focus — 0px

Z-index layers: element: 2 → nav: 3 → dropdown: 9

Responsive component changes:
• at 1270px — body:has(.nav-header-main__link.is-open) .marque → display: none
• at 1270px — .header-main.has-search-fill .nav-header-main__i → display: none
• at 1270px — .header-main.has-search-fill .nav-header-main__l → display: none
• at 1024px — .header-main #g_id_onload → display: none
• at 1024px — .header-floating__left → height: 32px
• at 1024px — .list-palette__header → font-size: var(--text-size-primary)
• at 1023px — .header-main__bts → display: none
• at 1023px — .card-recommendation__content → width: 100%
• at 1000px — .nav-filters__left, .nav-filters__right → width: 100%
• at 1000px — .nav-filters__list > li → width: calc(50% - 3px)
• at 1000px — .nav-filters__list > li:nth-child(n+7) → display: none

Attach the screenshot from this page as a visual reference — match its hierarchy, density, and overall feel, not just the raw values. Where this brief leaves something underspecified (hover states, focus rings, dark-mode variants), infer sensible defaults consistent with the vibe and palette above.

This is for my personal project — I'm drawing inspiration from this design pattern to build my own UI. Create something original that follows these design principles without copying the source brand.