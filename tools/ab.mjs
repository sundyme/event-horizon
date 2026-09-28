// node tools/ab.mjs outdir w h samples "query" t1 t2 ...  (extra query string for A/B tests)
import { launch } from './browser.mjs'; import fs from 'fs'; import { serve } from './server.mjs';
const [out, w, h, sub, qs, ...times] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const port = 5400 + Math.floor(Math.random() * 90); const srv = await serve(port);
const b = await launch([]);
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = []; p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(`http://localhost:${port}/index.html?film&w=${w}&h=${h}&${qs}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await p.waitForFunction(() => document.title === 'READY' || document.title === 'ERROR', null, { timeout: 180000 });
if (await p.title() === 'ERROR') { console.log(await p.$eval('#err', e => e.textContent)); process.exit(1); }
const tag = qs.replace(/[^a-z0-9]+/gi, '_');
for (const t of times) { await p.evaluate(([t, s]) => window.HORIZON.renderFrame(t, { samples: s }), [+t, +sub]); await (await p.$('#gl')).screenshot({ path: `${out}/${tag}_t${(+t).toFixed(2).padStart(6, '0')}.png` }); }
if (errs.filter(e => !/404/.test(e)).length) console.log(errs.join('\n'));
await b.close(); srv.close();
