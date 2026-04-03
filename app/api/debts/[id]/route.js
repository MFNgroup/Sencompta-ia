// app/api/debts/[id]/route.js
import { NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';
import { markDebtPaid } from '@/lib/db';

export async function PATCH(req, { params }) {
  const user = await getUserFromSession(req);
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const debtId = parseInt(params.id);
  if (!debtId) return NextResponse.json({ error: 'ID invalide' }, { status: 400 });

  await markDebtPaid(debtId, user.id);
  return NextResponse.json({ success: true });
}
