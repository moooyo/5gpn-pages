import { computeDomains, buildProfileFromDomains } from '../lib/profile.mjs';
import { validateRelayHost } from '../lib/domains.mjs';

const $ = (id) => document.getElementById(id);
const els = {
  host: $('host'), hostError: $('hostError'), token: $('token'), include: $('include'), exclude: $('exclude'),
  doh: $('doh'), http3: $('http3'), uiToggle: $('uiToggle'),
  modeBlack: $('modeBlack'), modeWhite: $('modeWhite'),
  oMode: $('oMode'), oMatch: $('oMatch'), oExcl: $('oExcl'), oSize: $('oSize'),
  installBtn: $('installBtn'), dlLink: $('dlLink'), notReady: $('notReady'),
  modeNote: $('modeNote'),
  qrBox: $('qrBox'), qrUrl: $('qrUrl'),
  sourceDetails: $('sourceDetails'), sourcePre: $('sourcePre'),
};

let mode = 'blacklist';
const lists = { relay: null, direct: null };
const presets = {};
let meta = null;
let blobUrl = null;
let currentXml = '';
let updateTimer = null;
let updateSeq = 0;

const MODE_NOTE = {
  blacklist: '黑名单：描述文件小、省专线，适合日常使用；名单未覆盖的新目标默认直连。',
  whitelist: '白名单：覆盖最全，未命中名单的一律走中继；目标在 KFCHost 节点解析，链路最干净。',
};
const SOURCE_PLACEHOLDER = '填入域名和令牌后，这里会显示生成的 .mobileconfig 源码（令牌会被隐藏）。';
const HOST_ERROR = {
  scheme: '请只填写域名，不要包含 https:// 或 http://。',
  port: '请只填写域名，不要包含端口（例如 :443）。',
  suffix: '请只填写域名，不要包含路径、斜杠、参数或片段。',
  format: '请输入有效的完整域名，例如 relay.example.com；不支持 IP 地址。',
};

const fetchJSON = async (u) => { const r = await fetch(u); if (!r.ok) throw new Error('load ' + u); return r.json(); };
const fetchText = async (u) => { const r = await fetch(u); if (!r.ok) throw new Error('load ' + u); return r.text(); };
async function loadList(name) { if (!lists[name]) lists[name] = await fetchJSON('./lists/' + name + '.json'); return lists[name]; }
async function loadPreset(m) { if (!presets[m]) presets[m] = await fetchText('./presets/' + m + '.mobileconfig'); return presets[m]; }
async function loadMeta() { if (!meta) meta = await fetchJSON('./lists/meta.json'); return meta; }

const linesOf = (el) => el.value.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
const fmtCount = (n) => n.toLocaleString('en-US').replace(/,/g, ' ');
const sizeLabel = () => mode === 'whitelist' ? '≈350 KB' : '≈150 KB';
// Escape XML metacharacters the same way lib/plist.mjs does, so the fast-path preset
// substitution produces well-formed XML for hosts/tokens that contain & < > (the custom
// path already escapes via toPlist).
const escXml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function readForm() {
  const doh = els.doh.value.trim();
  return {
    relayHost: els.host.value.trim(),
    token: els.token.value.trim(),
    include: linesOf(els.include),
    exclude: linesOf(els.exclude),
    http3: els.http3.checked,
    uiToggle: els.uiToggle.checked,
    dns: doh ? { dohURL: doh } : undefined,
  };
}

function readValidatedForm() {
  const form = readForm();
  const host = validateRelayHost(form.relayHost);
  form.relayHost = host.value;
  return { form, host };
}

function renderHostValidation(host) {
  const message = HOST_ERROR[host.reason] || '';
  els.host.setCustomValidity(message);
  if (message) {
    els.host.setAttribute('aria-invalid', 'true');
    els.hostError.textContent = message;
    els.hostError.hidden = false;
  } else {
    els.host.removeAttribute('aria-invalid');
    els.hostError.textContent = '';
    els.hostError.hidden = true;
  }
  return message;
}

// Common case: no custom rules and every advanced option at its default. Served from the
// pre-generated preset by substituting host + token — avoids rebuilding a ~110k-domain
// profile on every keystroke.
const isDefaultOpts = (f) =>
  f.include.length === 0 && f.exclude.length === 0 && !f.http3 && f.uiToggle === true && !f.dns;

function setBlob(xml) {
  if (blobUrl) URL.revokeObjectURL(blobUrl);
  blobUrl = URL.createObjectURL(new Blob([xml], { type: 'application/x-apple-aspen-config' }));
  currentXml = xml;
  els.oSize.textContent = sizeLabel();
  els.dlLink.href = blobUrl;
  els.dlLink.setAttribute('download', `5gpn-${mode}.mobileconfig`);
}
function clearBlob() {
  if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = null; }
  currentXml = '';
  els.oSize.textContent = sizeLabel();
  els.dlLink.removeAttribute('href');
}

function setReady(ready) {
  els.installBtn.hidden = !ready;
  els.dlLink.hidden = !ready;
  els.notReady.hidden = ready;
}

// The source <pre> is only populated while the <details> is open, so the whitelist
// XML never blocks first paint.
function renderSource() {
  if (!els.sourceDetails.open) return;
  const redacted = currentXml.replace(
    /(<key>X-Relay-Token<\/key>\s*<string>)[\s\S]*?(<\/string>)/g,
    '$1••••••••$2',
  );
  els.sourcePre.textContent = redacted || SOURCE_PLACEHOLDER;
}

