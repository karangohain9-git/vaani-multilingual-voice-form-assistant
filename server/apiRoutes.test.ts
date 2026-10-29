import { describe, it, expect } from 'vitest';
import extractHandler from '../api/extract.ts';
import submitHandler from '../api/submit.ts';

function createMockReqRes(options: {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}) {
  const req = {
    method: options.method || 'POST',
    body: options.body || {},
    headers: options.headers || {},
    on: (_event: string, _callback: Function) => {},
  };

  let statusCode = 200;
  let headersSent: Record<string, string> = {};
  let responseData = '';

  const res = {
    get statusCode() {
      return statusCode;
    },
    set statusCode(code: number) {
      statusCode = code;
    },
    setHeader(key: string, value: string) {
      headersSent[key.toLowerCase()] = value;
    },
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: any) {
      responseData = JSON.stringify(data);
      return res;
    },
    end(data?: string) {
      if (data) responseData = data;
      return res;
    },
    _getData() {
      return responseData ? JSON.parse(responseData) : null;
    },
    _getStatusCode() {
      return statusCode;
    },
  };

  return { req, res };
}

describe('Vercel Serverless Function Endpoints', () => {
  describe('api/extract.ts', () => {
    it('rejects non-POST requests with 405 Method Not Allowed', async () => {
      const { req, res } = createMockReqRes({ method: 'GET' });
      await extractHandler(req, res);
      expect(res._getStatusCode()).toBe(405);
      expect(res._getData().error).toBe('Method Not Allowed');
    });

    it('handles POST extraction request and returns heuristic fallback when no API key configured', async () => {
      const { req, res } = createMockReqRes({
        method: 'POST',
        body: {
          transcript: 'My name is Amit Roy. My phone number is 9876543210. I am 30 years old.',
          formType: 'general',
          language: 'en-IN',
          fields: [
            { id: 'full_name', label: 'Full Name', type: 'text', required: true },
            { id: 'phone', label: 'Phone', type: 'tel', required: true },
            { id: 'age', label: 'Age', type: 'number', required: true },
          ],
        },
      });

      await extractHandler(req, res);
      expect(res._getStatusCode()).toBe(200);
      const data = res._getData();
      expect(data.success).toBe(true);
      expect(data.extracted.full_name).toBe('Amit Roy');
      expect(data.extracted.phone).toBe('9876543210');
      expect(data.extracted.age).toBe(30);
    });
  });

  describe('api/submit.ts', () => {
    it('rejects non-POST requests with 405 Method Not Allowed', async () => {
      const { req, res } = createMockReqRes({ method: 'GET' });
      await submitHandler(req, res);
      expect(res._getStatusCode()).toBe(405);
      expect(res._getData().error).toBe('Method Not Allowed');
    });

    it('handles POST submit request and produces a valid reference receipt', async () => {
      const { req, res } = createMockReqRes({
        method: 'POST',
        body: {
          form_type: 'general',
          full_name: 'Rahul Sharma',
          age: 25,
          phone: '9876543210',
          city: 'Guwahati',
          state: 'Assam',
          fields_payload: { full_name: 'Rahul Sharma' },
        },
      });

      await submitHandler(req, res);
      expect(res._getStatusCode()).toBe(200);
      const data = res._getData();
      expect(data.success).toBe(true);
      expect(data.reference_id).toMatch(/^VN-2026-/);
    });
  });
});
