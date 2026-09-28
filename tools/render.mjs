// node tools/render.mjs out.mp4 [--w 1920 --h 804 --fps 30 --spp 6 --step 0.6 --from 0 --to 72 --crf 14]
// Renders the film frame-by-frame through the page's own renderer (headless Chromium, Metal ANGLE) → ffmpeg.
import { launch } from './browser.mjs'; import { spawn } from 'child_process'; import { serve } from './server.mjs';
const args = process.argv.slice(2); const out = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const W = +opt('w', 1920), H = +opt('h', 804), FPS = +opt('fps', 30), SPP = +opt('spp', 6), STEP = +opt('step', 0.6), MAXS = +opt('maxs', 720);
const FROM = +opt('from', 0), TO = +opt('to', 72), CRF = opt('crf', '14'), CUT = opt('cut', '');
const port = 5600 + Math.floor(Math.random() * 300); const srv = await serve(port);
const b = await launch([]);
const p = await b.newPage({ viewport: { width: Math.min(W, 1920), height: Math.min(H, 1080) } });
p.on('pageerror', e => console.log('PAGEERROR', e.message));
await p.goto(`http://localhost:${port}/index.html?film${CUT ? '&cut=' + CUT : ''}&w=${W}&h=${H}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await p.waitForFunction(() => document.title === 'READY' || document.title === 'ERROR', null, { timeout: 180000 });
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
  '-vf', 'vflip', '-c:v', 'libx264', '-preset', 'slow', '-crf', CRF, '-tune', 'grain', '-pix_fmt', 'yuv420p',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const n0 = Math.round(FROM * FPS), n1 = Math.round(TO * FPS);
const t0 = Date.now();
for (let n = n0; n < n1; n++) {
  const t = n / FPS;
  const b64 = await p.evaluate(([t, spp, step, maxs, fps, n]) => { window.HORIZON.renderFrame(t, { samples: spp, step, maxSteps: maxs, shutter: 0.5 / fps, frame: n, overlay: false }); return window.HORIZON.readPixelsB64(); }, [t, SPP, STEP, MAXS, FPS, n]);
  const buf = Buffer.from(b64, 'base64');
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if ((n - n0) % 30 === 0) { const el = (Date.now() - t0) / 1000; console.log(`frame ${n}/${n1} t=${t.toFixed(2)} ${el.toFixed(0)}s  ${(el / (n - n0 + 1)).toFixed(2)}s/f  eta ${((el / (n - n0 + 1)) * (n1 - n)).toFixed(0)}s`); }
}
ff.stdin.end(); await new Promise(r => ff.on('close', r));
await b.close(); srv.close();
console.log('done', out, ((Date.now() - t0) / 1000).toFixed(0) + 's');
