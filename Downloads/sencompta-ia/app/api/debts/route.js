// app/api/debts/route.js
import { NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';
import { getDebts, createDebt } from '@/lib/db';

export async function GET() {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const debts = await getDebts(user.id);
  return NextResponse.json({ debts });
}

export async function POST(req) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { clientName, amount, description, dueDate } = await req.json();
  if (!clientName || !amount) return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
  const id = await createDebt({ userId: user.id, clientName, amount, description, dueDate: dueDate || null });
  return NextResponse.json({ success: true, id });
}
