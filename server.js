const http = require('http');
const zlib = require('zlib');
const { Readable } = require('stream');

const PORT = 3000;

// Generate a huge, highly compressible JSON object split into multiple keys (e.g., 700MB total, 50MB per chunk)
const CHUNK_SIZE_MB = 50;
const TOTAL_SIZE_MB = 700;
const NUM_CHUNKS = Math.ceil(TOTAL_SIZE_MB / CHUNK_SIZE_MB);
const CHUNK_STRING = 'A'.repeat(CHUNK_SIZE_MB * 1024 * 1024); // 50MB string

const server = http.createServer((req, res) => {
  if (req.url === '/api/huge' && req.method === 'OPTIONS') {
    // Handle CORS preflight
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    });
    res.end();
    return;
  }
  if (req.url === '/api/huge' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // Prevent too large body
      if (body.length > 1e6) req.connection.destroy();
    });
    req.on('end', () => {
      let sizeMB = 700;
      try {
        const parsed = JSON.parse(body);
        if (parsed && typeof parsed.sizeMB === 'number' && parsed.sizeMB > 0 && parsed.sizeMB <= 1000) {
          sizeMB = parsed.sizeMB;
        }
      } catch (e) {}
      const numChunks = Math.ceil(sizeMB / CHUNK_SIZE_MB);

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
        'Access-Control-Allow-Origin': '*',
      });

      let chunkIndex = 0;
      const readable = new Readable({
        read() {
          if (chunkIndex === 0) {
            this.push('{');
          }
          if (chunkIndex < numChunks) {
            const key = `"chunk${chunkIndex}"`;
            const value = JSON.stringify(CHUNK_STRING);
            const comma = chunkIndex === 0 ? '' : ',';
            this.push(`${comma}${key}:${value}`);
            chunkIndex++;
          } else {
            this.push('}');
            this.push(null);
          }
        }
      });

      readable.pipe(zlib.createGzip()).pipe(res);
    });
  } else if (req.url === '/api/huge') {
    res.writeHead(405, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
    res.end('Method Not Allowed');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
}); 