// app/api/invoices/[id]/pdf/route.js
import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { getUserFromSession } from '@/lib/auth';
import { getInvoiceById, getUserById, canAccessDashboard } from '@/lib/db';

const FCFA = (n) => new Intl.NumberFormat('fr-SN').format(Math.round(n)) + ' FCFA';
const GREEN = rgb(0.114, 0.620, 0.459);
const DARK  = rgb(0.047, 0.106, 0.078);
const GRAY  = rgb(0.55, 0.55, 0.55);
const WHITE = rgb(1, 1, 1);
const LIGHT = rgb(0.945, 0.961, 0.937);

function drawText(page, text, x, y, { font, size = 10, color = DARK }) {
  page.drawText(String(text || ''), { x, y, font, size, color });
}
function drawLine(page, x1, y1, x2, y2, color = GRAY, thickness = 0.5) {
  page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color });
}

export async function GET(req, { params }) {
  const user = await getUserFromSession(req);
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (!canAccessDashboard(user)) {
    return NextResponse.json({ error: 'dashboard_locked', upgradeUrl: '/pricing' }, { status: 403 });
  }

  const invoice = await getInvoiceById(params.id, user.id);
  if (!invoice) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });
  const seller = await getUserById(user.id);

  const pdfDoc  = await PDFDocument.create();
  const page    = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const M = 50;
  let y = height - M;

  const fontReg  = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Header vert
  page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: GREEN });
  drawText(page, 'SenCompta IA', M, height - 35, { font: fontBold, size: 20, color: WHITE });
  drawText(page, 'Votre comptable intelligent', M, height - 52, { font: fontReg, size: 9, color: rgb(0.85, 1, 0.92) });
  const numLabel = `FACTURE N° ${invoice.numero}`;
  const numW = fontBold.widthOfTextAtSize(numLabel, 14);
  drawText(page, numLabel, width - M - numW, height - 35, { font: fontBold, size: 14, color: WHITE });
  const dateLabel = `Date : ${new Date(invoice.date_emission).toLocaleDateString('fr-SN', { day:'2-digit', month:'long', year:'numeric' })}`;
  const dateW = fontReg.widthOfTextAtSize(dateLabel, 9);
  drawText(page, dateLabel, width - M - dateW, height - 52, { font: fontReg, size: 9, color: rgb(0.85, 1, 0.92) });

  y = height - 100;
  const colLeft = M, colRight = width / 2 + 10;

  // Vendeur
  drawText(page, 'DE', colLeft, y, { font: fontBold, size: 8, color: GREEN });
  y -= 16;
  drawText(page, seller?.boutique_name || 'Ma Boutique', colLeft, y, { font: fontBold, size: 11 });
  y -= 14;
  if (seller?.ninea)     { drawText(page, `NINEA : ${seller.ninea}`, colLeft, y, { font: fontReg, size: 9, color: GRAY }); y -= 12; }
  if (seller?.adresse)   { drawText(page, seller.adresse, colLeft, y, { font: fontReg, size: 9, color: GRAY }); y -= 12; }
  if (seller?.ville)     { drawText(page, seller.ville, colLeft, y, { font: fontReg, size: 9, color: GRAY }); y -= 12; }
  if (seller?.telephone) { drawText(page, `Tél : ${seller.telephone}`, colLeft, y, { font: fontReg, size: 9, color: GRAY }); y -= 12; }
  if (seller?.phone)     { drawText(page, `WhatsApp : ${seller.phone}`, colLeft, y, { font: fontReg, size: 9, color: GRAY }); y -= 12; }

  // Client
  let yR = height - 116;
  drawText(page, 'À', colRight, yR, { font: fontBold, size: 8, color: GREEN });
  yR -= 16;
  drawText(page, invoice.client_name, colRight, yR, { font: fontBold, size: 11 });
  yR -= 14;
  if (invoice.client_ninea)   { drawText(page, `NINEA : ${invoice.client_ninea}`, colRight, yR, { font: fontReg, size: 9, color: GRAY }); yR -= 12; }
  if (invoice.client_adresse) { drawText(page, invoice.client_adresse, colRight, yR, { font: fontReg, size: 9, color: GRAY }); yR -= 12; }
  if (invoice.client_tel)     { drawText(page, `Tél : ${invoice.client_tel}`, colRight, yR, { font: fontReg, size: 9, color: GRAY }); yR -= 12; }

  y = Math.min(y, yR) - 20;
  drawLine(page, M, y, width - M, y, GREEN, 1);
  y -= 20;

  // Table
  const cDesc = M, cQty = M + 260, cPU = M + 330, cTot = M + 420;
  page.drawRectangle({ x: M - 5, y: y - 4, width: width - 2 * M + 10, height: 20, color: GREEN });
  drawText(page, 'Description', cDesc, y + 3, { font: fontBold, size: 9, color: WHITE });
  drawText(page, 'Qté',         cQty,  y + 3, { font: fontBold, size: 9, color: WHITE });
  drawText(page, 'Prix unit.',  cPU,   y + 3, { font: fontBold, size: 9, color: WHITE });
  drawText(page, 'Total',       cTot,  y + 3, { font: fontBold, size: 9, color: WHITE });
  y -= 20;

  let alt = false;
  for (const item of invoice.items || []) {
    if (alt) page.drawRectangle({ x: M - 5, y: y - 4, width: width - 2 * M + 10, height: 18, color: LIGHT });
    drawText(page, item.description, cDesc, y + 2, { font: fontReg, size: 9 });
    drawText(page, String(item.quantite), cQty, y + 2, { font: fontReg, size: 9 });
    drawText(page, FCFA(item.prix_unitaire), cPU, y + 2, { font: fontReg, size: 9 });
    const tw = fontBold.widthOfTextAtSize(FCFA(item.total), 9);
    drawText(page, FCFA(item.total), cTot + 60 - tw, y + 2, { font: fontBold, size: 9 });
    alt = !alt; y -= 18;
  }

  drawLine(page, M, y, width - M, y, GREEN, 0.5);
  y -= 20;

  // Totaux
  const tX = width - M - 170, tVX = width - M;
  const row = (label, val, bold = false) => {
    const f = bold ? fontBold : fontReg;
    drawText(page, label, tX, y, { font: f, size: 9, color: DARK });
    const vW = f.widthOfTextAtSize(val, bold ? 11 : 9);
    drawText(page, val, tVX - vW, y, { font: f, size: bold ? 11 : 9, color: bold ? GREEN : DARK });
    y -= bold ? 18 : 14;
  };
  row('Montant HT', FCFA(invoice.montant_ht));
  if (invoice.tva_applicable) row('TVA (18%)', FCFA(invoice.montant_tva));
  drawLine(page, tX - 5, y + 4, width - M, y + 4, GREEN, 0.5);
  y -= 4;
  row('TOTAL TTC', FCFA(invoice.montant_ttc), true);

  if (invoice.statut === 'PAYEE') {
    y -= 10;
    page.drawRectangle({ x: M, y: y - 4, width: 100, height: 20, color: GREEN });
    drawText(page, 'PAYÉE', M + 28, y + 3, { font: fontBold, size: 10, color: WHITE });
    y -= 24;
  }
  if (invoice.notes) {
    y -= 10;
    drawText(page, 'Notes :', M, y, { font: fontBold, size: 9, color: GRAY }); y -= 14;
    drawText(page, invoice.notes, M, y, { font: fontReg, size: 9, color: GRAY }); y -= 14;
  }

  // Footer
  const footerY = 40;
  drawLine(page, M, footerY + 22, width - M, footerY + 22, GRAY, 0.3);
  const footer = seller?.ninea
    ? `Document fiscal conforme — ${seller.boutique_name} — NINEA : ${seller.ninea} — Généré par SenCompta IA`
    : `Document généré par SenCompta IA · www.sencompta.sn · Justificatif commercial`;
  const fW = fontReg.widthOfTextAtSize(footer, 7);
  drawText(page, footer, (width - fW) / 2, footerY + 8, { font: fontReg, size: 7, color: GRAY });

  const pdfBytes = await pdfDoc.save();
  return new Response(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="facture-${invoice.numero}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
