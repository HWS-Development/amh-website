import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { trackRiadContactClick } from '../src/lib/riadContactTracking.js';

const originalWindow = globalThis.window;
afterEach(() => {
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
});

function setup(gtag) {
  globalThis.window = { location: { pathname: '/riad/riad-mazaya/' }, gtag };
}

for (const [type, href] of [
  ['appeler', 'tel:+212660535613'],
  ['email', 'mailto:contact@riad.test'],
  ['site_riad', 'https://riad.test/'],
  ['reserver', 'https://www.simplebooking.it/portal/256/hotel/11010?lang=ES'],
]) {
  test(`${type}: one GA4 event and one Ads conversion with the exact identifiers`, () => {
    const calls = [];
    setup((...args) => calls.push(args));
    const event = { currentTarget: { href }, preventDefault() { assert.fail('Do not block native links'); } };
    trackRiadContactClick(event, type, ' Riad Mazaya ');
    assert.deepEqual(calls, [
      ['event', 'clic_contact', {
        send_to: 'G-BS4V21E0H6', bouton: type, riad: 'riad-mazaya',
        riad_nom: 'Riad Mazaya', link_url: href,
      }],
      ['event', 'conversion', { send_to: 'AW-18514629947/oYl7CJPf16wdELuqu_xE' }],
    ]);
  });
}

test('no tracker or no browser: links still work without exceptions', () => {
  delete globalThis.window;
  assert.doesNotThrow(() => trackRiadContactClick({ currentTarget: { href: 'tel:+212660535613' } }, 'appeler', 'Riad'));
  setup(undefined);
  assert.doesNotThrow(() => trackRiadContactClick({ currentTarget: { href: 'tel:+212660535613' } }, 'appeler', 'Riad'));
});

test('unrelated actions and missing links do not create conversions', () => {
  const calls = [];
  setup((...args) => calls.push(args));
  for (const type of ['whatsapp', 'maps', 'search', 'hws', '']) {
    trackRiadContactClick({ currentTarget: { href: 'https://example.test/' } }, type, 'Riad');
  }
  trackRiadContactClick({}, 'email', 'Riad');
  assert.equal(calls.length, 0);
});

test('an analytics error does not block the action or the separate Ads call', () => {
  const events = [];
  setup((_, name) => { events.push(name); if (name === 'clic_contact') throw new Error('Tracking unavailable'); });
  assert.doesNotThrow(() => trackRiadContactClick({ currentTarget: { href: 'tel:+212660535613' } }, 'appeler', 'Riad'));
  assert.deepEqual(events, ['clic_contact', 'conversion']);
});

test('translated labels never determine the event type; a booking fallback remains reserver', () => {
  const calls = [];
  setup((...args) => calls.push(args));
  for (const label of ['Réserver maintenant', 'Book Now', 'Reservar ahora']) {
    trackRiadContactClick({ currentTarget: { href: 'https://riad.test/', textContent: label } }, 'reserver', 'Riad');
  }
  assert.equal(calls.length, 6);
  assert.ok(calls.filter((args) => args[1] === 'clic_contact').every((args) => args[2].bouton === 'reserver'));
});
