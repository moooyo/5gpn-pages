import assert from 'node:assert/strict';
import test from 'node:test';

import { buildProfileFromDomains } from './profile.mjs';

const baseProfile = {
  relayHost: 'RELAY.5GPN.DE',
  token: 'test-token',
  mode: 'blacklist',
  match: ['example.com'],
  excluded: [],
};

test('buildProfileFromDomains normalizes a valid relay host', () => {
  const xml = buildProfileFromDomains(baseProfile);
  assert.match(xml, /<string>https:\/\/relay\.5gpn\.de\/<\/string>/);
  assert.match(xml, /<key>UIToggleEnabled<\/key>\s*<true\/>/);
});

test('buildProfileFromDomains preserves the disabled UI toggle', () => {
  const xml = buildProfileFromDomains({ ...baseProfile, uiToggle: false });
  assert.match(xml, /<key>UIToggleEnabled<\/key>\s*<false\/>/);
});

test('buildProfileFromDomains rejects relay URLs and ports', () => {
  for (const relayHost of ['https://relay.5gpn.de', 'relay.5gpn.de:443']) {
    assert.throws(
      () => buildProfileFromDomains({ ...baseProfile, relayHost }),
      /relayHost must be a bare, fully qualified domain name/,
    );
  }
});
