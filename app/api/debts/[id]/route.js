// app/api/debts/[id]/route.js
import { NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';
import { markDebtPaid } from '@/lib/db';

export async function PATCH(req, { params }) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { id } = await params;
  await markDebtPaid(Number(id), user.id);
  return NextResponse.json({ success: true });
}
