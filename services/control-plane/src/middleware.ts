import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Protect /admin routes and /api/admin routes
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/admin')) {
    const basicAuth = req.headers.get('authorization');

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      const validUser = process.env.ADMIN_USERNAME || 'admin';
      const validPwd = process.env.ADMIN_PASSWORD || 'AhnajakSuperSecret2026!';

      if (user === validUser && pwd === validPwd) {
        return NextResponse.next();
      }
    }

    url.pathname = '/api/unauthorized';
    return new NextResponse('Auth required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Admin Area"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
