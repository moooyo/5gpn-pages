import assert from 'node:assert/strict';
import test from 'node:test';

import { validateRelayHost } from './domains.mjs';

test('validateRelayHost accepts bare fully qualified domains', () => {
  for (const input of ['relay.example.com', 'RELAY.5GPN.DE', 'edge.xn--fiqs8s']) {
    assert.equal(validateRelayHost(input).valid, true, input);
  }
  assert.equal(validateRelayHost(' RELAY.5GPN.DE ').value, 'relay.5gpn.de');
});

test('validateRelayHost rejects schemes, ports, paths, and non-domain hosts', () => {
  const cases = [
    ['https://relay.5gpn.de', 'scheme'],
    ['http://relay.5gpn.de', 'scheme'],
    ['relay.5gpn.de:443', 'port'],
    ['relay.5gpn.de/path', 'suffix'],
    ['relay.5gpn.de?key=value', 'suffix'],
    ['127.0.0.1', 'format'],
    ['localhost', 'format'],
    ['bad_label.example.com', 'format'],
    ['-relay.example.com', 'format'],
    ['relay.example.com.', 'format'],
  ];
  for (const [input, reason] of cases) {
    assert.deepEqual(validateRelayHost(input), { valid: false, value: input.toLowerCase(), reason });
  }
});
