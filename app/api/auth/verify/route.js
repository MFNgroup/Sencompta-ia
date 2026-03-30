// app/api/auth/verify/route.js
// Vérifie le token et crée la session

import { NextResponse } from 'next/server';
import { consumeMagicToken } from '@/lib/db';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sencompta-dev-secret-change-in-prod');

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login?error=missing_token', req.url));
  }

  const user = await consumeMagicToken(token);

  if (!user) {
    return NextResponse.redirect(new URL('/auth/login?error=invalid_token', req.url));
  }

  // Créer un JWT de session (7 jours)
  const jwt = await new SignJWT({
    sub:   String(user.id),
    phone: user.phone,
    plan:  user.plan,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(JWT_SECRET);

  // Stocker dans un cookie HttpOnly
  const cookieStore = await cookies();
  cookieStore.set('sencompta_session', jwt, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   7 * 24 * 60 * 60,
    path:     '/',
  });

  return NextResponse.redirect(new URL('/dashboard', req.url));
}
