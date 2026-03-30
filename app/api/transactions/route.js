// app/api/transactions/route.js
// CRUD transactions pour le Dashboard Web

import { NextResponse } from 'next/server';
import {
  getRecentTransactions,
  getKPIs,
  getDailySeries,
  getCategoryBreakdown,
  createTransaction,
} from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

export async function GET(req) {
  const user = await getUserFromSession(req);
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') || '30');

  const [transactions, kpis, dailySeries, categoryBreakdown] = await Promise.all([
    getRecentTransactions(user.id, days),
    getKPIs(user.id, days),
    getDailySeries(user.id, days),
    getCategoryBreakdown(user.id, days),
  ]);

  return NextResponse.json({ transactions, kpis, dailySeries, categoryBreakdown });
}

export async function POST(req) {
  const user = await getUserFromSession(req);
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = await req.json();
  const { type, montant, libelle, categorie, date } = body;

  if (!type || !montant || !libelle) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
  }

  const id = await createTransaction({
    userId: user.id, type, montant: parseInt(montant),
    libelle, categorie: categorie || 'Autre',
    source: 'WEB',
    date: date || new Date().toISOString().slice(0, 10),
  });

  return NextResponse.json({ success: true, id });
}
