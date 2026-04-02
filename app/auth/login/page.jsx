'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const ERROR_MESSAGES = {
  missing_token: 'Lien de connexion invalide ou manquant.',
  invalid_token: 'Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau.',
};

const IconWhatsapp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

const IconBot = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>
  </svg>
);

const IconChart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconWarning = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const FEATURES = [
  { icon: <IconWhatsapp />, text: 'Saisie instantanée via WhatsApp en français et wolof' },
  { icon: <IconBot />,      text: 'Analyse IA par Gemini pour des conseils personnalisés' },
  { icon: <IconChart />,    text: 'Dashboard premium avec graphiques en temps réel' },
  { icon: <IconLock />,     text: 'Connexion sans mot de passe — lien unique sécurisé' },
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
      setServerError("Vous devez accepter les conditions d'utilisation pour continuer.");
      return;
    }
    setLoading(true);
    setServerError('');
    try {
      const res  = await fetch('/api/auth/magic-link', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone, boutique_name: boutique || 'Ma Boutique' }),
      });
      const data = await res.json();
      if (data.error)      { setServerError(data.error); }
      else                 { setSent(true); if (data.debug_link) setDebugLink(data.debug_link); }
    } catch               { setServerError('Erreur réseau. Veuillez réessayer.'); }
    finally               { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'grid',
      gridTemplateColumns: 'clamp(320px,45%,520px) 1fr',
    }}>

      {/* ── Panneau gauche ─────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(160deg,#122019 0%,#0D1B14 60%)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 52px',
      }}>
        {/* Grille déco */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,#1E3328 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,#1E3328 40px)',
          opacity: 0.35,
        }} />
        {/* Cercles */}
        {[{w:300,h:300,t:-80,r:-80},{w:180,h:180,b:40,l:-50}].map((c,i)=>(
          <div key={i} style={{
            position:'absolute', borderRadius:'50%',
            border:'1px solid rgba(201,168,76,0.18)',
            width:c.w, height:c.h,
            top:c.t, right:c.r, bottom:c.b, left:c.l,
          }}/>
        ))}

        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'2.6rem', color:'#C9A84C', marginBottom:10 }}>
            SenCompta IA
          </div>
          <p style={{ fontSize:'0.95rem', color:'#8A9E8F', lineHeight:1.65, maxWidth:300, marginBottom:44 }}>
            La comptabilité intelligente pour les commerçants sénégalais. Saisie WhatsApp, analyse IA.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {FEATURES.map((f,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{
                  width:36, height:36, borderRadius:8, flexShrink:0,
                  background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.22)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:'#C9A84C',
                }}>
                  {f.icon}
                </div>
                <span style={{ fontSize:'0.875rem', color:'#C4C9BE' }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Disclaimer IA */}
          <div style={{
            marginTop:32, padding:'12px 16px',
            background:'rgba(224,123,84,0.07)', border:'1px solid rgba(224,123,84,0.2)',
            borderRadius:8, display:'flex', gap:8, alignItems:'flex-start',
          }}>
            <span style={{ color:'#E07B54', marginTop:1, flexShrink:0 }}><IconWarning /></span>
            <p style={{ fontSize:'0.74rem', color:'#E07B54', lineHeight:1.55, margin:0 }}>
              SenCompta IA est un assistant automatisé. Ses analyses ne remplacent pas un expert-comptable agréé.
            </p>
          </div>
        </div>
      </div>

      {/* ── Panneau droit — formulaire ──────────────────── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'48px 40px', background:'#0D1B14',
      }}>
        <div style={{ width:'100%', maxWidth:400 }}>
          {!sent ? (
            <>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.85rem', marginBottom:6, color:'#EDE8DC' }}>
                Connexion
              </h1>
              <p style={{ fontSize:'0.85rem', color:'#8A9E8F', marginBottom:28, lineHeight:1.6 }}>
                Entrez votre numéro WhatsApp pour recevoir votre lien de connexion automatique.
              </p>

              {errorKey && (
                <div style={{ background:'rgba(224,123,84,0.12)', border:'1px solid rgba(224,123,84,0.35)', borderRadius:8, padding:'10px 14px', color:'#E07B54', fontSize:'0.83rem', marginBottom:16 }}>
                  {ERROR_MESSAGES[errorKey] || 'Erreur de connexion.'}
                </div>
              )}
              {serverError && (
                <div style={{ background:'rgba(224,123,84,0.12)', border:'1px solid rgba(224,123,84,0.35)', borderRadius:8, padding:'10px 14px', color:'#E07B54', fontSize:'0.83rem', marginBottom:16 }}>
                  {serverError}
                </div>
              )}

              {/* Numéro */}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'1px', color:'#8A9E8F', marginBottom:6 }}>
                  Numéro WhatsApp
                </label>
                <input
                  type="tel" value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+221 77 000 00 00"
                  style={{ width:'100%', background:'#122019', border:'1px solid #1E3328', borderRadius:10, padding:'12px 16px', color:'#EDE8DC', fontSize:'0.95rem', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}
                />
              </div>

              {/* Boutique */}
              <div style={{ marginBottom:20 }}>
                <label style={{ display:'block', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'1px', color:'#8A9E8F', marginBottom:6 }}>
                  Nom de votre boutique (optionnel)
                </label>
                <input
                  type="text" value={boutique}
                  onChange={e => setBoutique(e.target.value)}
                  placeholder="Ex : Boutique Aminata"
                  style={{ width:'100%', background:'#122019', border:'1px solid #1E3328', borderRadius:10, padding:'12px 16px', color:'#EDE8DC', fontSize:'0.95rem', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}
                />
              </div>

              {/* ── CGU Checkbox ────────────────────────── */}
              <div style={{
                background:'#0A1610', border:'1px solid #1E3328',
                borderRadius:10, padding:'14px 16px', marginBottom:20,
              }}>
                <label style={{ display:'flex', alignItems:'flex-start', gap:12, cursor:'pointer' }}>
                  {/* Checkbox custom */}
                  <div
                    onClick={() => setAccepted(!accepted)}
                    style={{
                      width:20, height:20, minWidth:20, borderRadius:5, marginTop:2,
                      border: accepted ? '2px solid #C9A84C' : '2px solid #2E4A38',
                      background: accepted ? '#C9A84C' : 'transparent',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      cursor:'pointer', transition:'all 0.15s', flexShrink:0,
                      color:'#0D1B14',
                    }}
                  >
                    {accepted && <IconCheck />}
                  </div>
                  <span style={{ fontSize:'0.8rem', color:'#9AADA0', lineHeight:1.65 }}>
                    J'ai lu et j'accepte les{' '}
                    <a href="/mentions-legales" target="_blank" style={{ color:'#C9A84C', textDecoration:'underline' }}>mentions légales</a>
                    {' '}et la{' '}
                    <a href="/confidentialite" target="_blank" style={{ color:'#C9A84C', textDecoration:'underline' }}>politique de confidentialité</a>.
                    Je comprends que SenCompta IA est un <strong style={{ color:'#EDE8DC' }}>assistant automatisé</strong> et ne remplace pas un expert-comptable agréé.
                  </span>
                </label>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !accepted}
                style={{
                  width:'100%', padding:'14px',
                  background: accepted ? 'linear-gradient(135deg,#C9A84C,#A07820)' : '#1E3328',
                  color: accepted ? '#0D1B14' : '#3A5040',
                  border:'none', borderRadius:10, fontSize:'1rem', fontWeight:700,
                  cursor: accepted ? 'pointer' : 'not-allowed',
                  fontFamily:'inherit', transition:'all 0.2s',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                {loading ? 'Envoi en cours…' : 'Recevoir mon lien de connexion'}
              </button>

              <p style={{ textAlign:'center', fontSize:'0.78rem', color:'#8A9E8F', marginTop:20 }}>
                Pas d'abonnement ?{' '}
                <a href="/pricing" style={{ color:'#C9A84C', textDecoration:'none' }}>Découvrir nos offres →</a>
              </p>
            </>
          ) : (
            <div style={{ background:'rgba(76,175,125,0.08)', border:'1px solid rgba(76,175,125,0.28)', borderRadius:14, padding:28, textAlign:'center' }}>
              <div style={{ marginBottom:14 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4CAF7D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin:'0 auto' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', color:'#4CAF7D', marginBottom:10 }}>
                Lien envoyé !
              </div>
              <p style={{ fontSize:'0.85rem', color:'#8A9E8F', lineHeight:1.65 }}>
                Un lien de connexion a été envoyé sur WhatsApp au numéro{' '}
                <strong style={{ color:'#EDE8DC' }}>{phone}</strong>.<br /><br />
                Cliquez sur le lien pour accéder à votre tableau de bord. Il est valide pendant{' '}
                <strong style={{ color:'#EDE8DC' }}>15 minutes</strong>.
              </p>
              {debugLink && (
                <div style={{ marginTop:16, padding:10, background:'#122019', borderRadius:8, fontSize:'0.72rem', wordBreak:'break-all', color:'#C9A84C' }}>
                  <strong>DEV ONLY — </strong>
                  <a href={debugLink} style={{ color:'#C9A84C' }}>Cliquer ici</a>
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
        html, body { background: #0D1B14; color: #EDE8DC; font-family: 'IBM Plex Sans', sans-serif; }
        input { color-scheme: dark; }
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <Suspense fallback={<div style={{ background:'#0D1B14', minHeight:'100vh' }} />}>
        <LoginContent />
      </Suspense>
    </>
  );
}
