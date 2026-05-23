// app/api/invoices/route.js — bloqué pour plan FREE
import { NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';
import {
  getInvoices, createInvoice, getMonthlyInvoiceCount,
  canAccessDashboard,
} from '@/lib/db';

const FREE_WALL = NextResponse.json(
  { error: 'dashboard_locked', plan: 'FREE', upgradeUrl: '/pricing' },
  { status: 403 }
);

export async function GET(req) {
  const user = await getUserFromSession(req);
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (!canAccessDashboard(user)) return FREE_WALL;
  const invoices = await getInvoices(user.id);
  return NextResponse.json({ invoices });
}

export async function POST(req) {
  const user = await getUserFromSession(req);
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (!canAccessDashboard(user)) return FREE_WALL;

  const body = await req.json();
  const { clientName, clientTel, clientNinea, clientAdresse, dateEmission, dateEcheance, tvaApplicable, items, notes } = body;

  if (!clientName || !items?.length || !dateEmission) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
  }
  for (const item of items) {
    if (!item.description || !item.prixUnitaire || !item.quantite) {
      return NextResponse.json({ error: 'Chaque ligne doit avoir description, quantité et prix' }, { status: 400 });
    }
  }

  const id = await createInvoice({
    userId: user.id, clientName, clientTel, clientNinea, clientAdresse,
    dateEmission, dateEcheance, tvaApplicable: !!tvaApplicable, items, notes,
  });

  return NextResponse.json({ success: true, id });
}
