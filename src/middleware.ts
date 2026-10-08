import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Bypass login checks - allow direct access to all pages without authentication
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/manager/:path*', '/portal/:path*'],
};
