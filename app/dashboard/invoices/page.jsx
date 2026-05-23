'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const FCFA = (n) => new Intl.NumberFormat('fr-SN').format(Math.abs(Math.round(n))) + ' FCFA';

const STATUT_COLOR = {
  BROUILLON: { bg: '#1A2E20', color: '#8A9E8F', label: 'Brouillon' },
  ENVOYEE:   { bg: '#1A2433', color: '#6CA0DC', label: 'Envoyée' },
  PAYEE:     { bg: '#122019', color: '#4CAF7D', label: 'Payée' },
  ANNULEE:   { bg: '#2A1A1A', color: '#E07B54', label: 'Annulée' },
};

const SVGPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const SVGFile = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const SVGDownload = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const SVGTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;
const SVGClose = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

function emptyItem() { return { description: '', quantite: 1, prixUnitaire: '' }; }

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [user, setUser]         = useState(null);
  const [error, setError]       = useState('');

  const [form, setForm] = useState({
    clientName: '', clientTel: '', clientNinea: '', clientAdresse: '',
    dateEmission: new Date().toISOString().slice(0, 10),
    dateEcheance: '', tvaApplicable: false, notes: '',
    items: [emptyItem()],
  });

  useEffect(() => {
    fetch('/api/user/me').then(r => r.json()).then(d => { if (!d.error) setUser(d); });
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      if (!data.error) setInvoices(data.invoices || []);
    } finally { setLoading(false); }
  };

  const totalHT = form.items.reduce((s, i) => s + (Number(i.quantite) || 0) * (Number(i.prixUnitaire) || 0), 0);
  const totalTVA = form.tvaApplicable ? Math.round(totalHT * 0.18) : 0;
  const totalTTC = totalHT + totalTVA;

  const updateItem = (idx, field, val) => {
    setForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: val };
      return { ...f, items };
    });
  };

  const addItem    = () => setForm(f => ({ ...f, items: [...f.items, emptyItem()] }));
  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const submit = async () => {
    if (!form.clientName.trim()) { setError('Nom du client requis'); return; }
    if (!form.items[0].description || !form.items[0].prixUnitaire) { setError('Au moins une ligne avec description et prix'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: form.items.map(i => ({
            description: i.description,
            quantite: Number(i.quantite) || 1,
            prixUnitaire: Number(i.prixUnitaire) || 0,
          })),
        }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setShowForm(false);
      setForm({ clientName:'', clientTel:'', clientNinea:'', clientAdresse:'', dateEmission: new Date().toISOString().slice(0,10), dateEcheance:'', tvaApplicable:false, notes:'', items:[emptyItem()] });
      await loadInvoices();
    } finally { setSaving(false); }
  };

  const changeStatut = async (id, statut) => {
    await fetch(`/api/invoices/${id}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ statut }) });
    loadInvoices();
  };

  const deleteInvoice = async (id) => {
    if (!confirm('Supprimer ce brouillon ?')) return;
    await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
    loadInvoices();
  };

  const isFree = user?.plan === 'FREE';

  return (
    <>
      <style>{`
        .inv-page { padding: 28px 32px; max-width: 900px; }
        .inv-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; flex-wrap:wrap; gap:12px; }
        .inv-title { font-size:1.25rem; font-weight:600; color:#EDE8DC; }
        .inv-subtitle { font-size:0.78rem; color:#8A9E8F; margin-top:3px; }
        .btn-new { display:flex; align-items:center; gap:8px; padding:10px 18px; background:#1D9E75; color:#fff; border:none; border-radius:9px; font-size:0.86rem; font-weight:600; cursor:pointer; transition:background 0.15s; }
        .btn-new:hover { background:#18876A; }
        .free-banner { background:rgba(201,168,76,0.08); border:1px solid rgba(201,168,76,0.25); border-radius:10px; padding:12px 16px; margin-bottom:20px; font-size:0.82rem; color:#C9A84C; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; }
        .free-banner a { color:#C9A84C; text-decoration:underline; }
        .inv-table { width:100%; border-collapse:collapse; }
        .inv-table th { font-size:0.72rem; text-transform:uppercase; letter-spacing:0.06em; color:#8A9E8F; padding:8px 12px; text-align:left; border-bottom:1px solid #1E3328; }
        .inv-table td { padding:12px 12px; border-bottom:1px solid #1A2820; font-size:0.85rem; color:#EDE8DC; vertical-align:middle; }
        .inv-table tr:hover td { background:rgba(29,158,117,0.04); }
        .statut-badge { display:inline-block; padding:3px 9px; border-radius:6px; font-size:0.72rem; font-weight:600; text-transform:uppercase; }
        .actions { display:flex; gap:6px; align-items:center; }
        .btn-sm { display:flex; align-items:center; gap:5px; padding:6px 10px; border-radius:7px; border:1px solid #1E3328; background:transparent; color:#8A9E8F; font-size:0.78rem; cursor:pointer; transition:all 0.15s; }
        .btn-sm:hover { border-color:#4CAF7D; color:#4CAF7D; }
        .btn-sm.danger:hover { border-color:#E07B54; color:#E07B54; }
        .select-sm { background:#0D1B14; border:1px solid #1E3328; color:#8A9E8F; border-radius:6px; padding:4px 8px; font-size:0.78rem; cursor:pointer; }
        .empty-state { text-align:center; padding:60px 20px; color:#8A9E8F; }
        /* MODAL */
        .modal-bg { position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:100; display:flex; align-items:flex-start; justify-content:center; padding:20px; overflow-y:auto; }
        .modal { background:#122019; border:1px solid #1E3328; border-radius:14px; width:100%; max-width:620px; margin:auto; padding:28px; }
        .modal-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; }
        .modal-title { font-size:1.1rem; font-weight:600; color:#EDE8DC; }
        .btn-close { background:none; border:none; color:#8A9E8F; cursor:pointer; padding:4px; }
        .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .form-full { grid-column:1/-1; }
        label { display:block; font-size:0.75rem; color:#8A9E8F; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.05em; }
        input, textarea, select { width:100%; background:#0D1B14; border:1px solid #1E3328; border-radius:8px; color:#EDE8DC; padding:9px 12px; font-size:0.88rem; font-family:inherit; outline:none; transition:border 0.15s; }
        input:focus, textarea:focus { border-color:#1D9E75; }
        .section-head { font-size:0.8rem; font-weight:600; color:#1D9E75; margin:20px 0 10px; text-transform:uppercase; letter-spacing:0.06em; }
        .item-row { display:grid; grid-template-columns:1fr 70px 130px 32px; gap:8px; align-items:start; margin-bottom:8px; }
        .btn-add-item { background:none; border:1px dashed #1E3328; color:#8A9E8F; border-radius:8px; padding:8px; width:100%; cursor:pointer; font-size:0.82rem; transition:all 0.15s; }
        .btn-add-item:hover { border-color:#1D9E75; color:#1D9E75; }
        .btn-del-item { background:none; border:none; color:#E07B54; cursor:pointer; padding:9px 4px; opacity:0.6; }
        .btn-del-item:hover { opacity:1; }
        .total-preview { background:#0D1B14; border-radius:10px; padding:14px 16px; margin:16px 0; }
        .total-row { display:flex; justify-content:space-between; font-size:0.85rem; padding:3px 0; color:#8A9E8F; }
        .total-row.main { color:#EDE8DC; font-weight:600; font-size:1rem; border-top:1px solid #1E3328; margin-top:6px; padding-top:8px; }
        .tva-toggle { display:flex; align-items:center; gap:10px; font-size:0.85rem; color:#8A9E8F; cursor:pointer; }
        .toggle-switch { width:36px; height:20px; background:#1E3328; border-radius:10px; position:relative; transition:background 0.2s; flex-shrink:0; }
        .toggle-switch.on { background:#1D9E75; }
        .toggle-knob { position:absolute; top:3px; left:3px; width:14px; height:14px; background:#fff; border-radius:50%; transition:left 0.2s; }
        .toggle-switch.on .toggle-knob { left:19px; }
        .error-msg { background:rgba(224,123,84,0.1); border:1px solid rgba(224,123,84,0.3); color:#E07B54; padding:10px 14px; border-radius:8px; font-size:0.83rem; margin-bottom:12px; }
        .btn-submit { width:100%; padding:13px; background:#1D9E75; color:#fff; border:none; border-radius:9px; font-size:0.95rem; font-weight:600; cursor:pointer; margin-top:12px; transition:background 0.15s; }
        .btn-submit:hover:not(:disabled) { background:#18876A; }
        .btn-submit:disabled { opacity:0.6; cursor:not-allowed; }
        @media (max-width:600px) {
          .inv-page { padding:20px 16px; }
          .form-grid { grid-template-columns:1fr; }
          .item-row { grid-template-columns:1fr 60px 110px 28px; }
        }
      `}</style>

      <div className="inv-page">
        <div className="inv-header">
          <div>
            <div className="inv-title">Factures</div>
            <div className="inv-subtitle">Génération conforme DGI · TVA 18% · Export PDF</div>
          </div>
          <button className="btn-new" onClick={() => setShowForm(true)}>
            <SVGPlus /> Nouvelle facture
          </button>
        </div>

        {isFree && (
          <div className="free-banner">
            <span>Plan gratuit — 3 factures/mois avec filigrane SenCompta</span>
            <a href="/pricing">Passer Standard →</a>
          </div>
        )}

        {loading ? (
          <div style={{ color:'#8A9E8F', padding:'40px 0' }}>Chargement...</div>
        ) : invoices.length === 0 ? (
          <div className="empty-state">
            <SVGFile />
            <p style={{ marginTop:12, marginBottom:6 }}>Aucune facture pour l'instant</p>
            <p style={{ fontSize:'0.78rem' }}>Crée ta première facture DGI-compatible</p>
          </div>
        ) : (
          <table className="inv-table">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Client</th>
                <th>Date</th>
                <th>Total TTC</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => {
                const s = STATUT_COLOR[inv.statut] || STATUT_COLOR.BROUILLON;
                return (
                  <tr key={inv.id}>
                    <td style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.8rem', color:'#C9A84C' }}>{inv.numero}</td>
                    <td>{inv.client_name}</td>
                    <td style={{ color:'#8A9E8F', fontSize:'0.82rem' }}>{new Date(inv.date_emission).toLocaleDateString('fr-SN')}</td>
                    <td style={{ fontWeight:600 }}>{FCFA(inv.montant_ttc)}</td>
                    <td>
                      <span className="statut-badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn-sm" onClick={() => window.open(`/api/invoices/${inv.id}/pdf`, '_blank')}>
                          <SVGDownload /> PDF
                        </button>
                        <select className="select-sm" value={inv.statut} onChange={e => changeStatut(inv.id, e.target.value)}>
                          <option value="BROUILLON">Brouillon</option>
                          <option value="ENVOYEE">Envoyée</option>
                          <option value="PAYEE">Payée</option>
                          <option value="ANNULEE">Annulée</option>
                        </select>
                        {inv.statut === 'BROUILLON' && (
                          <button className="btn-sm danger" onClick={() => deleteInvoice(inv.id)}><SVGTrash /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-head">
              <span className="modal-title">Nouvelle facture</span>
              <button className="btn-close" onClick={() => setShowForm(false)}><SVGClose /></button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <div className="section-head">Informations client</div>
            <div className="form-grid">
              <div className="form-full">
                <label>Nom du client *</label>
                <input value={form.clientName} onChange={e => setForm(f => ({...f, clientName: e.target.value}))} placeholder="Aminata Diallo / Boutique Kaolack..." />
              </div>
              <div>
                <label>Téléphone</label>
                <input value={form.clientTel} onChange={e => setForm(f => ({...f, clientTel: e.target.value}))} placeholder="+221 77..." />
              </div>
              <div>
                <label>NINEA client</label>
                <input value={form.clientNinea} onChange={e => setForm(f => ({...f, clientNinea: e.target.value}))} placeholder="Si disponible" />
              </div>
              <div className="form-full">
                <label>Adresse client</label>
                <input value={form.clientAdresse} onChange={e => setForm(f => ({...f, clientAdresse: e.target.value}))} placeholder="Rue, quartier, ville..." />
              </div>
            </div>

            <div className="section-head">Dates</div>
            <div className="form-grid">
              <div>
                <label>Date d'émission *</label>
                <input type="date" value={form.dateEmission} onChange={e => setForm(f => ({...f, dateEmission: e.target.value}))} />
              </div>
              <div>
                <label>Date d'échéance</label>
                <input type="date" value={form.dateEcheance} onChange={e => setForm(f => ({...f, dateEcheance: e.target.value}))} />
              </div>
            </div>

            <div className="section-head">Lignes de facture</div>
            {form.items.map((item, idx) => (
              <div className="item-row" key={idx}>
                <div>
                  {idx === 0 && <label>Description</label>}
                  <input value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="Tissus wax..." />
                </div>
                <div>
                  {idx === 0 && <label>Qté</label>}
                  <input type="number" min="1" value={item.quantite} onChange={e => updateItem(idx, 'quantite', e.target.value)} />
                </div>
                <div>
                  {idx === 0 && <label>Prix unit. (FCFA)</label>}
                  <input type="number" value={item.prixUnitaire} onChange={e => updateItem(idx, 'prixUnitaire', e.target.value)} placeholder="5000" />
                </div>
                <button className="btn-del-item" onClick={() => removeItem(idx)} disabled={form.items.length === 1}>
                  <SVGClose />
                </button>
              </div>
            ))}
            <button className="btn-add-item" onClick={addItem}>+ Ajouter une ligne</button>

            <div className="section-head">Options</div>
            <label className="tva-toggle" onClick={() => setForm(f => ({...f, tvaApplicable: !f.tvaApplicable}))}>
              <div className={`toggle-switch ${form.tvaApplicable ? 'on' : ''}`}>
                <div className="toggle-knob" />
              </div>
              Appliquer TVA 18% (si vous êtes assujetti à la TVA au Sénégal)
            </label>

            <div className="total-preview" style={{ marginTop:16 }}>
              <div className="total-row"><span>Montant HT</span><span>{FCFA(totalHT)}</span></div>
              {form.tvaApplicable && <div className="total-row"><span>TVA 18%</span><span>{FCFA(totalTVA)}</span></div>}
              <div className="total-row main"><span>TOTAL TTC</span><span style={{color:'#1D9E75'}}>{FCFA(totalTTC)}</span></div>
            </div>

            <div style={{ marginTop:8 }}>
              <label>Notes (optionnel)</label>
              <textarea rows="2" value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Conditions de paiement, remarques..." />
            </div>

            <button className="btn-submit" onClick={submit} disabled={saving}>
              {saving ? 'Création...' : 'Créer la facture'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
