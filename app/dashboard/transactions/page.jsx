'use client';
import { useState, useEffect } from 'react';

const CATEGORIES_RECETTE = ['Vente marchandise','Prestation de service','Remboursement','Acompte client','Autre recette'];
const CATEGORIES_DEPENSE = ['Achat marchandise','Transport','Loyer','Salaires','Téléphone/Internet','Électricité/Eau','Alimentation','Santé','Publicité','Frais bancaires','Autre dépense'];
const fcfa = (n) => new Intl.NumberFormat('fr-SN').format(n) + ' FCFA';
const EMPTY_FORM = { type: 'RECETTE', montant: '', libelle: '', categorie: 'Vente marchandise', date: new Date().toISOString().slice(0, 10) };

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

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
    try {
      const res  = await fetch(`/api/transactions?days=${days}`);
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [days]);

  const handleSave = async () => {
    if (!form.montant || !form.libelle) return;
    setSaving(true);
    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

  const totalRecettes = filtered.filter(t => t.type === 'RECETTE').reduce((s, t) => s + Number(t.montant), 0);
  const totalDepenses = filtered.filter(t => t.type === 'DEPENSE').reduce((s, t) => s + Number(t.montant), 0);

  return (
    <>
      <style>{`
        .tx-topbar {
          padding: 18px 28px; border-bottom: 1px solid #1E3328;
          background: rgba(13,27,20,0.97); backdrop-filter: blur(10px);
          position: sticky; top: 0; z-index: 10;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .tx-title { font-family: 'Playfair Display', serif; font-size: 1.2rem; }
        .btn-add {
          background: linear-gradient(135deg, #C9A84C, #A07820);
          color: #0D1B14; border: none; border-radius: 10px;
          padding: 10px 18px; font-size: 0.85rem; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; gap: 6px;
          white-space: nowrap; -webkit-tap-highlight-color: transparent;
        }

        .tx-content { padding: 20px 28px; }

        /* Résumé */
        .tx-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .summary-card {
          background: #122019; border: 1px solid #1E3328;
          border-radius: 10px; padding: 14px 16px;
        }
        .summary-label { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 1px; color: #8A9E8F; margin-bottom: 4px; }
        .summary-val { font-family: 'DM Mono', monospace; font-size: 1rem; }
        .summary-val.rec { color: #4CAF7D; }
        .summary-val.dep { color: #E07B54; }

        /* Filtres */
        .filters { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
        .search-wrap { position: relative; flex: 1; min-width: 160px; }
        .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #8A9E8F; }
        .filter-input {
          width: 100%; background: #122019; border: 1px solid #1E3328; color: #EDE8DC;
          border-radius: 8px; padding: 8px 12px 8px 32px; font-size: 0.83rem;
          font-family: inherit; outline: none;
        }
        .filter-input:focus { border-color: #C9A84C; }
        .filter-select {
          background: #122019; border: 1px solid #1E3328; color: #EDE8DC;
          border-radius: 8px; padding: 8px 12px; font-size: 0.83rem; font-family: inherit; outline: none;
        }
        .filter-btn {
          padding: 8px 14px; border-radius: 8px; border: 1px solid #1E3328;
          background: transparent; color: #8A9E8F; cursor: pointer; font-size: 0.8rem;
          transition: all 0.15s; white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
        }
        .filter-btn.active { background: rgba(201,168,76,0.12); border-color: rgba(201,168,76,0.35); color: #C9A84C; }

        /* ── TABLE desktop ── */
        .tx-table { width: 100%; border-collapse: collapse; }
        .tx-table th {
          text-align: left; font-size: 0.68rem; text-transform: uppercase;
          letter-spacing: 1px; color: #8A9E8F; padding: 10px 14px;
          border-bottom: 1px solid #1E3328;
        }
        .tx-table td { padding: 12px 14px; border-bottom: 1px solid #1E3328; font-size: 0.84rem; }
        .tx-table tr:last-child td { border-bottom: none; }
        .tx-table tr:hover td { background: rgba(255,255,255,0.02); }
        .badge { padding: 3px 8px; border-radius: 6px; font-size: 0.67rem; font-weight: 600; }
        .badge.RECETTE { background: rgba(76,175,125,0.15); color: #4CAF7D; }
        .badge.DEPENSE { background: rgba(224,123,84,0.15); color: #E07B54; }
        .amount { font-family: 'DM Mono', monospace; font-size: 0.84rem; }
        .amount.RECETTE { color: #4CAF7D; }
        .amount.DEPENSE { color: #E07B54; }

        /* ── CARDS mobile ── */
        .tx-cards { display: none; flex-direction: column; gap: 8px; }
        .tx-card {
          background: #122019; border: 1px solid #1E3328;
          border-radius: 10px; padding: 14px 16px;
          display: flex; align-items: center; gap: 12px;
        }
        .tx-card-icon {
          width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .tx-card-body { flex: 1; min-width: 0; }
        .tx-card-libelle { font-size: 0.88rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tx-card-meta { font-size: 0.72rem; color: #8A9E8F; margin-top: 2px; }
        .tx-card-right { text-align: right; flex-shrink: 0; }
        .tx-card-amount { font-family: 'DM Mono', monospace; font-size: 0.9rem; }
        .tx-card-date { font-size: 0.68rem; color: #8A9E8F; margin-top: 2px; }

        .empty { text-align: center; padding: 48px 16px; color: #8A9E8F; font-size: 0.85rem; }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.65);
          backdrop-filter: blur(4px); z-index: 200;
          display: flex; align-items: flex-end; justify-content: center;
          padding: 0;
        }
        .modal {
          background: #122019; border: 1px solid #1E3328;
          border-radius: 20px 20px 0 0; padding: 28px 24px;
          width: 100%; max-width: 520px;
          max-height: 90vh; overflow-y: auto;
        }
        .modal-title { font-family: 'Playfair Display', serif; font-size: 1.15rem; margin-bottom: 20px; }
        .modal-handle { width: 40px; height: 4px; background: #1E3328; border-radius: 2px; margin: 0 auto 20px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
        .form-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: #8A9E8F; }
        .form-control {
          background: #0D1B14; border: 1px solid #1E3328; color: #EDE8DC;
          border-radius: 8px; padding: 12px 14px; font-size: 0.9rem;
          font-family: inherit; outline: none; width: 100%;
          -webkit-appearance: none;
        }
        .form-control:focus { border-color: #C9A84C; }
        .modal-actions { display: flex; gap: 10px; margin-top: 16px; }
        .btn-save {
          flex: 1; background: linear-gradient(135deg, #C9A84C, #A07820);
          color: #0D1B14; border: none; border-radius: 10px;
          padding: 14px; font-weight: 700; cursor: pointer; font-size: 0.95rem;
        }
        .btn-cancel {
          padding: 14px 20px; background: transparent;
          border: 1px solid #1E3328; color: #8A9E8F;
          border-radius: 10px; cursor: pointer;
        }

        /* Type selector */
        .type-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
        .type-btn {
          padding: 10px; border-radius: 8px; border: 1px solid #1E3328;
          background: transparent; color: #8A9E8F; cursor: pointer;
          font-size: 0.85rem; font-family: inherit; transition: all 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .type-btn.rec.active { background: rgba(76,175,125,0.15); border-color: rgba(76,175,125,0.4); color: #4CAF7D; }
        .type-btn.dep.active { background: rgba(224,123,84,0.15); border-color: rgba(224,123,84,0.4); color: #E07B54; }

        @media (min-width: 769px) {
          .modal-overlay { align-items: center; padding: 24px; }
          .modal { border-radius: 20px; }
          .modal-handle { display: none; }
        }

        @media (max-width: 768px) {
          .tx-topbar { padding: 12px 16px; }
          .tx-content { padding: 16px; }
          .tx-table { display: none; }
          .tx-cards { display: flex; }
          .form-row { grid-template-columns: 1fr; }
          .filters { gap: 6px; }
        }
      `}</style>

      {/* Topbar */}
      <div className="tx-topbar">
        <h1 className="tx-title">Transactions</h1>
        <button className="btn-add" onClick={() => setShowForm(true)}>
          <IconPlus /> Nouvelle
        </button>
      </div>

      <div className="tx-content">

        {/* Résumé */}
        <div className="tx-summary">
          <div className="summary-card">
            <div className="summary-label">Recettes ({filter === 'ALL' ? 'période' : 'filtrées'})</div>
            <div className="summary-val rec">+{fcfa(totalRecettes)}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Dépenses ({filter === 'ALL' ? 'période' : 'filtrées'})</div>
            <div className="summary-val dep">-{fcfa(totalDepenses)}</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="filters">
          <div className="search-wrap">
            <span className="search-icon"><IconSearch /></span>
            <input className="filter-input" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {['ALL','RECETTE','DEPENSE'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'ALL' ? 'Tout' : f === 'RECETTE' ? 'Recettes' : 'Dépenses'}
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
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1E3328" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 10px', display: 'block' }}>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            Aucune transaction trouvée.<br />Envoyez vos opérations via WhatsApp ou ajoutez-en une manuellement.
          </div>
        ) : (
          <>
            {/* Table desktop */}
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Date</th><th>Type</th><th>Libellé</th>
                  <th>Catégorie</th><th>Source</th>
                  <th style={{ textAlign: 'right' }}>Montant</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => (
                  <tr key={tx.id}>
                    <td style={{ color: '#8A9E8F' }}>
                      {new Date(tx.date).toLocaleDateString('fr-SN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td><span className={`badge ${tx.type}`}>{tx.type}</span></td>
                    <td>{tx.libelle}</td>
                    <td style={{ color: '#8A9E8F', fontSize: '0.78rem' }}>{tx.categorie}</td>
                    <td style={{ fontSize: '0.72rem', color: '#8A9E8F' }}>{tx.source}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`amount ${tx.type}`}>
                        {tx.type === 'RECETTE' ? '+' : '-'} {fcfa(tx.montant)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Cards mobile */}
            <div className="tx-cards">
              {filtered.map(tx => (
                <div key={tx.id} className="tx-card">
                  <div className="tx-card-icon" style={{
                    background: tx.type === 'RECETTE' ? 'rgba(76,175,125,0.15)' : 'rgba(224,123,84,0.15)',
                    color: tx.type === 'RECETTE' ? '#4CAF7D' : '#E07B54',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {tx.type === 'RECETTE'
                        ? <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>
                        : <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>
                      }
                    </svg>
                  </div>
                  <div className="tx-card-body">
                    <div className="tx-card-libelle">{tx.libelle}</div>
                    <div className="tx-card-meta">{tx.categorie} · {tx.source}</div>
                  </div>
                  <div className="tx-card-right">
                    <div className="tx-card-amount" style={{ color: tx.type === 'RECETTE' ? '#4CAF7D' : '#E07B54' }}>
                      {tx.type === 'RECETTE' ? '+' : '-'}{fcfa(tx.montant)}
                    </div>
                    <div className="tx-card-date">
                      {new Date(tx.date).toLocaleDateString('fr-SN', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-handle" />
            <h2 className="modal-title">Nouvelle opération</h2>

            {/* Type selector */}
            <div className="type-selector">
              <button
                className={`type-btn rec ${form.type === 'RECETTE' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, type: 'RECETTE', categorie: CATEGORIES_RECETTE[0] })}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                </svg>
                Recette
              </button>
              <button
                className={`type-btn dep ${form.type === 'DEPENSE' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, type: 'DEPENSE', categorie: CATEGORIES_DEPENSE[0] })}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                </svg>
                Dépense
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Montant (FCFA)</label>
              <input className="form-control" type="number" inputMode="numeric" value={form.montant}
                onChange={e => setForm({ ...form, montant: e.target.value })} placeholder="15 000" />
            </div>
            <div className="form-group">
              <label className="form-label">Libellé</label>
              <input className="form-control" value={form.libelle}
                onChange={e => setForm({ ...form, libelle: e.target.value })} placeholder="Ex : Vente de tissu" />
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
                <input className="form-control" type="date" value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowForm(false)}>Annuler</button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
