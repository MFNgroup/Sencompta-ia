'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const ERROR_MESSAGES = {
  missing_token: 'Lien de connexion invalide ou manquant.',
  invalid_token: 'Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau.',
};

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const FEATURES = [
  { text: 'Saisie WhatsApp en français et wolof' },
  { text: 'Analyse IA Gemini — conseils personnalisés' },
  { text: 'Dashboard avec graphiques en temps réel' },
  { text: 'Connexion sans mot de passe — lien sécurisé' },
];

function LoginContent() {
  const searchParams = useSearchParams();
  const errorKey     = searchParams.get('error');

  const [phone, setPhone]             = useState('+221');
  const [boutique, setBoutique]       = useState('');
  const [accepted, setAccepted]       = useState(false);
  const [sent, setSent]               = useState(false);
  const [loading, setLoading]         = useState(false);
  const [serverError, setServerError] = useState('');
  const [debugLink, setDebugLink]     = useState('');

  const handleSubmit = async () => {
    if (!/^\+221[0-9]{9}$/.test(phone)) {
      setServerError('Format invalide. Ex : +221771234567');
      return;
    }
    if (!accepted) {
      setServerError("Acceptez les conditions d'utilisation pour continuer.");
      return;
    }
    setLoading(true);
    setServerError('');
    try {
      const res  = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, boutique_name: boutique || 'Ma Boutique' }),
      });
      const data = await res.json();
      if (data.error) { setServerError(data.error); }
      else { setSent(true); if (data.debug_link) setDebugLink(data.debug_link); }
    } catch { setServerError('Erreur réseau. Veuillez réessayer.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #0D1B14; color: #EDE8DC; font-family: 'IBM Plex Sans', sans-serif; -webkit-font-smoothing: antialiased; }
        input { color-scheme: dark; font-family: inherit; }
        button { font-family: inherit; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }

        .login-wrap {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          background: #0D1B14;
        }

        /* ── Mobile header (logo only) ── */
        .mobile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px 0;
        }
        .mobile-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          color: #C9A84C;
        }
        .mobile-pricing-link {
          font-size: 0.8rem;
          color: #8A9E8F;
          text-decoration: none;
          padding: 6px 12px;
          border: 1px solid #1E3328;
          border-radius: 8px;
        }

        /* ── Form zone ── */
        .login-form-zone {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 24px 40px;
        }
        .login-card {
          width: 100%;
          max-width: 400px;
        }

        .login-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          margin-bottom: 6px;
          color: #EDE8DC;
        }
        .login-hint {
          font-size: 0.85rem;
          color: #8A9E8F;
          margin-bottom: 28px;
          line-height: 1.6;
        }

        /* ── Features strip (mobile) ── */
        .features-strip {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 28px;
          padding: 16px;
          background: #0A1610;
          border: 1px solid #1E3328;
          border-radius: 12px;
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.8rem;
          color: #8A9E8F;
        }
        .feature-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #C9A84C;
          flex-shrink: 0;
        }

        .error-box {
          background: rgba(224,123,84,0.10);
          border: 1px solid rgba(224,123,84,0.30);
          border-radius: 8px;
          padding: 10px 14px;
          color: #E07B54;
          font-size: 0.82rem;
          margin-bottom: 16px;
          line-height: 1.5;
        }

        /* ── Inputs ── */
        .field { margin-bottom: 16px; }
        .field label {
          display: block;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #8A9E8F;
          margin-bottom: 7px;
        }
        .field input {
          width: 100%;
          background: #122019;
          border: 1px solid #1E3328;
          border-radius: 10px;
          padding: 14px 16px;
          color: #EDE8DC;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.15s;
          -webkit-appearance: none;
        }
        .field input:focus { border-color: #C9A84C; }

        /* ── CGU ── */
        .cgu-box {
          background: #0A1610;
          border: 1px solid #1E3328;
          border-radius: 10px;
          padding: 14px 16px;
          margin-bottom: 20px;
          cursor: pointer;
        }
        .cgu-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .cgu-check {
          width: 20px; height: 20px; min-width: 20px;
          border-radius: 5px;
          border: 2px solid #2E4A38;
          background: transparent;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
          color: #0D1B14;
          margin-top: 1px;
          flex-shrink: 0;
        }
        .cgu-check.on { border-color: #C9A84C; background: #C9A84C; }
        .cgu-text {
          font-size: 0.78rem;
          color: #8A9E8F;
          line-height: 1.65;
        }
        .cgu-link { color: #C9A84C; text-decoration: underline; }

        /* ── Submit ── */
        .btn-submit {
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          border: none;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 54px;
        }
        .btn-submit.active {
          background: linear-gradient(135deg, #C9A84C, #A07820);
          color: #0D1B14;
        }
        .btn-submit.inactive {
          background: #1E3328;
          color: #3A5040;
          cursor: not-allowed;
        }

        .form-footer {
          text-align: center;
          font-size: 0.78rem;
          color: #8A9E8F;
          margin-top: 20px;
        }
        .form-footer a { color: #C9A84C; }

        /* ── Success ── */
        .success-box {
          background: rgba(76,175,125,0.08);
          border: 1px solid rgba(76,175,125,0.25);
          border-radius: 14px;
          padding: 32px 24px;
          text-align: center;
        }
        .success-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          color: #4CAF7D;
          margin: 16px 0 10px;
        }
        .success-msg { font-size: 0.85rem; color: #8A9E8F; line-height: 1.65; }
        .debug-link {
          margin-top: 16px; padding: 12px;
          background: #122019; border-radius: 8px;
          font-size: 0.72rem; word-break: break-all; color: #C9A84C;
        }

        /* ── Disclaimer ── */
        .disclaimer {
          margin-top: 24px;
          padding: 12px 16px;
          background: rgba(224,123,84,0.06);
          border: 1px solid rgba(224,123,84,0.15);
          border-radius: 8px;
          font-size: 0.73rem;
          color: #E07B54;
          line-height: 1.55;
          text-align: center;
        }

        /* ── DESKTOP — panneau gauche ── */
        @media (min-width: 768px) {
          .mobile-header { display: none; }

          .login-wrap {
            flex-direction: row;
          }

          /* Panneau déco gauche */
          .login-deco {
            width: 45%;
            max-width: 520px;
            flex-shrink: 0;
            background: linear-gradient(160deg, #122019 0%, #0D1B14 60%);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 60px 52px;
          }
          .deco-grid {
            position: absolute; inset: 0;
            background-image:
              repeating-linear-gradient(0deg, transparent, transparent 39px, #1E3328 40px),
              repeating-linear-gradient(90deg, transparent, transparent 39px, #1E3328 40px);
            opacity: 0.35;
          }
          .deco-circle {
            position: absolute; border-radius: 50%;
            border: 1px solid rgba(201,168,76,0.18);
          }
          .deco-content { position: relative; z-index: 1; }
          .deco-logo {
            font-family: 'Playfair Display', serif;
            font-size: 2.6rem; color: #C9A84C; margin-bottom: 10px;
          }
          .deco-sub {
            font-size: 0.95rem; color: #8A9E8F;
            line-height: 1.65; max-width: 300px; margin-bottom: 44px;
          }
          .deco-features { display: flex; flex-direction: column; gap: 14px; }
          .deco-feat { display: flex; align-items: center; gap: 12px; }
          .deco-icon {
            width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0;
            background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.22);
            display: flex; align-items: center; justify-content: center; color: #C9A84C;
          }
          .deco-feat-text { font-size: 0.875rem; color: #C4C9BE; }
          .deco-disclaimer {
            margin-top: 32px; padding: 12px 16px;
            background: rgba(224,123,84,0.07); border: 1px solid rgba(224,123,84,0.2);
            border-radius: 8px; font-size: 0.74rem; color: #E07B54; line-height: 1.55;
          }

          /* Cacher le strip features sur desktop */
          .features-strip { display: none; }
          .disclaimer { display: none; }

          /* Zone form desktop */
          .login-form-zone {
            flex: 1;
            padding: 48px 48px;
          }
        }

        @media (max-width: 767px) {
          .login-deco { display: none; }
          .login-form-zone { padding: 24px 20px 40px; }
          .login-title { font-size: 1.6rem; }
        }
      `}</style>

      <div className="login-wrap">

        {/* ── Panneau gauche (desktop uniquement) ── */}
        <div className="login-deco">
          <div className="deco-grid" />
          <div className="deco-circle" style={{ width:300, height:300, top:-80, right:-80 }} />
          <div className="deco-circle" style={{ width:180, height:180, bottom:40, left:-50 }} />
          <div className="deco-content">
            <div className="deco-logo">SenCompta IA</div>
            <p className="deco-sub">
              La comptabilité intelligente pour les commerçants sénégalais. Saisie WhatsApp, analyse IA.
            </p>
            <div className="deco-features">
              {FEATURES.map((f, i) => (
                <div key={i} className="deco-feat">
                  <div className="deco-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span className="deco-feat-text">{f.text}</span>
                </div>
              ))}
            </div>
            <div className="deco-disclaimer">
              SenCompta IA est un assistant automatisé. Ses analyses ne remplacent pas un expert-comptable agréé.
            </div>
          </div>
        </div>

        {/* ── Mobile header ── */}
        <div className="mobile-header">
          <div className="mobile-logo">SenCompta IA</div>
          <a href="/pricing" className="mobile-pricing-link">Voir les offres</a>
        </div>

        {/* ── Zone formulaire ── */}
        <div className="login-form-zone">
          <div className="login-card">
            {!sent ? (
              <>
                <h1 className="login-title">Connexion</h1>
                <p className="login-hint">
                  Entrez votre numéro WhatsApp pour recevoir votre lien de connexion.
                </p>

                {/* Features strip — mobile uniquement */}
                <div className="features-strip">
                  {FEATURES.map((f, i) => (
                    <div key={i} className="feature-item">
                      <div className="feature-dot" />
                      <span>{f.text}</span>
                    </div>
                  ))}
                </div>

                {errorKey && (
                  <div className="error-box">
                    {ERROR_MESSAGES[errorKey] || 'Erreur de connexion.'}
                  </div>
                )}
                {serverError && (
                  <div className="error-box">{serverError}</div>
                )}

                <div className="field">
                  <label>Numéro WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+221 77 000 00 00"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>

                <div className="field">
                  <label>Nom de votre boutique (optionnel)</label>
                  <input
                    type="text"
                    value={boutique}
                    onChange={e => setBoutique(e.target.value)}
                    placeholder="Ex : Boutique Aminata"
                    autoComplete="organization"
                  />
                </div>

                <div className="cgu-box" onClick={() => setAccepted(!accepted)}>
                  <div className="cgu-row">
                    <div className={`cgu-check ${accepted ? 'on' : ''}`}>
                      {accepted && <IconCheck />}
                    </div>
                    <span className="cgu-text">
                      J'accepte les{' '}
                      <a href="/mentions-legales" target="_blank" className="cgu-link"
                        onClick={e => e.stopPropagation()}>
                        mentions légales
                      </a>{' '}et la{' '}
                      <a href="/confidentialite" target="_blank" className="cgu-link"
                        onClick={e => e.stopPropagation()}>
                        politique de confidentialité
                      </a>.
                      Je comprends que SenCompta IA est un <strong style={{ color:'#EDE8DC' }}>assistant automatisé</strong>.
                    </span>
                  </div>
                </div>

                <button
                  className={`btn-submit ${accepted ? 'active' : 'inactive'}`}
                  onClick={handleSubmit}
                  disabled={loading || !accepted}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                  {loading ? 'Envoi en cours…' : 'Recevoir mon lien de connexion'}
                </button>

                <p className="form-footer">
                  Pas d'abonnement ?{' '}
                  <a href="/pricing">Découvrir nos offres →</a>
                </p>

                {/* Disclaimer mobile uniquement */}
                <div className="disclaimer">
                  Assistant automatisé — ne remplace pas un expert-comptable agréé.
                </div>
              </>
            ) : (
              <div className="success-box">
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#4CAF7D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin:'0 auto', display:'block' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <div className="success-title">Lien envoyé !</div>
                <p className="success-msg">
                  Un lien a été envoyé sur WhatsApp au numéro{' '}
                  <strong style={{ color:'#EDE8DC' }}>{phone}</strong>.<br /><br />
                  Cliquez dessus pour accéder à votre dashboard.
                  Valide pendant <strong style={{ color:'#EDE8DC' }}>15 minutes</strong>.
                </p>
                {debugLink && (
                  <div className="debug-link">
                    <strong>DEV — </strong>
                    <a href={debugLink} style={{ color:'#C9A84C' }}>Cliquer ici</a>
                    <br />{debugLink}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ background:'#0D1B14', minHeight:'100vh' }} />}>
      <LoginContent />
    </Suspense>
  );
}
