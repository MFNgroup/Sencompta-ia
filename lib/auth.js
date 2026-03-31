// lib/auth.js
// Utilitaires d'authentification (JWT + Session)

import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getUserById } from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sencompta-dev-secret-change-in-prod'
);

/** Retourne l'utilisateur complet depuis le cookie de session */
export async function getUserFromSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sencompta_session')?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = await getUserById(Number(payload.sub));
    return user || null;
  } catch {
    return null;
  }
}

/** Middleware helper — redirige si non authentifié */
export async function requireAuth() {
  const user = await getUserFromSession();
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}
