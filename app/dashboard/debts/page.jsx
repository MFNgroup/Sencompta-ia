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
  const [paying, setPaying]     = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/debts');
      const data = await res.json();
      setDebts(data.debts || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.clientName || !form.amount) return;
    setSaving(true);
    await fetch('/api/debts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseInt(form.amount) }),
    });
    setSaving(false); setShowForm(false); setForm(EMPTY); load();
  };

  // ── Bug fix : marquer payé ET créer une transaction RECETTE ──
  const markPaid = async (debt) => {
    setPaying(debt.id);
    try {
      // 1. Mettre à jour le statut de la créance
      await fetch(`/api/debts/${debt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID' }),
      });

      // 2. Créer la transaction RECETTE correspondante
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type:      'RECETTE',
          montant:   Number(debt.amount),
          libelle:   `Remboursement — ${debt.client_name}`,
          categorie: 'Remboursement reçu',
          source:    'WEB',
          date:      new Date().toISOString().slice(0, 10),
        }),
      });

      load();
    } catch(e) { console.error(e); }
    finally { setPaying(null); }
  };

  const filtered    = debts.filter(d => filter === 'ALL' || d.status === (filter === 'UNPAID' ? 'PENDING' : 'PAID') || (filter === 'UNPAID' && d.status === 'UNPAID'));
  const totalUnpaid = debts.filter(d => d.status === 'PENDING' || d.status === 'UNPAID').reduce((s, d) => s + Number(d.amount), 0);

  return (
    <>
      <style>{`
        .debts-topbar {
          padding: 18px 28px; border-bottom: 1px solid #1E3328;
          background: rgba(13,27,20,0.97); backdrop-filter: blur(10px);
          position: sticky; top: 0; z-index: 10;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .debts-title { font-family: 'Playfair Display', serif; font-size: 1.2rem; }
        .btn-add {
          background: linear-gradient(135deg, #C9A84C, #A07820);
          color: #0D1B14; border: none; border-radius: 10px;
          padding: 10px 18px; font-size: 0.85rem; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; gap: 6px;
          white-space: nowrap; -webkit-tap-highlight-color: transparent;
        }
        .debts-content { padding: 20px 28px; }

        .summary-card {
          background: #122019; border: 1px solid rgba(224,123,84,0.35);
          border-radius: 12px; padding: 18px 20px; margin-bottom: 20px;
          display: flex; align-items: center; gap: 16px;
        }
        .summary-icon {
          width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0;
          background: rgba(224,123,84,0.12); display: flex; align-items: center;
          justify-content: center; color: #E07B54;
        }
        .summary-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: #8A9E8F; margin-bottom: 4px; }
        .summary-amount { font-family: 'DM Mono', monospace; font-size: 1.4rem; color: #E07B54; }

        .filters { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .filter-btn {
          padding: 8px 14px; border-radius: 8px; border: 1px solid #1E3328;
          background: transparent; color: #8A9E8F; cursor: pointer; font-size: 0.82rem;
          transition: all 0.15s; -webkit-tap-highlight-color: transparent;
        }
        .filter-btn.active { background: rgba(201,168,76,0.12); border-color: rgba(201,168,76,0.35); color: #C9A84C; }

        .debt-list { display: flex; flex-direction: column; gap: 8px; }
        .debt-card {
          background: #122019; border: 1px solid #1E3328;
          border-radius: 12px; padding: 16px 18px;
          display: flex; align-items: center; gap: 14px;
        }
        .debt-avatar {
          width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
          background: rgba(224,123,84,0.12); border: 1px solid rgba(224,123,84,0.25);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; color: #E07B54; font-size: 1rem;
        }
        .debt-avatar.paid {
          background: rgba(76,175,125,0.12); border-color: rgba(76,175,125,0.25);
          color: #4CAF7D;
        }
        .debt-info { flex: 1; min-width: 0; }
        .debt-client { font-weight: 600; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .debt-desc { font-size: 0.74rem; color: #8A9E8F; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .debt-due { font-size: 0.7rem; color: #8A9E8F; margin-top: 3px; }
        .debt-due.overdue { color: #E07B54; }
        .debt-right { text-align: right; flex-shrink: 0; }
        .debt-amount { font-family: 'DM Mono', monospace; font-size: 0.95rem; color: #E07B54; }
        .debt-amount.paid { color: #4CAF7D; }
        .debt-status { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1px; color: #8A9E8F; margin-top: 2px; }
        .btn-pay {
          margin-top: 6px; background: rgba(76,175,125,0.1);
          border: 1px solid rgba(76,175,125,0.3); color: #4CAF7D;
          border-radius: 6px; padding: 5px 10px; font-size: 0.72rem;
          cursor: pointer; transition: all 0.15s; font-family: inherit;
          -webkit-tap-highlight-color: transparent;
          display: flex; align-items: center; gap: 4px; margin-left: auto;
        }
        .btn-pay:hover { background: rgba(76,175,125,0.18); }
        .btn-pay:disabled { opacity: 0.5; cursor: not-allowed; }

        .paid-notice {
          font-size: 0.72rem; color: #4CAF7D;
          display: flex; align-items: center; gap: 4px; margin-top: 4px;
        }

        .empty { text-align: center; padding: 48px 16px; color: #8A9E8F; font-size: 0.85rem; }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.65);
          backdrop-filter: blur(4px); z-index: 200;
          display: flex; align-items: flex-end; justify-content: center;
        }
        .modal {
          background: #122019; border: 1px solid #1E3328;
          border-radius: 20px 20px 0 0; padding: 28px 24px;
          width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto;
        }
        .modal-handle { width: 40px; height: 4px; background: #1E3328; border-radius: 2px; margin: 0 auto 20px; }
        .modal-title { font-family: 'Playfair Display', serif; font-size: 1.15rem; margin-bottom: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
        .form-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: #8A9E8F; }
        .form-control {
          background: #0D1B14; border: 1px solid #1E3328; color: #EDE8DC;
          border-radius: 8px; padding: 12px 14px; font-size: 0.9rem;
          font-family: inherit; outline: none; width: 100%; -webkit-appearance: none;
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
          border: 1px solid #1E3328; color: #8A9E8F; border-radius: 10px; cursor: pointer;
        }

        @media (min-width: 769px) {
          .modal-overlay { align-items: center; }
          .modal { border-radius: 20px; }
          .modal-handle { display: none; }
        }
        @media (max-width: 768px) {
          .debts-topbar { padding: 12px 16px; }
          .debts-content { padding: 16px; }
        }
      `}</style>

      {/* Topbar */}
      <div className="debts-topbar">
        <h1 className="debts-title">Créances clients</h1>
        <button className="btn-add" onClick={() => setShowForm(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Ajouter
        </button>
      </div>

      <div className="debts-content">

        {totalUnpaid > 0 && (
          <div className="summary-card">
            <div className="summary-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div>
              <div className="summary-label">Total impayé</div>
              <div className="summary-amount">{fcfa(totalUnpaid)}</div>
            </div>
          </div>
        )}

        <div className="filters">
          {[
            { key: 'UNPAID', label: 'Impayées' },
            { key: 'PAID',   label: 'Payées' },
            { key: 'ALL',    label: 'Toutes' },
          ].map(f => (
            <button key={f.key} className={`filter-btn ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="empty">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1E3328" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 10px', display: 'block' }}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {filter === 'UNPAID' ? 'Aucune créance impayée. Beau travail !' : 'Aucune créance.'}
          </div>
        ) : (
          <div className="debt-list">
            {filtered.map(d => {
              const isPaid    = d.status === 'PAID';
              const isOverdue = d.due_date && new Date(d.due_date) < new Date() && !isPaid;
              return (
                <div key={d.id} className="debt-card">
                  <div className={`debt-avatar ${isPaid ? 'paid' : ''}`}>
                    {d.client_name[0].toUpperCase()}
                  </div>
                  <div className="debt-info">
                    <div className="debt-client">{d.client_name}</div>
                    {d.description && <div className="debt-desc">{d.description}</div>}
                    {d.due_date && (
                      <div className={`debt-due ${isOverdue ? 'overdue' : ''}`}>
                        Échéance : {new Date(d.due_date).toLocaleDateString('fr-SN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {isOverdue && ' — En retard'}
                      </div>
                    )}
                    {isPaid && d.paid_at && (
                      <div className="paid-notice">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Payé le {new Date(d.paid_at).toLocaleDateString('fr-SN', { day: '2-digit', month: 'short' })} — Transaction enregistrée
                      </div>
                    )}
                  </div>
                  <div className="debt-right">
                    <div className={`debt-amount ${isPaid ? 'paid' : ''}`}>{fcfa(d.amount)}</div>
                    <div className="debt-status">{isPaid ? 'Payé' : 'Impayé'}</div>
                    {!isPaid && (
                      <button className="btn-pay" onClick={() => markPaid(d)} disabled={paying === d.id}>
                        {paying === d.id ? '…' : (
                          <>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Marquer payé
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-handle" />
            <h2 className="modal-title">Nouvelle créance</h2>
            <div className="form-group">
              <label className="form-label">Nom du client</label>
              <input className="form-control" value={form.clientName}
                onChange={e => setForm({ ...form, clientName: e.target.value })}
                placeholder="Ex : Mamadou Diallo" autoComplete="off" />
            </div>
            <div className="form-group">
              <label className="form-label">Montant (FCFA)</label>
              <input className="form-control" type="number" inputMode="numeric" value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="50 000" />
            </div>
            <div className="form-group">
              <label className="form-label">Description (optionnel)</label>
              <input className="form-control" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Ex : Tissu imprimé à crédit" />
            </div>
            <div className="form-group">
              <label className="form-label">Date d'échéance (optionnel)</label>
              <input className="form-control" type="date" value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })} />
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
