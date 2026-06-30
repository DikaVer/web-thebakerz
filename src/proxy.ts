import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// SITE CLOSED — temporary "kill switch".
//
// While this block is active, every route is redirected to the /closing page
// and every /api/* request returns 503. The rest of the application code is
// left untouched. To bring the full site back online, delete the marked block
// below (everything between "SITE CLOSED — start" and "SITE CLOSED — end") and
// restore the original matcher (exclude `api`).
// ---------------------------------------------------------------------------

const CLOSING_PATH = '/closing';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ===== SITE CLOSED — start ===============================================
  // Block all API routes with a clear "unavailable" response.
  if (pathname.startsWith('/api')) {
    return NextResponse.json(
      { error: 'Service unavailable. TheBakerz has closed.' },
      { status: 503, headers: { 'Retry-After': '86400' } },
    );
  }

  const isStaticAsset =
    pathname.startsWith('/_next') ||
    !!pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|webp|webmanifest|txt|xml)$/);

  // Redirect everything else (real pages) to the closing page.
  if (!isStaticAsset && pathname !== CLOSING_PATH) {
    const url = req.nextUrl.clone();
    url.pathname = CLOSING_PATH;
    url.search = '';
    return NextResponse.redirect(url);
  }
  // ===== SITE CLOSED — end =================================================

  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy that allows Stripe to work properly
  // response.headers.set(
  //   'Content-Security-Policy',
  //   [
  //     "default-src 'self'",
  //     "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://m.stripe.network https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms https://maps.googleapis.com https://www.youtube.com",
  //     "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  //     "font-src 'self' https://fonts.gstatic.com",
  //     "img-src 'self' data: https: blob:",
  //     "connect-src 'self' data: https://api.stripe.com https://maps.googleapis.com https://www.gstatic.com https://www.google-analytics.com https://region1.google-analytics.com https://m.stripe.network https://pay.google.com https://api.iconify.design https://api.unisvg.com https://api.simplesvg.com",
  //     "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com",
  //     "worker-src 'self' blob: data: https://www.gstatic.com",
  //     "child-src 'self' blob:",
  //     "object-src 'none'",
  //     "base-uri 'self'",
  //     "form-action 'self'"
  //   ].join('; ')
  // );

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images / landing (public assets used by the closing page)
         *
         * NOTE: `api` is intentionally NOT excluded while the site is closed —
         * the proxy returns 503 for it above. Re-add `api|` here when reopening.
         */
        '/((?!_next/static|_next/image|favicon.ico|images/|landing/).*)',
    ],
}
