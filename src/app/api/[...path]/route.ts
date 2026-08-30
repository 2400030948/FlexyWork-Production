import { NextRequest, NextResponse } from 'next/server';

/**
 * Resolve the upstream API base.
 *
 * Order of precedence:
 *   1. API_URL — server-only env var (preferred for the Vercel + Render split
 *      so the public NEXT_PUBLIC_API_URL is never accidentally used for an
 *      internal call). Set this in Vercel to the public Render URL, e.g.
 *      "https://flexywork-api.onrender.com".
 *   2. NEXT_PUBLIC_API_URL — the canonical public backend base URL.
 *      Kept as a fallback so deployments that only configure the public
 *      variable still work.
 *
 * IMPORTANT: We intentionally do NOT fall back to a localhost URL in
 * production. If the proxy is ever invoked without API_URL or
 * NEXT_PUBLIC_API_URL set in a deployed environment, that is a
 * configuration error and we return a clear 500 so it is obvious from
 * logs rather than silently proxying to a non-existent origin and
 * producing an empty body for the client.
 */
function resolveApiBase(): string | null {
  const apiUrl =
    process.env.API_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!apiUrl) return null;
  return apiUrl.replace(/\/$/, '');
}

// Request headers that describe the hop between the browser and THIS
// proxy (Vercel). They must not be forwarded to the upstream origin —
// in particular content-length/transfer-encoding must be recomputed by
// fetch when we hand it a fresh body.
const STRIPPED_REQUEST_HEADERS = new Set([
  'host',
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'content-length',
  'content-encoding'
]);

// Response headers we explicitly want to keep (everything else is
// dropped). Keeping a tight allow-list avoids accidentally forwarding
// hop-by-hop, framing, or origin-specific headers from Render.
//
// In particular we deliberately do NOT forward:
//   - Set-Cookie (Render is on a different host than this Vercel proxy;
//     forwarding a cookie set for a different origin can cause browsers
//     to reject or discard the response).
//   - Content-Length / Content-Encoding / Transfer-Encoding — letting
//     the runtime recompute framing based on the actual byte length of
//     the decoded body we hand it is the core fix that prevents the
//     "HTTP 200 + empty body" regression in production.
const FORWARDED_RESPONSE_HEADERS = new Set(['content-type', 'cache-control']);

function logUpstream(
  target: string,
  status: number,
  contentType: string | null,
  byteLength: number
) {
  // Temporary diagnostic logging. DO NOT log request bodies, passwords,
  // JWTs, cookies, or authorization headers.
  console.log(
    `[proxy] target=${target} upstream_status=${status} content_type=${contentType ?? '<none>'} body_bytes=${byteLength}`
  );
}

async function proxyRequest(request: NextRequest, path: string[]) {
  const base = resolveApiBase();
  if (!base) {
    console.error(
      '[proxy] Missing API_URL / NEXT_PUBLIC_API_URL environment variable. Refusing to proxy.'
    );
    return NextResponse.json(
      {
        message:
          'Server is misconfigured: API_URL is not set. Configure API_URL (or NEXT_PUBLIC_API_URL) in the Vercel project environment variables.'
      },
      { status: 500 }
    );
  }

  const targetUrl = new URL(`/api/${path.join('/')}`, base);
  targetUrl.search = request.nextUrl.search;

  // Build a clean request Headers object. Strip hop-by-hop and
  // framing headers so fetch recomputes Content-Length and
  // Transfer-Encoding correctly when we hand it a fresh body.
  const forwardHeaders = new Headers();
  request.headers.forEach((value, key) => {
    if (STRIPPED_REQUEST_HEADERS.has(key.toLowerCase())) return;
    forwardHeaders.set(key, value);
  });
  // Always advertise that we are proxying plain JSON unless the caller
  // explicitly set a different Content-Type. This keeps the upstream
  // happy when the incoming request was somehow missing one.
  if (
    !forwardHeaders.has('content-type') &&
    request.method !== 'GET' &&
    request.method !== 'HEAD'
  ) {
    forwardHeaders.set('content-type', 'application/json');
  }

  const init: RequestInit = {
    method: request.method,
    headers: forwardHeaders,
    // We never want the proxy to follow redirects — we must surface
    // the exact upstream response to the client.
    redirect: 'manual'
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    // Read the body as raw bytes so we forward exactly what the client
    // sent (no character re-encoding surprises) and so fetch can
    // recompute Content-Length for us.
    init.body = await request.arrayBuffer();
  }

  let response: Response;
  try {
    response = await fetch(targetUrl, init);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'API request failed';
    console.error(`[proxy] fetch failed for target=${targetUrl.toString()}: ${message}`);
    return NextResponse.json(
      {
        message: 'Upstream API is unreachable.'
      },
      { status: 502 }
    );
  }

  // Read the upstream body exactly once as raw bytes.
  const bodyBuffer = await response.arrayBuffer();
  const upstreamContentType = response.headers.get('content-type');

  logUpstream(targetUrl.toString(), response.status, upstreamContentType, bodyBuffer.byteLength);

  // Build a tight allow-list of response headers. We deliberately do
  // NOT forward Content-Length, Content-Encoding, Transfer-Encoding,
  // or Set-Cookie — letting the runtime recompute framing avoids the
  // empty-body regression.
  const outHeaders = new Headers();
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = response.headers.get(name);
    if (value != null) outHeaders.set(name, value);
  }

  return new NextResponse(bodyBuffer, {
    status: response.status,
    headers: outHeaders
  });
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
