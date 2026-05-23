// app/api/invoices/[id]/route.js
import { NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';
import { getInvoiceById, updateInvoiceStatus, deleteInvoice, canAccessDashboard } from '@/lib/db';

const FREE_WALL = NextResponse.json(
  { error: 'dashboard_locked', plan: 'FREE', upgradeUrl: '/pricing' },
  { status: 403 }
);

export async function GET(req, { params }) {
  const user = await getUserFromSession(req);
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (!canAccessDashboard(user)) return FREE_WALL;
  const invoice = await getInvoiceById(params.id, user.id);
  if (!invoice) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });
  return NextResponse.json({ invoice, plan: user.plan });
}

export async function PATCH(req, { params }) {
  const user = await getUserFromSession(req);
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (!canAccessDashboard(user)) return FREE_WALL;
  const { statut } = await req.json();
  const allowed = ['BROUILLON', 'ENVOYEE', 'PAYEE', 'ANNULEE'];
  if (!allowed.includes(statut)) return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
  await updateInvoiceStatus(params.id, user.id, statut);
  return NextResponse.json({ success: true });
}

export async function DELETE(req, { params }) {
  const user = await getUserFromSession(req);
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (!canAccessDashboard(user)) return FREE_WALL;
  await deleteInvoice(params.id, user.id);
  return NextResponse.json({ success: true });
}
