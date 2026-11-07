const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs/promises');
const { publicFiles } = require('./build-public.cjs');

const root = path.resolve(__dirname, '..');
const port = Number(process.argv[2] || 4173);
const publicActions = new Set(['catalog', 'rules', 'niches', 'commerce-catalog']);
const catalogResponses = new Map();
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf'
};

async function loadPublicCatalog(action) {
  if (catalogResponses.has(action)) return catalogResponses.get(action);
  const upstreamUrl = 'https://miv-ecosystem.vercel.app/api/diagnoses?action=' + action;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(upstreamUrl, { redirect: 'error', signal: AbortSignal.timeout(5000) });
      if (!response.ok) continue;
      const data = await response.text();
      JSON.parse(data);
      catalogResponses.set(action, data);
      return data;
    } catch {
      // Retry once if the public catalog is temporarily unreachable.
    }
  }
  throw new Error('Catálogo público indisponível.');
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Security-Policy', "connect-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; object-src 'none'; form-action 'self'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  try {
    const url = new URL(req.url, 'http://127.0.0.1');
    const action = url.searchParams.get('action');
    if (url.pathname.startsWith('/api/')) {
      if (req.method === 'GET' && url.pathname === '/api/diagnoses' && publicActions.has(action)) {
        const data = await loadPublicCatalog(action);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(data);
      }
      res.writeHead(503, { 'Content-Type': 'application/json' });
      return res.end('{"error":"Serviço indisponível na prévia local."}');
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') return res.writeHead(405).end();
    const name = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
    const extension = path.extname(name).toLowerCase();
    const isMedia = /^assets\/(?:[\w.-]+\/)*[\w.-]+\.[a-z0-9]+$/i.test(name) &&
      !name.split('/').some(part => part.startsWith('.')) && /^(image|video|application\/pdf)/.test(mime[extension] || '');
    if (!publicFiles.includes(name) && !isMedia) return res.writeHead(404).end();
    const data = await fs.readFile(path.join(root, name));
    res.writeHead(200, { 'Content-Type': mime[extension], 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch (error) {
    if (res.headersSent) return res.end();
    if (req.url?.startsWith('/api/')) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      return res.end('{"error":"Catálogo público indisponível."}');
    }
    res.writeHead(error.code === 'ENOENT' ? 404 : 500).end();
  }
});

server.listen(port, '127.0.0.1', () => console.log('MIV V14 local: http://127.0.0.1:' + port));
