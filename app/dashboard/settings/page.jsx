// app/dashboard/settings/page.jsx
'use client';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [user, setUser]       = useState(null);
  const [form, setForm]       = useState({ boutique_name: '' });
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    fetch('/api/user/me').then(r => r.json()).then(d => {
      if (!d.error) { setUser(d); setForm({ boutique_name: d.boutique_name || '' }); }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/user/me', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boutique_name: form.boutique_name }),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const subExpiry = user?.subscription_expiry ? new Date(user.subscription_expiry) : null;
  const isActive  = subExpiry && subExpiry > new Date();
  const daysLeft  = subExpiry ? Math.max(0, Math.ceil((subExpiry - new Date()) / 86400000)) : 0;

  return (
    <>
      <style>{`
        .page { padding: 28px 32px; max-width: 640px; }
        .page-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; margin-bottom: 28px; }
        .settings-section { background: #122019; border: 1px solid #1E3328; border-radius: 14px; padding: 24px; margin-bottom: 20px; }
        .section-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: #8A9E8F; margin-bottom: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
        .form-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: #8A9E8F; }
        .form-control { background: #0D1B14; border: 1px solid #1E3328; color: #EDE8DC; border-radius: 8px; padding: 10px 14px; font-size: 0.88rem; font-family: inherit; outline: none; }
        .form-control:focus { border-color: #C9A84C; }
        .form-control[disabled] { opacity: 0.5; cursor: not-allowed; }
        .form-hint { font-size: 0.72rem; color: #8A9E8F; }
        .btn-save { background: linear-gradient(135deg, #C9A84C, #A07820); color: #0D1B14; border: none; border-radius: 10px; padding: 10px 24px; font-size: 0.88rem; font-weight: 700; cursor: pointer; }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .success-msg { font-size: 0.82rem; color: #4CAF7D; margin-left: 12px; }
        .sub-info { display: flex; align-items: center; gap: 16px; }
        .sub-plan { font-family: 'DM Mono', monospace; font-size: 1.2rem; color: #C9A84C; }
        .sub-expiry { font-size: 0.82rem; color: #8A9E8F; }
        .sub-expiry strong { color: #EDE8DC; }
        .sub-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; }
        .sub-badge.active { background: rgba(76,175,125,0.12); border: 1px solid rgba(76,175,125,0.3); color: #4CAF7D; }
        .sub-badge.expired { background: rgba(224,123,84,0.12); border: 1px solid rgba(224,123,84,0.3); color: #E07B54; }
        .btn-upgrade { display: inline-block; margin-top: 14px; text-decoration: none; background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.3); color: #C9A84C; border-radius: 8px; padding: 8px 18px; font-size: 0.83rem; }
        .whatsapp-info { display: flex; align-items: flex-start; gap: 12px; }
        .wa-icon { font-size: 1.8rem; flex-shrink: 0; }
        .wa-text { font-size: 0.85rem; color: #8A9E8F; line-height: 1.6; }
        .wa-number { font-family: 'DM Mono', monospace; font-size: 1.1rem; color: #C9A84C; display: block; margin-bottom: 4px; }
        @media (max-width: 768px) { .page { padding: 16px; } }
      `}</style>

      <div className="page">
        <h1 className="page-title">Paramètres</h1>

        {/* Profil */}
        <div className="settings-section">
          <div className="section-title">Profil boutique</div>
          <div className="form-group">
            <label className="form-label">Nom de la boutique</label>
            <input className="form-control" value={form.boutique_name} onChange={e => setForm({ ...form, boutique_name: e.target.value })} placeholder="Ma Boutique" />
          </div>
          <div className="form-group">
            <label className="form-label">Numéro WhatsApp</label>
            <input className="form-control" value={user?.phone || ''} disabled />
            <span className="form-hint">Le numéro ne peut pas être modifié. Contactez le support si nécessaire.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className="btn-save" onClick={handleSave} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
            {saved && <span className="success-msg">✓ Enregistré !</span>}
          </div>
        </div>

        {/* Abonnement */}
        <div className="settings-section">
          <div className="section-title">Abonnement</div>
          <div className="sub-info">
            <div className="sub-plan">{user?.plan || '—'}</div>
            <span className={`sub-badge ${isActive ? 'active' : 'expired'}`}>
              {isActive ? `Actif · ${daysLeft}j restants` : 'Expiré'}
            </span>
          </div>
          {subExpiry && (
            <div className="sub-expiry" style={{ marginTop: '8px' }}>
              Expire le <strong>{subExpiry.toLocaleDateString('fr-SN', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
            </div>
          )}
          <a href="/pricing" className="btn-upgrade">
            {user?.plan === 'PREMIUM' ? '↻ Renouveler l\'abonnement' : '⭐ Passer au Premium — 7 500 FCFA/mois'}
          </a>
        </div>

        {/* WhatsApp */}
        <div className="settings-section">
          <div className="section-title">Saisie WhatsApp</div>
          <div className="whatsapp-info">
            <div className="wa-icon">💬</div>
            <div className="wa-text">
              <span className="wa-number">+221 XX XXX XX XX</span>
              Enregistrez ce numéro dans vos contacts WhatsApp et envoyez vos opérations en texte ou vocal.<br /><br />
              <strong style={{ color: '#EDE8DC' }}>Exemples :</strong><br />
              • <code>"vendu boubou 45000"</code><br />
              • <code>"bind légumes 8500 fàkk"</code><br />
              • <code>"loyer payé 75000 ce mois"</code>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
