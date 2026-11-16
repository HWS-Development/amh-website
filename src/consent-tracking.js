import { allowed, whenAllowed } from '@hws/cookie-consent';

let initialized = false;
function configure(id) {
  window.dataLayer ||= [];
  window.gtag ||= function () { window.dataLayer.push(arguments); };
  if (!initialized) {
    initialized = true;
    window.gtag('consent', 'default', {
      analytics_storage: allowed('analytics') ? 'granted' : 'denied',
      ad_storage: allowed('marketing') ? 'granted' : 'denied',
      ad_user_data: allowed('marketing') ? 'granted' : 'denied',
      ad_personalization: allowed('marketing') ? 'granted' : 'denied',
    });
    window.gtag('js', new Date());
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.append(script);
  }
  window.gtag('consent', 'update', {
    analytics_storage: allowed('analytics') ? 'granted' : 'denied',
    ad_storage: allowed('marketing') ? 'granted' : 'denied',
    ad_user_data: allowed('marketing') ? 'granted' : 'denied',
    ad_personalization: allowed('marketing') ? 'granted' : 'denied',
  });
  window.gtag('config', id, { allow_google_signals: false, allow_ad_personalization_signals: allowed('marketing') });
}
whenAllowed('analytics', () => configure('G-BS4V21E0H6'));
whenAllowed('marketing', () => configure('AW-18514629947'));
