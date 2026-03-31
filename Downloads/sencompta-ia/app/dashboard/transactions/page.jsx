// app/dashboard/transactions/page.jsx
'use client';
import { useState, useEffect } from 'react';

const CATEGORIES_RECETTE = ['Vente marchandise', 'Prestation de service', 'Remboursement', 'Autre recette'];
const CATEGORIES_DEPENSE = ['Achat marchandise', 'Transport', 'Loyer', 'Salaires', 'Téléphone/Internet', 'Électricité/Eau', 'Alimentation', 'Santé', 'Autre dépense'];
const fcfa = (n) => new Intl.NumberFormat('fr-SN').format(n) + ' FCFA';

const EMPTY_FORM = { type: 'RECETTE', montant: '', libelle: '', categorie: 'Vente marchandise', date: new Date().toISOString().slice(0, 10) };

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('ALL');
  const [search, setSearch]     = useState('');
  const [days, setDays]         = useState(30);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/transactions?days=${days}`);
    const data = await res.json();
    setTransactions(data.transactions || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [days]);

  const handleSave = async () => {
    if (!form.montant || !form.libelle) return;
    setSaving(true);
    await fetch('/api/transactions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, montant: parseInt(form.montant) }),
    });
    setSaving(false);
    setShowForm(false);
    setForm(EMPTY_FORM);
    load();
  };

  const filtered = transactions.filter(t => {
    const matchType   = filter === 'ALL' || t.type === filter;
    const matchSearch = !search || t.libelle.toLowerCase().includes(search.toLowerCase()) || t.categorie.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const cats = form.type === 'RECETTE' ? CATEGORIES_RECETTE : CATEGORIES_DEPENSE;

  return (
    <>
      <style>{`
        .page { padding: 28px 32px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .page-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; }
        .btn-add { background: linear-gradient(135deg, #C9A84C, #A07820); color: #0D1B14; border: none; border-radius: 10px; padding: 10px 20px; font-size: 0.88rem; font-weight: 700; cursor: pointer; }
        .filters { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .filter-select, .filter-input {
          background: #122019; border: 1px solid #1E3328; color: #EDE8DC;
          border-radius: 8px; padding: 8px 12px; font-size: 0.83rem; font-family: inherit; outline: none;
        }
        .filter-input { flex: 1; min-width: 180px; }
        .filter-input:focus, .filter-select:focus { border-color: #C9A84C; }
        .filter-btn {
          padding: 8px 16px; border-radius: 8px; border: 1px solid #1E3328;
          background: transparent; color: #8A9E8F; cursor: pointer; font-size: 0.83rem;
          transition: all 0.15s;
        }
        .filter-btn.active { background: rgba(201,168,76,0.12); border-color: rgba(201,168,76,0.35); color: #C9A84C; }

        /* Table */
        .tx-table { width: 100%; border-collapse: collapse; }
        .tx-table th { text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: #8A9E8F; padding: 10px 14px; border-bottom: 1px solid #1E3328; }
        .tx-table td { padding: 12px 14px; border-bottom: 1px solid #1E3328; font-size: 0.85rem; }
        .tx-table tr:hover td { background: rgba(255,255,255,0.02); }
        .badge { padding: 3px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 600; }
        .badge.RECETTE { background: rgba(76,175,125,0.15); color: #4CAF7D; }
        .badge.DEPENSE { background: rgba(224,123,84,0.15); color: #E07B54; }
        .amount.RECETTE { color: #4CAF7D; }
        .amount.DEPENSE { color: #E07B54; }
        .source-badge { font-size: 0.65rem; color: #8A9E8F; }
        .empty { text-align: center; padding: 48px; color: #8A9E8F; }

        /* Form Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .modal { background: #122019; border: 1px solid #1E3328; border-radius: 20px; padding: 32px; width: 100%; max-width: 480px; }
        .modal-title { font-family: 'Playfair Display', serif; font-size: 1.2rem; margin-bottom: 24px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
        .form-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: #8A9E8F; }
        .form-control { background: #0D1B14; border: 1px solid #1E3328; color: #EDE8DC; border-radius: 8px; padding: 10px 14px; font-size: 0.88rem; font-family: inherit; outline: none; }
        .form-control:focus { border-color: #C9A84C; }
        .modal-actions { display: flex; gap: 10px; margin-top: 20px; }
        .btn-save { flex: 1; background: linear-gradient(135deg, #C9A84C, #A07820); color: #0D1B14; border: none; border-radius: 10px; padding: 12px; font-weight: 700; cursor: pointer; }
        .btn-cancel { flex: 0; padding: 12px 20px; background: transparent; border: 1px solid #1E3328; color: #8A9E8F; border-radius: 10px; cursor: pointer; }

        @media (max-width: 768px) {
          .page { padding: 16px; }
          .tx-table { display: none; }
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Transactions</h1>
          <button className="btn-add" onClick={() => setShowForm(true)}>+ Nouvelle opération</button>
        </div>

        <div className="filters">
          <input className="filter-input" placeholder="🔍 Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
          {['ALL','RECETTE','DEPENSE'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'ALL' ? 'Tout' : f === 'RECETTE' ? '💰 Recettes' : '💸 Dépenses'}
            </button>
          ))}
          <select className="filter-select" value={days} onChange={e => setDays(Number(e.target.value))}>
            <option value={7}>7 jours</option>
            <option value={30}>30 jours</option>
            <option value={90}>90 jours</option>
            <option value={365}>1 an</option>
          </select>
        </div>

        {loading ? (
          <div className="empty">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📭</div>
            Aucune transaction trouvée. Envoyez vos opérations via WhatsApp !
          </div>
        ) : (
          <table className="tx-table">
            <thead>
              <tr>
                <th>Date</th><th>Type</th><th>Libellé</th><th>Catégorie</th><th>Source</th><th style={{ textAlign: 'right' }}>Montant</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tx => (
                <tr key={tx.id}>
                  <td style={{ color: '#8A9E8F' }}>{new Date(tx.date).toLocaleDateString('fr-SN', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                  <td><span className={`badge ${tx.type}`}>{tx.type}</span></td>
                  <td>{tx.libelle}</td>
                  <td style={{ color: '#8A9E8F', fontSize: '0.78rem' }}>{tx.categorie}</td>
                  <td><span className="source-badge">{tx.source === 'WHATSAPP' ? '💬' : '🌐'} {tx.source}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`amount ${tx.type}`}>{tx.type === 'RECETTE' ? '+' : '-'} {fcfa(tx.montant)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <h2 className="modal-title">Nouvelle opération</h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-control" value={form.type} onChange={e => setForm({ ...form, type: e.target.value, categorie: e.target.value === 'RECETTE' ? CATEGORIES_RECETTE[0] : CATEGORIES_DEPENSE[0] })}>
                  <option value="RECETTE">💰 Recette</option>
                  <option value="DEPENSE">💸 Dépense</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Montant (FCFA)</label>
                <input className="form-control" type="number" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} placeholder="15000" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Libellé</label>
              <input className="form-control" value={form.libelle} onChange={e => setForm({ ...form, libelle: e.target.value })} placeholder="Ex : Vente de tissu" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Catégorie</label>
                <select className="form-control" value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })}>
                  {cats.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-control" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowForm(false)}>Annuler</button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>{saving ? 'Enregistrement…' : '✓ Enregistrer'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
