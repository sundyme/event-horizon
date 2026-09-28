import http from 'http'; import fs from 'fs'; import path from 'path'; import url from 'url';
const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.wav': 'audio/wav', '.mp4': 'video/mp4', '.png': 'image/png' };
export function serve(port = 5310) {
  const srv = http.createServer((req, res) => {
    const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    fs.readFile(p.endsWith('/') ? p + 'index.html' : p, (err, data) => {
      if (err) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(data);
    });
  });
  return new Promise(r => srv.listen(port, () => r(srv)));
}
if (process.argv[1] === url.fileURLToPath(import.meta.url)) serve(+process.argv[2] || 5310).then(s => console.log('serving', s.address().port));
