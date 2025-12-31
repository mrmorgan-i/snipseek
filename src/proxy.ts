import { NextRequest, NextResponse } from 'next/server';
import { auth, type User } from '@/lib/auth';
import { paths } from '@/lib/paths';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // skip static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    (pathname.includes('.') && !pathname.endsWith('.html'))
  ) {
    return NextResponse.next();
  }

  const isDashboardPage = pathname.startsWith('/dashboard');
  const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';

  // public pages that don't need session check
  if (!isDashboardPage && !isAuthPage) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session) {
    const user = session.user as User;

    // inject session data into request headers to avoid duplicate queries
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-email', user.email);
    requestHeaders.set('x-user-name', user.name || '');
    requestHeaders.set('x-user-image', user.image || '');

    // authenticated users get sent to dashboard
    if (isAuthPage) {
      return NextResponse.redirect(new URL(paths.appPaths.dashboard, request.url));
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // unauthenticated users trying to access dashboard get sent to sign in page
  if (isDashboardPage) {
    return NextResponse.redirect(new URL(paths.publicPaths.signIn, request.url));
  }

  return NextResponse.next();
}
