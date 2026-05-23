// app/api/debts/route.js — bloqué pour plan FREE
import { NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';
import { getDebts, createDebt, canAccessDashboard } from '@/lib/db';

const FREE_WALL = NextResponse.json(
  { error: 'dashboard_locked', plan: 'FREE', upgradeUrl: '/pricing' },
  { status: 403 }
);

export async function GET(req) {
  const user = await getUserFromSession(req);
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (!canAccessDashboard(user)) return FREE_WALL;
  const debts = await getDebts(user.id);
  return NextResponse.json({ debts });
}

export async function POST(req) {
  const user = await getUserFromSession(req);
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (!canAccessDashboard(user)) return FREE_WALL;
  const { clientName, amount, description, dueDate } = await req.json();
  if (!clientName || !amount) return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
  const id = await createDebt({ userId: user.id, clientName, amount, description, dueDate: dueDate || null });
  return NextResponse.json({ success: true, id });
}