function setMode(m) {
  mode = m === 'whitelist' ? 'whitelist' : 'blacklist';
  const white = mode === 'whitelist';
  els.modeBlack.setAttribute('aria-pressed', String(!white));
  els.modeWhite.setAttribute('aria-pressed', String(white));
  els.oMode.textContent = white ? '白名单模式' : '黑名单模式';
  els.oMode.className = white ? 'green' : 'indigo';
  els.oSize.textContent = sizeLabel();
  els.modeNote.textContent = MODE_NOTE[mode];
  clearTimeout(updateTimer);
  clearBlob();
  setReady(false);
  update();
}

const scheduleUpdate = () => {
  clearTimeout(updateTimer);
  updateSeq += 1;
  clearBlob();
  setReady(false);
  const { form, host } = readValidatedForm();
  const hostError = renderHostValidation(host);
  els.notReady.textContent = hostError || (host.valid && form.token ? '正在生成配置…' : '填入域名和令牌后即可生成');
  renderQR(form, host);
  renderSource();
  updateTimer = setTimeout(update, 150);
};

async function update() {
  const seq = ++updateSeq;
  const { form: f, host } = readValidatedForm();
  const white = mode === 'whitelist';
  const ready = host.valid && !!f.token;
  const hostError = renderHostValidation(host);
  els.notReady.textContent = hostError || (ready ? '正在生成配置…' : '填入域名和令牌后即可生成');
  setReady(false);
  renderQR(f, host);

  try {
    if (isDefaultOpts(f)) {
      // fast path: counts from meta, profile from preset substitution
      const m = await loadMeta();
      if (seq !== updateSeq) return;
      els.oMatch.textContent = white ? '其余全部' : fmtCount(m.counts.relay) + ' 条';
      els.oExcl.textContent = white ? fmtCount(m.counts.direct) + ' 条' : '其余全部';
      if (ready) {
        const tmpl = await loadPreset(mode);
        if (seq !== updateSeq) return;
        setBlob(tmpl.split('__RELAY_HOST__').join(escXml(f.relayHost)).split('__RELAY_TOKEN__').join(escXml(f.token)));
        setReady(true);
      } else {
        clearBlob();
      }
    } else {
      // custom path: need the raw list for this mode
      await loadList(white ? 'direct' : 'relay');
      if (seq !== updateSeq) return;
      const { match, excluded } = computeDomains({ mode, lists, include: f.include, exclude: f.exclude });
      els.oMatch.textContent = white ? '其余全部' : fmtCount(match.length) + ' 条';
      els.oExcl.textContent = white
        ? fmtCount(excluded.length) + ' 条'
        : (excluded.length ? `其余全部（+ ${fmtCount(excluded.length)} 条）` : '其余全部');
      if (ready) {
        setBlob(buildProfileFromDomains({
          relayHost: f.relayHost, token: f.token, mode, match, excluded,
          http3: f.http3, uiToggle: f.uiToggle, dns: f.dns,
        }));
        setReady(true);
      } else {
        clearBlob();
      }
    }
  } catch (e) {
    clearBlob();
    els.notReady.textContent = '生成失败：' + (e.message || e);
    setReady(false); // a failed build reverts to the disabled state rather than inert buttons
  }
  renderSource();
}

function renderQR(f, host) {
  const params = new URLSearchParams({ mode: mode === 'whitelist' ? 'white' : 'black' });
  if (host.valid) params.set('host', host.value);
  if (f.token) params.set('token', f.token);
  if (f.http3) params.set('http3', '1');
  if (f.dns) params.set('doh', f.dns.dohURL);
  if (!f.uiToggle) params.set('toggle', '0');
  // Keep relay details in the fragment: unlike query parameters, fragments are never
  // included in the HTTP request, server logs, or the Referer header.
  const baseURL = location.origin + location.pathname;
  const url = baseURL + '#' + params.toString();
  els.qrUrl.textContent = f.token ? baseURL + '#…（令牌已隐藏）' : url;
  els.qrUrl.href = url;
  if (window.qrcode) {
    try {
      const qr = window.qrcode(0, 'M');
      qr.addData(url);
      qr.make();
      els.qrBox.innerHTML = qr.createImgTag(4, 8);
    } catch (_) {
      els.qrBox.textContent = 'QR';
    }
  }
}

function prefill() {
  const q = new URLSearchParams(location.hash.replace(/^#/, ''));
  if (q.get('host')) els.host.value = q.get('host');
  if (q.has('token')) els.token.value = q.get('token');
  if (q.get('doh')) els.doh.value = q.get('doh');
  if (q.get('http3') === '1') els.http3.checked = true;
  if (q.get('toggle') === '0') els.uiToggle.checked = false;
  const initialMode = q.get('mode') === 'white' ? 'whitelist' : 'blacklist';
  if (q.has('token')) {
    q.delete('token');
    const safeHash = q.toString();
    history.replaceState(null, '', location.pathname + location.search + (safeHash ? '#' + safeHash : ''));
  }
  return initialMode;
}

function hasCurrentProfile() {
  const { form, host } = readValidatedForm();
  return !!blobUrl && host.valid && !!form.token;
}

els.installBtn.addEventListener('click', () => { if (hasCurrentProfile()) window.location.href = blobUrl; });
els.dlLink.addEventListener('click', (event) => {
  if (!hasCurrentProfile()) {
    event.preventDefault();
    scheduleUpdate();
  }
});
els.modeBlack.addEventListener('click', () => setMode('blacklist'));
els.modeWhite.addEventListener('click', () => setMode('whitelist'));
for (const el of [els.host, els.token, els.include, els.exclude, els.doh]) el.addEventListener('input', scheduleUpdate);
for (const el of [els.http3, els.uiToggle]) el.addEventListener('change', scheduleUpdate);
els.sourceDetails.addEventListener('toggle', renderSource);

setMode(prefill());
