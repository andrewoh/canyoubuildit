# Portfolio verification — November 4, 2026

- Production Next.js build and TypeScript checks pass.
- Browser exercised sculpture modes and pause, project category filters, case details, Escape dismissal, primary/comparison team selection, year slider, all three AI scenarios, and sample approval/reset. No page errors after correcting React's SVG title serialization.
- Mobile viewport 390 × 844 has no document overflow; reduced-motion mode retains mode controls. Desktop 1440 × 1000 visually reviewed.
- All 288 compact chart values match the existing source dataset to two decimal places; SF mean 139.6.
- Lower-contrast metadata in the light project section darkened for readability.
- Print profile verified as exactly one A4 page, visually rendered with Poppler, with production URLs in PDF links. Download available at /profile/andrew-oh.pdf.
- Existing production routes preserved. Original homepage at /archive; old root fragment anchors remain supported. Fixed inherited Amex static entry route and its script URL.
- Source/role claims grounded in existing project descriptions and user confirmation. AI walkthrough is labeled illustrative and deterministic.

## Bencho interaction pass — November 5, 2026

- Identified Bencho from the author's follow-up in the supplied Threads share, viewed in the user's signed-in Chrome session.
- Integrated four adaptations from MIT-licensed upstream commit `27ac3159201fa48eb16ef65faa5d8078963a9a61`: Magnetic Select, Magnifying Dock, Tilt, and Image Compare. Full source attribution and license are in `app/portfolio/bencho/`.
- Production build and TypeScript passed. Fresh browser session against the production build showed no console errors or warnings; verified pointer-driven tilt transform.
- Browser verified category filtering, Wardrobe pointer drag and keyboard Home/End, project dialog open/Escape, dock hidden during dialog, active section tracking, and global motion pause. Paused filter transforms are static and anchor scrolling is immediate.
- Visually checked mobile at 390 × 844; measured no horizontal overflow at 390px or 320px. Dock remains inside the 320px viewport. Restored the browser viewport after verification.
- Corrected initial filter transform hydration mismatch, viewport-height section observer margins, and mouse/keyboard focus precedence in the dock during review.
- Reduced-motion preferences are observed live and CSS fallbacks disable decorative motion. No dependency changes or project/data claim changes.
