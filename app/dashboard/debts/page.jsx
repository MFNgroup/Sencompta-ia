// app/dashboard/debts/page.jsx
'use client';
import { useState, useEffect } from 'react';
const fcfa = (n) => new Intl.NumberFormat('fr-SN').format(n) + ' FCFA';
const EMPTY = { clientName: '', amount: '', description: '', dueDate: '' };

export default function DebtsPage() {
  const [debts, setDebts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('UNPAID');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/debts');
    const data = await res.json();
    setDebts(data.debts || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.clientName || !form.amount) return;
    setSaving(true);
    await fetch('/api/debts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseInt(form.amount) }),
    });
    setSaving(false); setShowForm(false); setForm(EMPTY); load();
  };

  const markPaid = async (id) => {
    await fetch(`/api/debts/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'PAID' }) });
    load();
  };

  const filtered  = debts.filter(d => filter === 'ALL' || d.status === filter);
  const totalUnpaid = debts.filter(d => d.status === 'UNPAID').reduce((s, d) => s + Number(d.amount), 0);

  return (
    <>
      <style>{`
        .page { padding: 28px 32px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .page-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; }
        .btn-add { background: linear-gradient(135deg, #C9A84C, #A07820); color: #0D1B14; border: none; border-radius: 10px; padding: 10px 20px; font-size: 0.88rem; font-weight: 700; cursor: pointer; }
        .summary-card { background: #122019; border: 1px solid #E07B54; border-radius: 14px; padding: 20px 24px; margin-bottom: 24px; display: flex; align-items: center; gap: 16px; }
        .summary-icon { font-size: 2rem; }
        .summary-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #8A9E8F; }
        .summary-amount { font-family: 'DM Mono', monospace; font-size: 1.5rem; color: #E07B54; }
        .filters { display: flex; gap: 8px; margin-bottom: 20px; }
        .filter-btn { padding: 7px 16px; border-radius: 8px; border: 1px solid #1E3328; background: transparent; color: #8A9E8F; cursor: pointer; font-size: 0.83rem; transition: all 0.15s; }
        .filter-btn.active { background: rgba(201,168,76,0.12); border-color: rgba(201,168,76,0.35); color: #C9A84C; }
        .debt-grid { display: flex; flex-direction: column; gap: 10px; }
        .debt-card { background: #122019; border: 1px solid #1E3328; border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; gap: 16px; }
        .debt-avatar { width: 40px; height: 40px; border-radius: 50%; background: rgba(224,123,84,0.15); border: 1px solid rgba(224,123,84,0.3); display: flex; align-items: center; justify-content: center; font-weight: 700; color: #E07B54; flex-shrink: 0; }
        .debt-info { flex: 1; }
        .debt-client { font-weight: 600; font-size: 0.9rem; }
        .debt-desc { font-size: 0.75rem; color: #8A9E8F; margin-top: 2px; }
        .debt-due { font-size: 0.72rem; color: #8A9E8F; margin-top: 4px; }
        .debt-due.overdue { color: #E07B54; }
        .debt-right { text-align: right; }
        .debt-amount { font-family: 'DM Mono', monospace; font-size: 1rem; color: #E07B54; }
        .debt-amount.paid { color: #4CAF7D; }
        .debt-status { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; color: #8A9E8F; }
        .btn-pay { margin-top: 6px; background: rgba(76,175,125,0.1); border: 1px solid rgba(76,175,125,0.3); color: #4CAF7D; border-radius: 6px; padding: 4px 10px; font-size: 0.72rem; cursor: pointer; }
        .empty { text-align: center; padding: 48px; color: #8A9E8F; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .modal { background: #122019; border: 1px solid #1E3328; border-radius: 20px; padding: 32px; width: 100%; max-width: 440px; }
        .modal-title { font-family: 'Playfair Display', serif; font-size: 1.2rem; margin-bottom: 24px; }
        .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
        .form-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: #8A9E8F; }
        .form-control { background: #0D1B14; border: 1px solid #1E3328; color: #EDE8DC; border-radius: 8px; padding: 10px 14px; font-size: 0.88rem; font-family: inherit; outline: none; }
        .form-control:focus { border-color: #C9A84C; }
        .modal-actions { display: flex; gap: 10px; margin-top: 20px; }
        .btn-save { flex: 1; background: linear-gradient(135deg, #C9A84C, #A07820); color: #0D1B14; border: none; border-radius: 10px; padding: 12px; font-weight: 700; cursor: pointer; }
        .btn-cancel { padding: 12px 20px; background: transparent; border: 1px solid #1E3328; color: #8A9E8F; border-radius: 10px; cursor: pointer; }
        @media (max-width: 768px) { .page { padding: 16px; } }
      `}</style>

      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Créances clients</h1>
          <button className="btn-add" onClick={() => setShowForm(true)}>+ Ajouter une créance</button>
        </div>

        {totalUnpaid > 0 && (
          <div className="summary-card">
            <div className="summary-icon">⚠️</div>
            <div>
              <div className="summary-label">Total impayé</div>
              <div className="summary-amount">{fcfa(totalUnpaid)}</div>
            </div>
          </div>
        )}

        <div className="filters">
          {['UNPAID','PAID','ALL'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'UNPAID' ? '⏳ Impayées' : f === 'PAID' ? '✅ Payées' : 'Toutes'}
            </button>
          ))}
        </div>

        {loading ? <div className="empty">Chargement…</div> : filtered.length === 0 ? (
          <div className="empty">
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
            {filter === 'UNPAID' ? 'Aucune créance impayée. Beau travail !' : 'Aucune créance.'}
          </div>
        ) : (
          <div className="debt-grid">
            {filtered.map(d => {
              const isOverdue = d.due_date && new Date(d.due_date) < new Date() && d.status === 'UNPAID';
              return (
                <div key={d.id} className="debt-card">
                  <div className="debt-avatar">{d.client_name[0].toUpperCase()}</div>
                  <div className="debt-info">
                    <div className="debt-client">{d.client_name}</div>
                    {d.description && <div className="debt-desc">{d.description}</div>}
                    {d.due_date && (
                      <div className={`debt-due ${isOverdue ? 'overdue' : ''}`}>
                        {isOverdue ? '⚠ ' : '📅 '}Échéance : {new Date(d.due_date).toLocaleDateString('fr-SN')}
                      </div>
                    )}
                  </div>
                  <div className="debt-right">
                    <div className={`debt-amount ${d.status === 'PAID' ? 'paid' : ''}`}>{fcfa(d.amount)}</div>
                    <div className="debt-status">{d.status === 'PAID' ? '✓ Payé' : 'Impayé'}</div>
                    {d.status === 'UNPAID' && (
                      <button className="btn-pay" onClick={() => markPaid(d.id)}>Marquer payé</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <h2 className="modal-title">Nouvelle créance</h2>
            <div className="form-group">
              <label className="form-label">Nom du client</label>
              <input className="form-control" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} placeholder="Ex : Mamadou Diallo" />
            </div>
            <div className="form-group">
              <label className="form-label">Montant (FCFA)</label>
              <input className="form-control" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="50000" />
            </div>
            <div className="form-group">
              <label className="form-label">Description (optionnel)</label>
              <input className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ex : Tissu imprimé acheté à crédit" />
            </div>
            <div className="form-group">
              <label className="form-label">Date d'échéance (optionnel)</label>
              <input className="form-control" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
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
