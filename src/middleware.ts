import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Allow static image files in public/drivers/
    if (/\.(png|jpg|jpeg|webp|svg|ico)$/i.test(path)) {
      return NextResponse.next();
    }

    // Office routes - require OFFICE userType or AUTISTA_UFFICIO role
    if (path.startsWith('/dashboard') || path.startsWith('/planning') || path.startsWith('/trips') || 
        path.startsWith('/vehicles') || path.startsWith('/drivers') ||
        path.startsWith('/map') || path.startsWith('/reports') || path.startsWith('/office-hours')) {
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
        
        // Public routes and static driver avatar images - always allowed
        if (path.startsWith('/login') || path.startsWith('/pin') || 
            path.startsWith('/api/auth') || path.startsWith('/api/drivers/list') ||
            /\.(png|jpg|jpeg|webp|svg|ico)$/i.test(path) ||
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
    '/dashboard/:path*',
    '/planning/:path*',
    '/trips/:path*',
    '/vehicles/:path*',
    '/drivers/:path*',
    '/map/:path*',
    '/reports/:path*',
    '/office-hours/:path*',
    '/my-trips/:path*',
    '/hours/:path*',
    '/profile/:path*',
  ],
};
