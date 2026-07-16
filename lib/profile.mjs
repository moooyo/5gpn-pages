// Single source of truth for building the iOS Network Relay .mobileconfig.
// Used by both the web generator (browser) and the CLI (Node) — keep it dependency-free
// beyond ./plist.mjs and ./domains.mjs.

import { toPlist } from './plist.mjs';
import { collapse, subtract, union, normalizeDomain, validateRelayHost } from './domains.mjs';

const uuid = () => globalThis.crypto.randomUUID().toUpperCase();

function relayPayload({ relayHost, token, match, excluded, http3, uiToggle }) {
  const relay = { HTTP2RelayURL: `https://${relayHost}/` };
  if (http3) relay.HTTP3RelayURL = `https://${relayHost}/`;
  if (token) relay.AdditionalHTTPHeaderFields = { 'X-Relay-Token': token };

  const p = {
    PayloadType: 'com.apple.relay.managed',
    PayloadVersion: 1,
    PayloadIdentifier: `net.5gpn.relay.relay.${uuid()}`,
    PayloadUUID: uuid(),
    PayloadDisplayName: '5GPN Relay',
    Relays: [relay],
    // The profile key is honored on iOS 26+; older versions ignore it.
    UIToggleEnabled: uiToggle !== false,
  };
  // Empty MatchDomains (omitted) means "route everything to the relay except ExcludedDomains".
  if (match.length) p.MatchDomains = match;
  if (excluded.length) p.ExcludedDomains = excluded;
  return p;
}

function dnsPayload({ dohURL, serverName }) {
  const settings = { DNSProtocol: 'HTTPS', ServerURL: dohURL };
  if (serverName) settings.ServerName = serverName;
  return {
    PayloadType: 'com.apple.dnsSettings.managed',
    PayloadVersion: 1,
    PayloadIdentifier: `net.5gpn.relay.dns.${uuid()}`,
    PayloadUUID: uuid(),
    PayloadDisplayName: '5GPN DoH',
    DNSSettings: settings,
  };
}

/**
 * Resolve the MatchDomains / ExcludedDomains sets for a mode.
 *  - blacklist: relay only the listed (+ user include) domains; everything else stays direct.
 *  - whitelist: relay everything except the listed (+ user exclude) domains.
 * User rules: include = force-relay, exclude = force-direct.
 */
export function computeDomains({ mode, lists, include = [], exclude = [] }) {
  const inc = include.map(normalizeDomain).filter(Boolean);
  const exc = exclude.map(normalizeDomain).filter(Boolean);

  if (mode === 'blacklist') {
    return {
      match: collapse(subtract(union(lists.relay || [], inc), exc)),
      excluded: collapse(exc),
    };
  }
  if (mode === 'whitelist') {
    return {
      match: [], // empty => relay all
      excluded: collapse(subtract(union(lists.direct || [], exc), inc)),
    };
  }
  throw new Error(`unknown mode: ${mode} (expected "blacklist" or "whitelist")`);
}

/**
 * Build the .mobileconfig XML from already-computed MatchDomains/ExcludedDomains.
 * Use this when you have run computeDomains() yourself (e.g. to show stats first)
 * so the domain lists aren't collapsed twice.
 */
export function buildProfileFromDomains(o) {
  if (!o.relayHost) throw new Error('relayHost is required');
  if (!o.mode) throw new Error('mode is required');
  const relayHost = validateRelayHost(o.relayHost);
  if (!relayHost.valid) throw new Error('relayHost must be a bare, fully qualified domain name');

  const payloads = [
    relayPayload({
      relayHost: relayHost.value,
      token: o.token,
      match: o.match || [],
      excluded: o.excluded || [],
      http3: o.http3,
      uiToggle: o.uiToggle,
    }),
  ];
  if (o.dns && o.dns.dohURL) payloads.push(dnsPayload(o.dns));

  const modeLabel = o.mode === 'whitelist' ? '白名单模式' : '黑名单模式';
  const profile = {
    PayloadType: 'Configuration',
    PayloadVersion: 1,
    PayloadIdentifier: `net.5gpn.relay.${o.mode}`,
    PayloadUUID: uuid(),
    PayloadDisplayName: o.name || `5GPN Relay — ${modeLabel}`,
    PayloadDescription: 'Apple Network Relay（MASQUE）· 按规则分流，指定流量走专线。',
    PayloadOrganization: '5GPN',
    PayloadRemovalDisallowed: false,
    PayloadContent: payloads,
  };
  return toPlist(profile);
}

/**
 * Build the full .mobileconfig XML string from lists + rules.
 * @param {object} o  see computeDomains + buildProfileFromDomains fields
 */
export function buildProfile(o) {
  const { match, excluded } = computeDomains(o);
  return buildProfileFromDomains({ ...o, match, excluded });
}
