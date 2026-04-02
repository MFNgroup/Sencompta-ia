'use client';

import { useState, useEffect } from 'react';

const fcfa = (n) => new Intl.NumberFormat('fr-SN').format(Math.abs(n)) + ' FCFA';

export const metadata = { title: 'Conseils IA — SenCompta' };

export default function AdvicePage() {
  const [advice, setAdvice]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser]       = useState(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch('/api/user/me').then(r => r.json()).then(d => { if (!d.error) setUser(d); });
  }, []);

  const isPremium = user?.plan === 'PREMIUM';

  const fetchAdvice = async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/ai-advice');
      const json = await res.json();
      if (json.error) { setError(json.error); }
      else            { setAdvice(json); }
    } catch { setError('Erreur réseau. Veuillez réessayer.'); }
    finally  { setLoading(false); }
  };

  const impactColor = { 'ÉLEVÉ': '#C9A84C', 'MOYEN': '#4CAF7D', 'FAIBLE': '#8A9E8F' };

  return (
    <>
      <style>{`
        .advice-topbar {
          padding: 18px 28px; border-bottom: 1px solid #1E3328;
          background: rgba(13,27,20,0.97); backdrop-filter: blur(10px);
          position: sticky; top: 0; z-index: 10;
        }
        .advice-title { font-family: 'Playfair Display', serif; font-size: 1.2rem; }
        .advice-content { padding: 24px 28px; max-width: 800px; }
        .advice-badge {
          font-size: 0.62rem; text-transform: uppercase; letter-spacing: 1.5px;
          color: #C9A84C; background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.3);
          padding: 3px 10px; border-radius: 20px;
          display: inline-block; margin-bottom: 16px;
        }
        .conseil-card {
          background: #122019; border: 1px solid #1E3328;
          border-radius: 12px; padding: 20px; margin-bottom: 12px;
          display: flex; gap: 16px; align-items: flex-start;
        }
        .conseil-icon-wrap {
          width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;
          background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.2);
          display: flex; align-items: center; justify-content: center;
          color: #C9A84C;
        }
        .conseil-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px; }
        .conseil-head strong { font-size: 0.95rem; }
        .impact-badge { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; padding: 2px 7px; border-radius: 4px; background: rgba(0,0,0,0.2); }
        .conseil-desc { font-size: 0.82rem; color: #8A9E8F; line-height: 1.6; }
        .health-wrap { background: #122019; border: 1px solid #1E3328; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
        .health-label { font-size: 0.78rem; color: #8A9E8F; margin-bottom: 10px; }
        .health-bar { height: 8px; background: #1E3328; border-radius: 4px; overflow: hidden; margin-bottom: 6px; }
        .health-fill { height: 100%; background: linear-gradient(90deg, #C9A84C, #E8C97D); border-radius: 4px; transition: width 1s ease; }
        .health-score-num { font-family: 'DM Mono', monospace; font-size: 1.4rem; color: #C9A84C; }
        .resume-box { background: rgba(201,168,76,0.06); border: 1px solid rgba(201,168,76,0.2); border-radius: 10px; padding: 16px; margin-bottom: 20px; font-size: 0.88rem; color: #C4C9BE; line-height: 1.65; }
        .spinner { width: 36px; height: 36px; border: 2px solid #1E3328; border-top-color: #C9A84C; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .advice-topbar { padding: 12px 16px; }
          .advice-content { padding: 16px; }
          .conseil-card { flex-direction: column; gap: 12px; }
        }
      `}</style>

      <div className="advice-topbar">
        <h1 className="advice-title">Conseils IA</h1>
      </div>

      <div className="advice-content">
        <div className="advice-badge">IA Premium — Gemini</div>

        {!isPremium ? (
          <div style={{ background: '#122019', border: '1px solid #1E3328', borderRadius: 12, padding: 28, textAlign: 'center' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', display: 'block' }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', marginBottom: 8 }}>
              Fonctionnalité Premium
            </div>
            <p style={{ fontSize: '0.85rem', color: '#8A9E8F', marginBottom: 20, lineHeight: 1.6 }}>
              Les conseils stratégiques IA sont disponibles avec le plan Premium à 15 000 FCFA/mois.
            </p>
            <a href="/pricing" style={{
              display: 'inline-block', background: 'linear-gradient(135deg, #C9A84C, #A07820)',
              color: '#0D1B14', borderRadius: 8, padding: '10px 24px',
              fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none',
            }}>
              Passer au Premium
            </a>
          </div>
        ) : !advice && !loading ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.88rem', color: '#8A9E8F', marginBottom: 24, lineHeight: 1.65 }}>
              Gemini va analyser vos transactions des 30 derniers jours et générer 3 conseils stratégiques personnalisés pour améliorer la santé financière de votre boutique.
            </p>
            {error && (
              <div style={{ background: 'rgba(224,123,84,0.1)', border: '1px solid rgba(224,123,84,0.3)', borderRadius: 8, padding: '10px 16px', color: '#E07B54', fontSize: '0.83rem', marginBottom: 16 }}>
                {error}
              </div>
            )}
            <button onClick={fetchAdvice} style={{
              background: 'linear-gradient(135deg, #C9A84C, #A07820)',
              color: '#0D1B14', border: 'none', borderRadius: 10,
              padding: '14px 32px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 10,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Analyser mes finances
            </button>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: '#8A9E8F' }}>
            <div className="spinner" />
            <p style={{ fontSize: '0.85rem' }}>Gemini analyse vos transactions…</p>
          </div>
        ) : advice ? (
          <>
            {advice.score_sante && (
              <div className="health-wrap">
                <div className="health-label">Score de santé financière</div>
                <div className="health-bar">
                  <div className="health-fill" style={{ width: `${advice.score_sante}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#8A9E8F' }}>
                    {advice.score_sante >= 70 ? 'Bonne santé financière' : advice.score_sante >= 40 ? 'Finances à surveiller' : 'Attention requise'}
                  </span>
                  <span className="health-score-num">{advice.score_sante}/100</span>
                </div>
              </div>
            )}

            {advice.resume && (
              <div className="resume-box">{advice.resume}</div>
            )}

            {advice.conseils?.map((c, i) => (
              <div key={i} className="conseil-card">
                <div className="conseil-icon-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="conseil-head">
                    <strong>{c.titre}</strong>
                    <span className="impact-badge" style={{ color: impactColor[c.impact] || '#8A9E8F' }}>
                      {c.impact}
                    </span>
                  </div>
                  <p className="conseil-desc">{c.description}</p>
                  {c.action && (
                    <p style={{ fontSize: '0.78rem', color: '#C9A84C', marginTop: 8, fontWeight: 600 }}>
                      Action : {c.action}
                    </p>
                  )}
                </div>
              </div>
            ))}

            <button onClick={fetchAdvice} style={{
              marginTop: 8, background: 'transparent',
              color: '#C9A84C', border: '1px solid rgba(201,168,76,0.35)',
              borderRadius: 8, padding: '8px 18px', fontSize: '0.82rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Actualiser l'analyse
            </button>
          </>
        ) : null}

        <p style={{ fontSize: '0.72rem', color: '#4A5E50', marginTop: 24, lineHeight: 1.6 }}>
          Les conseils générés par SenCompta IA sont fournis à titre informatif uniquement et ne constituent pas un conseil financier professionnel. Consultez un expert-comptable agréé pour les décisions importantes.
        </p>
      </div>
    </>
  );
}
