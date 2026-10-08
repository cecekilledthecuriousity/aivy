import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (path.startsWith('/admin')) {
      if (token.role !== 'HR_ADMIN') {
        return NextResponse.redirect(new URL('/portal', req.url));
      }
    }

    if (path.startsWith('/manager')) {
      if (token.role !== 'MANAGER' && token.role !== 'HR_ADMIN') {
        return NextResponse.redirect(new URL('/portal', req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/manager/:path*', '/portal/:path*'],
};
