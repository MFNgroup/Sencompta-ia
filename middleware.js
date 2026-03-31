// middleware.js — Protège les routes /dashboard et /api (sauf auth/webhook)
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sencompta-dev-secret-change-in-prod'
);

// Routes publiques — pas de vérification JWT
const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/verify',
  '/pricing',
  '/api/auth/magic-link',
  '/api/auth/verify',
  '/api/webhook',
  '/api/callback/payment',
  '/_next',
  '/favicon.ico',
  '/manifest.json',
  '/icons',
];

function isPublic(pathname) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Laisser passer les routes publiques
  if (isPublic(pathname)) return NextResponse.next();

  // Vérifier le cookie de session
  const token = req.cookies.get('sencompta_session')?.value;

  if (!token) {
    // API → 401, Pages → redirection
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // Injecter l'userId dans les headers pour les API Routes
    const res = NextResponse.next();
    res.headers.set('x-user-id',    String(payload.sub));
    res.headers.set('x-user-phone', String(payload.phone));
    res.headers.set('x-user-plan',  String(payload.plan));
    return res;
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Session expirée' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/auth/login?error=session_expired', req.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
