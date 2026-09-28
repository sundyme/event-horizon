// headless smoke test of the live page: intro → film → free view → replay
import { launch } from './browser.mjs'; import { serve } from './server.mjs';
const port = 5950 + Math.floor(Math.random() * 40); const srv = await serve(port);
const b = await launch(['--autoplay-policy=no-user-gesture-required']);
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/404|ERR_/.test(m.text())) errs.push(m.text()); });
await p.goto(`http://localhost:${port}/index.html?debug`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await p.waitForFunction(() => !document.querySelector('#go').disabled, null, { timeout: 120000 });
const hz = () => p.evaluate(() => window.__hz());
await p.waitForTimeout(1500); console.log('attract', await hz());
await p.click('#go'); await p.waitForTimeout(4000); console.log('film', await hz());
await p.mouse.move(1000, 690); await p.waitForTimeout(200); await p.click('#bFree'); await p.waitForTimeout(2500); console.log('free', await hz());
await p.mouse.move(640, 360); await p.mouse.down(); await p.mouse.move(500, 330, { steps: 8 }); await p.mouse.up(); await p.mouse.wheel(0, -400); await p.waitForTimeout(800);
console.log('free after drag', await hz());
await p.mouse.move(1010, 695); await p.waitForTimeout(200); await p.click('#bReplay'); await p.waitForTimeout(2500); console.log('replay', await hz());
await p.screenshot({ path: 'out/flow.png' });
await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(19500); console.log('phone', await hz()); await p.screenshot({ path: 'out/flow_phone.png' }); console.log('phone after shot', await hz());
console.log(errs.length ? errs.join('\n') : 'no errors');
await b.close(); srv.close();
