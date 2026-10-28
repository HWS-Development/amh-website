const GA4_ID = 'G-BS4V21E0H6';
const ADS_CONVERSION = 'AW-18514629947/oYl7CJPf16wdELuqu_xE';
const CONTACT_TYPES = new Set(['appeler', 'email', 'site_riad', 'reserver']);

// Called only by the four riad contact links. Explicit types avoid guessing from
// translated labels or counting unrelated links (Maps, WhatsApp, HWS, etc.).
// No global listener: React route changes/re-renders cannot duplicate tracking.
export function trackRiadContactClick(event, type, riadName) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  const anchor = event?.currentTarget;
  if (!CONTACT_TYPES.has(type) || !anchor?.href) return;

  const params = {
    bouton: type,
    riad: window.location.pathname.split('/').filter(Boolean).pop() || '',
    riad_nom: String(riadName || '').trim(),
    link_url: anchor.href,
  };

  for (const [name, payload] of [
    ['clic_contact', { send_to: GA4_ID, ...params }],
    ['conversion', { send_to: ADS_CONVERSION }],
  ]) {
    try {
      window.gtag('event', name, payload);
    } catch {
      // Measurement must never prevent a real call, email or booking navigation.
    }
  }
}
