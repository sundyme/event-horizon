// node tools/audio.mjs out.wav  → renders the soundtrack offline via the page's own score
import { launch } from './browser.mjs'; import fs from 'fs'; import { serve } from './server.mjs';
const out = process.argv[2] || 'out/horizon.wav';
const port = 5500 + Math.floor(Math.random() * 90); const srv = await serve(port);
const b = await launch(['--autoplay-policy=no-user-gesture-required']);
const p = await b.newPage({ viewport: { width: 480, height: 200 } });
p.on('pageerror', e => console.log('PAGEERROR', e.message));
await p.goto(`http://localhost:${port}/index.html?film${process.argv[3] ? '&cut=' + process.argv[3] : ''}&w=480&h=200`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await p.waitForFunction(() => document.title === 'READY' || document.title === 'ERROR', null, { timeout: 180000 });
const t0 = Date.now();
const trim = +(process.argv[4] || 1);
const { b64, peak } = await p.evaluate(tr => window.HORIZON.renderAudioB64(48000, tr), trim);
fs.writeFileSync(out, Buffer.from(b64, 'base64'));
console.log('audio', out, 'peak', peak.toFixed(3), (Date.now() - t0) + 'ms');
await b.close(); srv.close();
