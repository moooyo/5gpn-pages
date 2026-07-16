// Minimal Apple Configuration-Profile (XML) plist serializer.
// Supports: dict (plain object), array, string, boolean, integer, and data() wrappers.
// Deterministic output (no Date/random) so callers control identifiers/UUIDs.

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/** Wrap a base64 string so it serializes as <data>. */
export const data = (base64) => ({ __plistData__: String(base64) });

function node(value, indent) {
  const pad = '\t'.repeat(indent);

  if (value && typeof value === 'object' && '__plistData__' in value) {
    return `${pad}<data>${value.__plistData__}</data>`;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return `${pad}<array/>`;
    const items = value.map((v) => node(v, indent + 1)).join('\n');
    return `${pad}<array>\n${items}\n${pad}</array>`;
  }
  if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return `${pad}<dict/>`;
    const items = keys
      .map((k) => `${pad}\t<key>${esc(k)}</key>\n${node(value[k], indent + 1)}`)
      .join('\n');
    return `${pad}<dict>\n${items}\n${pad}</dict>`;
  }
  if (typeof value === 'boolean') return `${pad}<${value ? 'true' : 'false'}/>`;
  if (typeof value === 'number' && Number.isInteger(value)) return `${pad}<integer>${value}</integer>`;
  if (typeof value === 'number') return `${pad}<real>${value}</real>`;
  return `${pad}<string>${esc(value)}</string>`;
}

export function toPlist(obj) {
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n' +
    '<plist version="1.0">\n' +
    node(obj, 0) +
    '\n</plist>\n'
  );
}
