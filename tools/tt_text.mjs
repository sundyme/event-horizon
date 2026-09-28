// node tools/tt_text.mjs outdir lang [fps] → transparent PNG text layer for the vertical cut, one file per frame
import { launch } from './browser.mjs'; import fs from 'fs'; import { serve } from './server.mjs';
const [out, lang, fpsArg] = process.argv.slice(2); const FPS = +(fpsArg || 30);
fs.mkdirSync(out, { recursive: true });
const port = 6400 + Math.floor(Math.random() * 200); const srv = await serve(port);
const b = await launch([]);
const p = await b.newPage({ viewport: { width: 600, height: 600 } });
await p.goto(`http://localhost:${port}/index.html?film&cut=tt&w=1080&h=1920`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await p.waitForFunction(() => document.title === 'READY' || document.title === 'ERROR', null, { timeout: 180000 });
const N = Math.round(await p.evaluate(() => 40.5) * FPS);
for (let n = 0; n < N; n++) {
  const url = await p.evaluate(([t, lang]) => window.HORIZON.ttText(t, lang), [n / FPS, lang]);
  fs.writeFileSync(`${out}/${String(n).padStart(5, '0')}.png`, Buffer.from(url.split(',')[1], 'base64'));
  if (n % 150 === 0) console.log(lang, n, '/', N);
}
await b.close(); srv.close(); console.log('done', out);
