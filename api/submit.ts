import { handleSubmit } from '../server/apiHandler.ts';

async function parseBody(req: any): Promise<any> {
  if (req.body !== undefined && req.body !== null && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  if (Buffer.isBuffer(req.body)) {
    try {
      return JSON.parse(req.body.toString('utf-8'));
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: any) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf-8');
        resolve(JSON.parse(raw || '{}'));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    const errorPayload = JSON.stringify({ error: 'Method Not Allowed' });
    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(errorPayload);
  }

  try {
    const body = await parseBody(req);
    const result = await handleSubmit(body || {});

    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(200).json(result);
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify(result));
  } catch (err: any) {
    const errorMsg = err?.message || 'Server error';
    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(500).json({ error: errorMsg });
    }
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ error: errorMsg }));
  }
}
