import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Office routes - require OFFICE userType or AUTISTA_UFFICIO role
    if (path.startsWith('/planning') || path.startsWith('/trips') || 
        path.startsWith('/vehicles') || path.startsWith('/drivers') ||
        path.startsWith('/map') || path.startsWith('/reports')) {
      if (token?.userType !== 'OFFICE' && token?.role !== 'AUTISTA_UFFICIO') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    // Driver routes - require DRIVER userType or AUTISTA_UFFICIO role
    if (path.startsWith('/my-trips') || path.startsWith('/hours') || path.startsWith('/profile')) {
      if (token?.userType !== 'DRIVER' && token?.role !== 'AUTISTA_UFFICIO') {
        return NextResponse.redirect(new URL('/pin', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Public routes - always allowed
        if (path.startsWith('/login') || path.startsWith('/pin') || 
            path.startsWith('/api/auth') || path.startsWith('/api/drivers/list') ||
            path === '/') {
          return true;
        }
        
        // All other routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/planning/:path*',
    '/trips/:path*',
    '/vehicles/:path*',
    '/drivers/:path*',
    '/map/:path*',
    '/reports/:path*',
    '/my-trips/:path*',
    '/hours/:path*',
    '/profile/:path*',
  ],
};
