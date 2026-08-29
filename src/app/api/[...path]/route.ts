import { NextRequest, NextResponse } from 'next/server';

function getApiBase(): string {
  const apiUrl = process.env.API_URL?.trim();
  if (apiUrl) return apiUrl.replace(/\/$/, '');

  if (process.env.NODE_ENV === 'production') {
    return 'http://127.0.0.1:4000';
  }

  return 'http://127.0.0.1:4000';
}

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
      if (key === 'transfer-encoding') return;
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
