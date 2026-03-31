// app/api/user/me/route.js
import { NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  // Ne pas exposer le magic token
  const { magic_token, magic_token_expiry, ...safeUser } = user;
  return NextResponse.json(safeUser);
}

export async function PATCH(req) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { boutique_name } = await req.json();
  if (boutique_name) {
    await query('UPDATE users SET boutique_name = ? WHERE id = ?', [boutique_name.slice(0, 120), user.id]);
  }
  return NextResponse.json({ success: true });
}
