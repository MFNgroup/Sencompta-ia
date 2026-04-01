// app/auth/login/page.jsx
'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const ERROR_MESSAGES = {
  missing_token: 'Lien de connexion invalide ou manquant.',
  invalid_token: 'Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau.',
};

function LoginContent() {
  const searchParams = useSearchParams();
  const errorKey = searchParams.get('error');

  const [phone, setPhone]             = useState('+221');
  const [boutique, setBoutique]       = useState('');
  const [sent, setSent]               = useState(false);
  const [loading, setLoading]         = useState(false);
  const [serverError, setServerError] = useState('');
  const [debugLink, setDebugLink]     = useState('');

  const handleSubmit = async () => {
    if (!/^\+221[0-9]{9}$/.test(phone)) {
      setServerError('Format invalide. Ex : +221771234567');
      return;
    }
    setLoading(true);
    setServerError('');
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, boutique_name: boutique || 'Ma Boutique' }),
      });
      const data = await res.json();
      if (data.error) {
        setServerError(data.error);
      } else {
        setSent(true);
        if (data.debug_link) setDebugLink(data.debug_link);
      }
    } catch {
      setServerError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-deco">
        <div className="deco-pattern" />
        <div className="deco-circle" style={{ width: 300, height: 300, top: -80, right: -80 }} />
        <div className="deco-circle" style={{ width: 200, height: 200, bottom: 40, left: -60 }} />
        <div className="deco-logo">SenCompta IA</div>
        <p className="deco-sub">La comptabilité intelligente pour les commerçants sénégalais. Saisie WhatsApp, analyse IA.</p>
        <div className="deco-features">
          {[
            { icon: '💬', text: 'Saisie instantanée via WhatsApp en français et wolof' },
            { icon: '🤖', text: 'Analyse IA par Gemini pour des conseils personnalisés' },
            { icon: '📊', text: 'Dashboard premium avec graphiques en temps réel' },
            { icon: '🔒', text: 'Connexion sans mot de passe — lien unique sécurisé' },
          ].map((f, i) => (
            <div key={i} className="deco-feat">
              <div className="feat-icon">{f.icon}</div>
              <span style={{ color: '#C4C9BE' }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="login-form-wrap">
        <div className="login-card">
          {!sent ? (
            <>
              <h1 className="login-title">Connexion</h1>
              <p className="login-hint">Entrez votre numéro WhatsApp pour recevoir votre lien de connexion automatique.</p>
              {errorKey && (
                <div className="error-banner">
                  ⚠ {ERROR_MESSAGES[errorKey] || 'Erreur de connexion.'}
                </div>
              )}
              {serverError && <div className="error-banner">⚠ {serverError}</div>}
              <div className="form-group">
                <label className="form-label">Numéro WhatsApp</label>
                <input className="form-input" type="tel" value={phone}
                  onChange={(e) => setPhone(e.target.value)} placeholder="+221 77 000 00 00" />
              </div>
              <div className="form-group">
                <label className="form-label">Nom de votre boutique (optionnel)</label>
                <input className="form-input" type="text" value={boutique}
                  onChange={(e) => setBoutique(e.target.value)} placeholder="Ex : Boutique Aminata" />
              </div>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? '⌛ Envoi en cours…' : '📲 Recevoir mon lien de connexion'}
              </button>
              <p className="form-footer">
                Pas d'abonnement ? <a href="/pricing" style={{ color: '#C9A84C' }}>Découvrir nos offres →</a>
              </p>
            </>
          ) : (
            <div className="success-box">
              <div className="success-icon">✅</div>
              <div className="success-title">Lien envoyé !</div>
              <p className="success-msg">
                Un lien de connexion a été envoyé sur WhatsApp au numéro <strong>{phone}</strong>.<br /><br />
                Cliquez sur le lien pour accéder à votre tableau de bord. Il est valide pendant <strong>15 minutes</strong>.
              </p>
              {debugLink && (
                <div className="debug-link">
                  <strong>DEV ONLY —</strong> <a href={debugLink} style={{ color: '#C9A84C' }}>Cliquer ici</a>
                  <br />{debugLink}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D1B14; color: #EDE8DC; font-family: 'IBM Plex Sans', sans-serif; }
        .login-page { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }
        .login-deco {
          background: linear-gradient(160deg, #122019 0%, #0D1B14 60%);
          position: relative; overflow: hidden;
          display: flex; flex-direction: column; justify-content: center;
          padding: 60px 56px;
        }
        .deco-pattern {
          position: absolute; inset: 0;
          background-image:
            repeating-linear-gradient(0deg, transparent, transparent 39px, #1E3328 40px),
            repeating-linear-gradient(90deg, transparent, transparent 39px, #1E3328 40px);
          opacity: 0.4;
        }
        .deco-circle { position: absolute; border-radius: 50%; border: 1px solid rgba(201,168,76,0.2); }
        .deco-logo { font-family: 'Playfair Display', serif; font-size: 2.8rem; color: #C9A84C; position: relative; z-index: 1; margin-bottom: 12px; }
        .deco-sub { font-size: 1rem; color: #8A9E8F; position: relative; z-index: 1; max-width: 320px; line-height: 1.6; margin-bottom: 48px; }
        .deco-features { display: flex; flex-direction: column; gap: 14px; position: relative; z-index: 1; }
        .deco-feat { display: flex; align-items: center; gap: 12px; font-size: 0.9rem; }
        .feat-icon { width: 36px; height: 36px; border-radius: 8px; background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.25); display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
        .login-form-wrap { display: flex; align-items: center; justify-content: center; padding: 48px 40px; background: #0D1B14; }
        .login-card { width: 100%; max-width: 400px; }
        .login-title { font-family: 'Playfair Display', serif; font-size: 1.8rem; margin-bottom: 6px; }
        .login-hint { font-size: 0.85rem; color: #8A9E8F; margin-bottom: 32px; }
        .error-banner { background: rgba(224,123,84,0.12); border: 1px solid rgba(224,123,84,0.35); border-radius: 8px; padding: 10px 14px; color: #E07B54; font-size: 0.83rem; margin-bottom: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .form-label { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 1px; color: #8A9E8F; }
        .form-input { background: #122019; border: 1px solid #1E3328; border-radius: 10px; padding: 12px 16px; color: #EDE8DC; font-size: 0.95rem; font-family: inherit; transition: border-color 0.15s; outline: none; width: 100%; }
        .form-input:focus { border-color: #C9A84C; }
        .btn-primary { width: 100%; padding: 14px; background: linear-gradient(135deg, #C9A84C, #A07820); color: #0D1B14; border: none; border-radius: 10px; font-size: 1rem; font-weight: 700; cursor: pointer; margin-top: 8px; transition: opacity 0.15s; font-family: inherit; }
        .btn-primary:hover:not(:disabled) { opacity: 0.88; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .form-footer { text-align: center; font-size: 0.78rem; color: #8A9E8F; margin-top: 20px; }
        .success-box { background: rgba(76,175,125,0.1); border: 1px solid rgba(76,175,125,0.3); border-radius: 12px; padding: 24px; text-align: center; }
        .success-icon { font-size: 2.5rem; margin-bottom: 12px; }
        .success-title { font-family: 'Playfair Display', serif; font-size: 1.3rem; margin-bottom: 8px; color: #4CAF7D; }
        .success-msg { font-size: 0.85rem; color: #8A9E8F; line-height: 1.6; }
        .debug-link { margin-top: 16px; padding: 10px; background: #122019; border-radius: 8px; font-size: 0.72rem; word-break: break-all; color: #C9A84C; }
        @media (max-width: 768px) { .login-page { grid-template-columns: 1fr; } .login-deco { display: none; } }
      `}</style>
      <Suspense fallback={<div style={{ background: '#0D1B14', minHeight: '100vh' }} />}>
        <LoginContent />
      </Suspense>
    </>
  );
}
