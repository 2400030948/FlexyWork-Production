import { NextRequest, NextResponse } from 'next/server';

function getApiBase(): string {
  // Order of precedence:
  //   1. API_URL — server-only env var (preferred for the Vercel + Render split
  //      so the public NEXT_PUBLIC_API_URL is never accidentally used for an
  //      internal call). Set this in Vercel to the public Render URL, e.g.
  //      "https://flexywork-api.onrender.com".
  //   2. NEXT_PUBLIC_API_URL — the canonical public backend base URL.
  //      Kept as a fallback so deployments that only configure the public
  //      variable still work.
  //   3. Local development fallback (Express on the same host).
  const apiUrl = process.env.API_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim();
  if (apiUrl) return apiUrl.replace(/\/$/, '');

  return 'http://127.0.0.1:4000';
}

// Hop-by-hop response headers (RFC 7230 §6.1). These describe the
// connection between the proxy and the origin, not the end-to-end
// response. They MUST NOT be forwarded to the client. We also drop
// Set-Cookie because the origin (Render) is on a different host than
// this proxy (Vercel); forwarding a cookie meant for a different
// origin can cause browsers to discard the response body.
const HOP_BY_HOP_RESPONSE_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'set-cookie'
]);

async function proxyRequest(request: NextRequest, path: string[]) {
  const targetPath = `/api/${path.join('/')}`;
  const targetUrl = new URL(targetPath, getApiBase());
  targetUrl.search = request.nextUrl.search;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (key === 'host' || key === 'connection') return;
    headers.set(key, value);
  });

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual'
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text();
  }

  try {
    const response = await fetch(targetUrl, init);
    const body = await response.arrayBuffer();
    const responseHeaders = new Headers();

    response.headers.forEach((value, key) => {
      if (HOP_BY_HOP_RESPONSE_HEADERS.has(key.toLowerCase())) return;
      responseHeaders.set(key, value);
    });

    return new NextResponse(body, {
      status: response.status,
      headers: responseHeaders
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'API request failed';
    const isConnectionError =
      message.includes('ECONNREFUSED') ||
      message.includes('fetch failed') ||
      message.includes('ENOTFOUND');

    return NextResponse.json(
      {
        message: isConnectionError
          ? 'API server is not running. Start it with: npm run server'
          : 'API request failed'
      },
      { status: isConnectionError ? 503 : 500 }
    );
  }
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}
