// node tools/tt_still.mjs outdir w h spp lang t1 t2 ...  → composited previews of the vertical cut (picture + text)
import { launch } from './browser.mjs'; import fs from 'fs'; import { serve } from './server.mjs';
const [out, w, h, spp, lang, ...times] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const port = 6100 + Math.floor(Math.random() * 200); const srv = await serve(port);
const b = await launch([]);
const p = await b.newPage({ viewport: { width: 800, height: 800 } });
const errs = []; p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/404|ERR_/.test(m.text())) errs.push(m.text()); });
await p.goto(`http://localhost:${port}/index.html?film&cut=tt&w=${w}&h=${h}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await p.waitForFunction(() => document.title === 'READY' || document.title === 'ERROR', null, { timeout: 180000 });
if (await p.title() === 'ERROR') { console.log(await p.$eval('#err', e => e.textContent)); process.exit(1); }
for (const t of times) {
  const url = await p.evaluate(([t, spp, lang]) => {
    window.HORIZON.renderFrame(t, { samples: spp, overlay: false, shutter: 0.5 / 30 });
    const txt = window.HORIZON.ttText(t, lang);
    const gl = document.getElementById('gl'), c = document.createElement('canvas'); c.width = gl.width; c.height = gl.height;
    const g = c.getContext('2d'); g.drawImage(gl, 0, 0);
    return new Promise(res => { const im = new Image(); im.onload = () => { g.drawImage(im, 0, 0); res(c.toDataURL('image/jpeg', 0.9)); }; im.src = txt; });
  }, [+t, +spp, lang]);
  fs.writeFileSync(`${out}/t${(+t).toFixed(2).padStart(6, '0')}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
}
if (errs.length) console.log(errs.join('\n'));
await b.close(); srv.close();
