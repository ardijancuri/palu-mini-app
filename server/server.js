// Minimal static file server with PostgreSQL database integration.
// Serves files from ./public on http://localhost:3000

import http from 'http';
import https from 'https';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ES module setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the project root
const envPath = path.join(__dirname, '..', '.env');
console.log('Loading .env from:', envPath);
console.log('File exists:', fs.existsSync(envPath));

const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('Error loading .env:', result.error);
} else {
  console.log('Environment variables loaded successfully');
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon'
};

function send(res, code, body, headers = {}) {
  res.writeHead(code, headers);
  res.end(body);
}

function sendJson(res, code, data, headers = {}) {
  const jsonHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
    ...headers
  };
  send(res, code, JSON.stringify(data), jsonHeaders);
}

function getClientIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '127.0.0.1';
}

function serveFile(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let filePath = decodeURIComponent(url.pathname);
  
  // Handle specific routes
  if (filePath === '/') {
    filePath = '/index.html';
  } else if (filePath === '/community') {
    filePath = '/community.html';
  } else if (filePath === '/community-list.txt') {
    filePath = '/community-list.txt';
  }

  const abs = path.join(PUBLIC_DIR, filePath);
  if (!abs.startsWith(PUBLIC_DIR)) {
    return send(res, 403, 'Forbidden');
  }

  console.log(`Serving file: ${filePath} -> ${abs}`); // Debug log

  fs.stat(abs, (err, stat) => {
    if (err || !stat.isFile()) {
      console.log(`File not found: ${abs}, error: ${err?.message}`); // Debug log
      return send(res, 404, 'Not Found');
    }
    const ext = path.extname(abs).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
    fs.createReadStream(abs).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  console.log(`Request: ${req.method} ${url.pathname}`); // Debug log
  
  // Dynamically import models to ensure environment variables are loaded
  const { default: Token } = await import('./models/Token.js');
  const { default: Like } = await import('./models/Like.js');
  
  // Handle Database API routes
  if (url.pathname === '/api/tokens') {
    try {
      if (req.method === 'GET') {
        const tokens = await Token.getAll();
        sendJson(res, 200, { success: true, data: tokens });
      } else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
          try {
            const { address } = JSON.parse(body);
            if (!address) {
              return sendJson(res, 400, { success: false, error: 'Address is required' });
            }
            const token = await Token.create(address);
            sendJson(res, 201, { success: true, data: token });
          } catch (err) {
            sendJson(res, 400, { success: false, error: err.message });
          }
        });
      } else {
        sendJson(res, 405, { success: false, error: 'Method Not Allowed' });
      }
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
    }
    return;
  }

  if (url.pathname.startsWith('/api/tokens/') && url.pathname.endsWith('/like')) {
    try {
      const address = url.pathname.split('/api/tokens/')[1].replace('/like', '');
      const userIp = getClientIP(req);
      
      if (req.method === 'POST') {
        const like = await Like.addLike(address, userIp);
        const likeCount = await Like.getLikeCount(address);
        sendJson(res, 200, { success: true, data: { liked: true, likeCount } });
      } else {
        sendJson(res, 405, { success: false, error: 'Method Not Allowed' });
      }
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
    }
    return;
  }

  if (url.pathname.startsWith('/api/tokens/') && url.pathname.endsWith('/likes')) {
    try {
      const address = url.pathname.split('/api/tokens/')[1].replace('/likes', '');
      const userIp = getClientIP(req);
      
      if (req.method === 'GET') {
        const likeCount = await Like.getLikeCount(address);
        const hasLiked = await Like.hasUserLiked(address, userIp);
        sendJson(res, 200, { success: true, data: { likeCount, hasLiked } });
      } else {
        sendJson(res, 405, { success: false, error: 'Method Not Allowed' });
      }
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
    }
    return;
  }

  // Handle External API routes (original functionality)
  if (url.pathname.startsWith('/api/token/')) {
    if (req.method !== 'GET') return send(res, 405, 'Method Not Allowed');
    const address = url.pathname.split('/api/token/')[1];
    if (!address) return send(res, 400, 'Missing address');
    const target = `https://four.meme/meme-api/v1/private/token/get/v2?address=${encodeURIComponent(address)}`;

    https.get(target, (upstream) => {
      const status = upstream.statusCode || 502;
      const chunks = [];
      upstream.on('data', (d) => chunks.push(d));
      upstream.on('end', () => {
        const body = Buffer.concat(chunks);
        res.writeHead(status, {
          'Content-Type': upstream.headers['content-type'] || 'application/json; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(body);
      });
    }).on('error', (err) => {
      send(res, 502, JSON.stringify({ error: 'Upstream error', detail: err.message }));
    });
    return;
  }
  
  // Legacy support for query parameter format
  if (url.pathname === '/api/token') {
    if (req.method !== 'GET') return send(res, 405, 'Method Not Allowed');
    const address = url.searchParams.get('address');
    if (!address) return send(res, 400, 'Missing address');
    const target = `https://four.meme/meme-api/v1/private/token/get/v2?address=${encodeURIComponent(address)}`;

    https.get(target, (upstream) => {
      const status = upstream.statusCode || 502;
      const chunks = [];
      upstream.on('data', (d) => chunks.push(d));
      upstream.on('end', () => {
        const body = Buffer.concat(chunks);
        res.writeHead(status, {
          'Content-Type': upstream.headers['content-type'] || 'application/json; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(body);
      });
    }).on('error', (err) => {
      send(res, 502, JSON.stringify({ error: 'Upstream error', detail: err.message }));
    });
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method Not Allowed');
  }
  serveFile(req, res);
});

server.listen(PORT, () => {
  console.log(`Mini App server running at http://localhost:${PORT}`);
});
