// node tools/still.mjs outdir w h samples t1 t2 ...   → PNG stills via the film API
import { launch } from './browser.mjs'; import fs from 'fs'; import { serve } from './server.mjs';
const [out, w, h, sub, ...times] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const port = 5320 + Math.floor(Math.random() * 50);
const srv = await serve(port);
const b = await launch([]);
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = [];
p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); });
p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
const t0 = Date.now();
await p.goto(`http://localhost:${port}/index.html?film&w=${w}&h=${h}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await p.waitForFunction(() => document.title === 'READY' || document.title === 'ERROR', null, { timeout: 180000 });
console.log('init', Date.now() - t0, 'ms');
if (await p.title() === 'ERROR') { console.log(errs.join('\n')); console.log(await p.$eval('#err', e => e.textContent)); await b.close(); srv.close(); process.exit(1); }
for (const t of times) {
  const t1 = Date.now();
  await p.evaluate(([t, s]) => window.HORIZON.renderFrame(t, { samples: s }), [+t, +sub]);
  await p.$('#gl').then(el => el.screenshot({ path: `${out}/t${(+t).toFixed(2).padStart(6, '0')}.png` }));
  console.log(`t=${t} ${Date.now() - t1}ms`);
}
if (errs.length) console.log('console:', errs.slice(0, 20).join('\n'));
await b.close(); srv.close();
