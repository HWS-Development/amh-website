# Riad contact click tracking

## Scope
- Four explicit React handlers on the riad detail contact links only: `appeler`, `email`, `site_riad`, `reserver`.
- GA4 event: `clic_contact`, destination `G-BS4V21E0H6`, parameters `bouton`, `riad` (URL slug), `riad_nom`, `link_url`.
- Ads event: `conversion`, destination `AW-18514629947/oYl7CJPf16wdELuqu_xE`.
- No document-wide listener, label guessing, navigation delay, or `preventDefault` in tracking. No additional Google tag initialization.
- Maps, WhatsApp, the homepage booking widget and HWS attribution are outside this conversion's scope.

## Verification
- `PATH="/usr/local/bin:$PATH" node --test scripts/riadContactTracking.test.mjs`: 8 tests passed, including no tracker, a throwing tracker, unrelated actions and translated booking labels.
- `PATH="/usr/local/bin:$PATH" npm run build`: passed; JS gzip 367.72 kB versus 367.42 kB before this change.
- Production-build browser checks on Riad Mazaya using actual Centra content: FR 1440×900, EN 390×844, ES 320×740.
- Four contacts: exactly one GA4/Ads pair each; correct slug, property name, resolved link URL and identifiers.
- Nested SVG click, keyboard Enter and a contact click after language switching: one event pair, no duplicates.
- Three unrelated links tested: zero contact conversions. Native actions were not cancelled by tracking.
- Call control remains keyboard-focusable, ≥44px high, and inside the viewport.
- Browser tests stubbed `gtag` and blocked Google measurement loading: no live test conversions, emails, calls or reservations were made.

## Account-side settings
This patch sends click conversions, not confirmed calls, emails or reservations. The Google Ads action name/category, “One” counting setting, consent configuration and attribution/reporting must be verified in the Ads account separately; this patch does not change them.
