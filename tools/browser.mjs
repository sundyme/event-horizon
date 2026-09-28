// launches headless Chromium with the Metal ANGLE backend (WebGL2 on the GPU);
// falls back to any Chrome-for-Testing build in the Playwright cache if the pinned one is missing
import { chromium } from 'playwright'; import fs from 'fs'; import os from 'os'; import path from 'path';
export async function launch(extra = []) {
  const args = ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', ...extra];
  try { return await chromium.launch({ headless: true, channel: 'chromium', args }); }
  catch (e) {
    const root = path.join(os.homedir(), 'Library/Caches/ms-playwright');
    const builds = fs.readdirSync(root).filter(d => /^chromium-\d+$/.test(d)).sort((a, b) => +a.split('-')[1] - +b.split('-')[1]);
    for (const d of builds) {
      const exe = path.join(root, d, 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
      if (fs.existsSync(exe)) return chromium.launch({ headless: true, executablePath: exe, args });
    }
    throw e;
  }
}
