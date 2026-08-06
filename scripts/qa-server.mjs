import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import eventsHandler from '../netlify/functions/events.mjs';
import municipalitiesHandler from '../netlify/functions/municipalities.mjs';
import coverageHandler from '../netlify/functions/coverage.mjs';

process.env.EVENTS_QA_MODE = '1';
const root = process.cwd();
const port = Number(process.env.PORT || 8888);
const api = new Map([
  ['/api/events', eventsHandler],
  ['/api/municipalities', municipalitiesHandler],
  ['/api/coverage', coverageHandler],
]);
const types = new Map([['.html','text/html; charset=utf-8'],['.js','text/javascript; charset=utf-8'],['.css','text/css; charset=utf-8'],['.json','application/json; charset=utf-8'],['.svg','image/svg+xml'],['.png','image/png'],['.jpg','image/jpeg'],['.jpeg','image/jpeg'],['.pdf','application/pdf']]);

function toRequest(req) {
  const url = `http://127.0.0.1:${port}${req.url}`;
  return new Request(url, { method: req.method, headers: req.headers, body: ['GET','HEAD'].includes(req.method) ? undefined : Readable.toWeb(req), duplex: 'half' });
}

async function sendResponse(response, res) {
  res.writeHead(response.status, Object.fromEntries(response.headers));
  if (!response.body) return res.end();
  for await (const chunk of Readable.fromWeb(response.body)) res.write(chunk);
  res.end();
}

http.createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, `http://127.0.0.1:${port}`).pathname;
    if (api.has(pathname)) return sendResponse(await api.get(pathname)(toRequest(req)), res);
    const relative = pathname === '/' ? 'index.html' : pathname === '/eventi' ? 'eventi.html' : pathname.replace(/^\//, '');
    const file = path.resolve(root, relative);
    if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404, {'content-type':'text/plain; charset=utf-8'});return res.end('Non trovato');
    }
    res.writeHead(200, {'content-type':types.get(path.extname(file).toLowerCase()) || 'application/octet-stream'});
    fs.createReadStream(file).pipe(res);
  } catch (error) {
    res.writeHead(500, {'content-type':'text/plain; charset=utf-8'});res.end(String(error?.message || error));
  }
}).listen(port, '0.0.0.0', () => console.log(`QA server ready on ${port}`));
