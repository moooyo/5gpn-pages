// Browser-safe domain helpers shared by the web app, the profile builder, and the
// list build script. Pure string operations — no Node or DOM APIs.

/**
 * Clean an arbitrary token into a bare registrable-ish domain, or '' if it isn't one.
 * Strips scheme, leading "*.", path/port/query, and stray dots.
 */
export function normalizeDomain(input) {
  let d = String(input || '').trim().toLowerCase();
  d = d
    .replace(/^https?:\/\//, '')
    .replace(/^\*\./, '')
    .replace(/[/:?#].*$/, '')
    .replace(/^\.+/, '')
    .replace(/\.+$/, '');
  // must be dotted, valid host chars only (punycode xn-- allowed)
  if (!/^([a-z0-9-]+\.)+[a-z0-9-]+$/.test(d)) return '';
  return d;
}

export function isSubdomainOf(domain, parent) {
  return domain === parent || domain.endsWith('.' + parent);
}

/**
 * De-duplicate and drop any domain that is already covered by a shorter parent
 * in the same set (Apple's MatchDomains/ExcludedDomains match subdomains
 * automatically, so listing a.example.com when example.com is present is redundant).
 *
 * O(n · labels): for each domain, check whether any ancestor domain is in the set.
 * (The naive "compare against every kept domain" is O(n²) and freezes the browser
 * on the ~110k-entry direct list.)
 */
export function collapse(domains) {
  const set = new Set();
  for (const d of domains) if (d) set.add(d);
  const out = [];
  for (const d of set) {
    let rest = d;
    let covered = false;
    for (let dot = rest.indexOf('.'); dot >= 0; dot = rest.indexOf('.')) {
      rest = rest.slice(dot + 1); // strip the leftmost label → an ancestor domain
      if (set.has(rest)) { covered = true; break; }
    }
    if (!covered) out.push(d);
  }
  return out.sort();
}

/** Remove from `base` every domain that equals or is a subdomain of any entry in `remove`. */
export function subtract(base, remove) {
  const rm = (remove || []).filter(Boolean);
  if (!rm.length) return [...base];
  return base.filter((d) => !rm.some((r) => isSubdomainOf(d, r)));
}

export function union(...lists) {
  return [].concat(...lists);
}
