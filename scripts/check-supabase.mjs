import { loadEnv } from 'vite';

const env = loadEnv(process.argv[2] || 'development', process.cwd(), 'REACT_APP_');
const url = env.REACT_APP_SUPABASE_URL?.trim();
const key = env.REACT_APP_SUPABASE_ANON_KEY?.trim();
let failures = 0;
function report(label, ok, message) {
  console.log(`${ok ? 'OK' : 'FAIL'} ${label}: ${message}`);
  if (!ok) failures++;
}

async function check() {
  let host;
  try {
    host = new URL(url).hostname;
    if (!key || !/^https?:\/\//.test(url)) throw new Error();
  } catch {
    report('Configuration', false, '.env içindeki REACT_APP_SUPABASE_URL ve REACT_APP_SUPABASE_ANON_KEY değerlerini kontrol edin.');
    return;
  }
  console.log(`Supabase host: ${host} (anahtar gösterilmez)`);
  if (key.startsWith('sb_secret_')) {
    report('Key', false, 'Tarayıcıda secret key kullanılamaz. Publishable/anon key kullanın.');
    return;
  }
  if (key.split('.').length === 3) {
    try {
      const claims = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString());
      const matches = !claims.ref || host === `${claims.ref}.supabase.co`;
      report('Key project', matches && claims.role === 'anon', 'Anon key ve proje adresi eşleşmesi');
      report('Key expiry', !claims.exp || claims.exp * 1000 > Date.now(), 'Anahtar son kullanma tarihi');
      if (!matches || claims.role !== 'anon') return;
    } catch {
      report('Key', false, 'Anahtar JWT verisi okunamıyor.');
      return;
    }
  }

  const dnsResults = await Promise.all(['https://dns.google/resolve', 'https://cloudflare-dns.com/dns-query'].map(async (resolver) => {
    try {
      const response = await fetch(`${resolver}?name=${encodeURIComponent(host)}&type=A`, {
        headers: { accept: 'application/dns-json' }, signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      report(new URL(resolver).hostname, result.Status === 0, result.Status === 3 ? 'NXDOMAIN: proje adresi bulunamıyor; Paused durumu ve doğru Project URL kontrol edilmeli.' : `DNS status ${result.Status}`);
      return result.Status;
    } catch (error) {
      console.log(`DNS doğrulaması yapılamadı (${new URL(resolver).hostname}): ${error.message}`);
      return null;
    }
  }));
  if (dnsResults.every((status) => status === 3)) return;

  const endpoints = [
    ['Auth', '/auth/v1/health'],
    ['Themes', '/rest/v1/themes?select=id&limit=1'],
    ['Conversions schema', '/rest/v1/conversions?select=id,user_display_name,prompt&limit=0'],
    ['Profiles schema', '/rest/v1/profiles?select=id&limit=0'],
    ['Convert function', '/functions/v1/convert', { method: 'POST', body: JSON.stringify({ action: 'healthcheck' }) }],
  ];
  for (const [label, endpoint, options = {}] of endpoints) {
    try {
      const response = await fetch(`${url.replace(/\/$/, '')}${endpoint}`, {
        ...options,
        headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(12000),
      });
      // Anonymous requests must be rejected by the deployed conversion function.
      const ok = label === 'Convert function' ? response.status === 401 : response.ok;
      report(label, ok, `HTTP ${response.status}${label === 'Convert function' ? ' (oturumsuz istek için 401 beklenir; 400 eski fonksiyonun hâlâ yayında olabileceğini gösterir)' : ''}`);
    } catch (error) {
      report(label, false, error.cause?.code || error.message);
    }
  }
  console.log('Bu kontrol kullanıcı girişi, Storage yükleme/RLS ve ücretli Gemini üretimini doğrulamaz.');
}

try { await check(); } catch (error) { report('Check', false, error.message); }
process.exitCode = failures ? 1 : 0;
