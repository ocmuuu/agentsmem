import { NextRequest, NextResponse } from 'next/server';

const BACKEND =
  process.env.AGENTSMEM_API_URL ??
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3011' : 'http://127.0.0.1:3011');

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await params);
}
export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await params);
}
export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await params);
}
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await params);
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await params);
}

async function proxy(request: NextRequest, { path }: { path: string[] }) {
  const pathStr = path.join('/');
  const url = new URL(request.url);
  const backendUrl = `${BACKEND}/api/v1/${pathStr}${url.search}`;
  const headers = new Headers(request.headers);
  headers.delete('host');
  const res = await fetch(backendUrl, {
    method: request.method,
    headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
  });
  const data = await res.arrayBuffer();
  return new NextResponse(data, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
}
