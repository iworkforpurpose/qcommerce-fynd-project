const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const host = '127.0.0.1';
const port = 4173;
const publicRoot = path.join(__dirname, 'public');
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

function notFound(response) {
  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Not found\n');
}

const server = http.createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end();
    return;
  }

  try {
    const pathname = decodeURIComponent(request.url.split('?', 1)[0]);
    if (!pathname.startsWith('/') || pathname.includes('\\') || pathname.split('/').includes('..')) {
      return notFound(response);
    }

    const assetPath = pathname === '/' ? '/index.html' : pathname;
    const contentType = contentTypes[path.extname(assetPath)];
    if (!contentType) return notFound(response);

    const file = await fs.realpath(path.resolve(publicRoot, `.${assetPath}`));
    if (!file.startsWith(publicRoot + path.sep)) return notFound(response);
    if (!(await fs.stat(file)).isFile()) return notFound(response);

    const body = await fs.readFile(file);
    response.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': body.length,
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    notFound(response);
  }
});

server.listen(port, host, () => {
  console.log(`Supplement Shop is running at http://${host}:${port}/`);
});
