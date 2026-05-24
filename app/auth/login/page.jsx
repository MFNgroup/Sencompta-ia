'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const ERROR_MESSAGES = {
  missing_token: 'Lien de connexion invalide ou manquant.',
  invalid_token:  'Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau.',
};

const FEATURES = [
  { text: 'Saisie WhatsApp en français & wolof', icon: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' },
  { text: 'Dashboard & graphiques temps réel',   icon: 'M18 20V10M12 20V4M6 20v-6' },
  { text: 'Factures conformes DGI 2026',          icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
  { text: 'Connexion sans mot de passe',          icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
];

function LoginContent() {
  const searchParams = useSearchParams();
  const errorKey     = searchParams.get('error');
  const [phone, setPhone]         = useState('+221');
  const [boutique, setBoutique]   = useState('');
  const [accepted, setAccepted]   = useState(false);
  const [sent, setSent]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const [serverError, setServerError] = useState('');
  const [debugLink, setDebugLink] = useState('');
  const wrapRef  = useRef(null);
  const decoRef  = useRef(null);
  const orbA     = useRef(null);
  const orbB     = useRef(null);

  useEffect(() => {
    let ctx;
    (async () => {
      const { gsap } = await import('gsap');
      ctx = gsap.context(() => {
        // Entrance
        const tl = gsap.timeline({ defaults: { ease:'power3.out' } });
        tl.from('.deco-logo-anim', { y: -20, opacity:0, duration:0.7 })
          .from('.deco-feat-anim', { x:-20, opacity:0, duration:0.5, stagger:0.1 }, '-=0.3')
          .from('.form-card',      { y: 40, opacity:0, duration:0.7 }, '-=0.5');

        // Orb float
        gsap.to(orbA.current, { y:-20, x:10, duration:5, repeat:-1, yoyo:true, ease:'sine.inOut' });
        gsap.to(orbB.current, { y:16, x:-14, duration:7, repeat:-1, yoyo:true, ease:'sine.inOut', delay:1.5 });

        // Mouse parallax
        const deco = decoRef.current;
        if (deco) {
          deco.addEventListener('mousemove', (e) => {
            const r = deco.getBoundingClientRect();
            const dx = (e.clientX - r.left - r.width/2) / r.width;
            const dy = (e.clientY - r.top - r.height/2) / r.height;
            gsap.to(orbA.current, { x:dx*25, y:dy*18, duration:1.2, ease:'power2.out' });
            gsap.to(orbB.current, { x:dx*-15, y:dy*-10, duration:1.8, ease:'power2.out' });
          });
        }
      });
    })();
    return () => ctx?.revert();
  }, []);

  const handleSubmit = async () => {
    if (!/^\+221[0-9]{9}$/.test(phone)) { setServerError('Format invalide. Ex : +221771234567'); return; }
    if (!accepted) { setServerError("Acceptez les conditions d'utilisation pour continuer."); return; }
    setLoading(true); setServerError('');
    try {
      const res  = await fetch('/api/auth/magic-link', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ phone, boutique_name: boutique || 'Ma Boutique' }) });
      const data = await res.json();
      if (data.error) { setServerError(data.error); }
      else { setSent(true); if (data.debug_link) setDebugLink(data.debug_link); }
    } catch { setServerError('Erreur réseau. Veuillez réessayer.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');
        :root { --bg:#07100A; --s1:#0B1710; --brd:#182A1C; --gold:#C9A84C; --green:#1D9E75; --green2:#3ED98A; --txt:#EDE5CC; --txt2:#7A9A82; --txt3:#3A5040; }
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { background:var(--bg); color:var(--txt); font-family:'Outfit',sans-serif; -webkit-font-smoothing:antialiased; }
        input { color-scheme:dark; font-family:inherit; }
        button { font-family:inherit; -webkit-tap-highlight-color:transparent; touch-action:manipulation; }

        .login-wrap { min-height:100vh; min-height:100dvh; display:flex; }

        /* DECO PANEL */
        .login-deco { width:45%; max-width:520px; flex-shrink:0; background:linear-gradient(160deg,#0F1E13 0%,#07100A 60%); position:relative; overflow:hidden; display:flex; flex-direction:column; justify-content:center; padding:60px 52px; }
        .deco-grid { position:absolute; inset:0; background-image: repeating-linear-gradient(0deg,transparent,transparent 47px,var(--brd) 48px), repeating-linear-gradient(90deg,transparent,transparent 47px,var(--brd) 48px); opacity:0.25; pointer-events:none; }
        .deco-orb { position:absolute; border-radius:50%; pointer-events:none; filter:blur(50px); will-change:transform; }
        .deco-content { position:relative; z-index:1; }
        .deco-logo { font-family:'Cormorant Garamond',serif; font-size:2.6rem; font-weight:600; color:var(--gold); margin-bottom:8px; line-height:1; }
        .deco-tagline { font-size:0.88rem; color:var(--txt2); font-weight:300; line-height:1.6; max-width:280px; margin-bottom:44px; }
        .deco-feats { display:flex; flex-direction:column; gap:16px; }
        .deco-feat { display:flex; align-items:center; gap:14px; }
        .deco-feat-ico { width:38px; height:38px; background:rgba(29,158,117,0.1); border:1px solid rgba(29,158,117,0.22); border-radius:10px; display:flex; align-items:center; justify-content:center; color:var(--green2); flex-shrink:0; }
        .deco-feat-txt { font-size:0.875rem; color:#C4C9BE; font-weight:300; }
        .deco-disclaimer { margin-top:36px; padding:12px 16px; background:rgba(240,101,67,0.07); border:1px solid rgba(240,101,67,0.18); border-radius:8px; font-size:0.73rem; color:#E07B54; line-height:1.55; }
        .deco-free-tag { margin-top:20px; display:inline-flex; align-items:center; gap:8px; font-size:0.75rem; color:var(--green2); background:rgba(62,217,138,0.08); border:1px solid rgba(62,217,138,0.2); padding:5px 14px; border-radius:20px; }

        /* FORM ZONE */
        .login-form-zone { flex:1; display:flex; align-items:center; justify-content:center; padding:40px 48px; background:var(--bg); }
        .form-card { width:100%; max-width:400px; }

        /* MOBILE HEADER */
        .mobile-top { display:none; align-items:center; justify-content:space-between; padding:18px 20px; }
        .mobile-logo { font-family:'Cormorant Garamond',serif; font-size:1.6rem; color:var(--gold); }
        .mobile-offers { font-size:0.8rem; color:var(--txt2); text-decoration:none; padding:6px 12px; border:1px solid var(--brd); border-radius:8px; }

        .login-title { font-family:'Cormorant Garamond',serif; font-size:2rem; font-weight:600; margin-bottom:6px; color:var(--txt); }
        .login-hint  { font-size:0.85rem; color:var(--txt2); margin-bottom:28px; line-height:1.6; font-weight:300; }

        /* MOBILE features strip */
        .mobile-feats { display:none; flex-direction:column; gap:8px; margin-bottom:24px; padding:14px 16px; background:var(--s1); border:1px solid var(--brd); border-radius:12px; }
        .mobile-feat  { display:flex; align-items:center; gap:8px; font-size:0.8rem; color:var(--txt2); }
        .mf-dot       { width:5px; height:5px; border-radius:50%; background:var(--gold); flex-shrink:0; }

        .error-box { background:rgba(240,101,67,0.1); border:1px solid rgba(240,101,67,0.28); border-radius:8px; padding:10px 14px; color:#F06543; font-size:0.82rem; margin-bottom:16px; line-height:1.5; }
        .field { margin-bottom:16px; }
        .field label { display:block; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--txt2); margin-bottom:6px; }
        .field input { width:100%; background:#0F1E13; border:1px solid var(--brd); border-radius:10px; padding:13px 16px; color:var(--txt); font-size:1rem; outline:none; transition:border-color 0.15s; -webkit-appearance:none; }
        .field input:focus { border-color:var(--gold); }

        .cgu-box { background:#0A1610; border:1px solid var(--brd); border-radius:10px; padding:14px 16px; margin-bottom:20px; cursor:pointer; }
        .cgu-row { display:flex; align-items:flex-start; gap:12px; }
        .cgu-check { width:20px; height:20px; min-width:20px; border-radius:5px; border:2px solid #2E4A38; background:transparent; display:flex; align-items:center; justify-content:center; transition:all 0.15s; color:#0D1B14; margin-top:1px; flex-shrink:0; }
        .cgu-check.on { border-color:var(--gold); background:var(--gold); }
        .cgu-text { font-size:0.78rem; color:var(--txt2); line-height:1.65; font-weight:300; }
        .cgu-link { color:var(--gold); text-decoration:underline; }

        .btn-submit { width:100%; padding:15px; border-radius:12px; border:none; font-size:0.95rem; font-weight:700; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:10px; min-height:52px; }
        .btn-submit.active { background:linear-gradient(135deg,var(--gold),#A07820); color:#0D1B14; }
        .btn-submit.active:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(201,168,76,0.25); }
        .btn-submit.inactive { background:#1E3328; color:#3A5040; cursor:not-allowed; }

        .form-footer { text-align:center; font-size:0.78rem; color:var(--txt2); margin-top:18px; }
        .form-footer a { color:var(--gold); text-decoration:none; }

        .success-box { background:rgba(29,158,117,0.07); border:1px solid rgba(29,158,117,0.25); border-radius:16px; padding:32px 24px; text-align:center; }
        .success-title { font-family:'Cormorant Garamond',serif; font-size:1.5rem; color:var(--green2); margin:16px 0 10px; }
        .success-msg { font-size:0.85rem; color:var(--txt2); line-height:1.65; font-weight:300; }
        .debug-link { margin-top:14px; padding:10px 12px; background:#0F1E13; border-radius:8px; font-size:0.72rem; word-break:break-all; color:var(--gold); }

        @media (max-width:767px) {
          .login-deco { display:none; }
          .mobile-top { display:flex; }
          .mobile-feats { display:flex; }
          .login-form-zone { padding:20px 20px 40px; align-items:flex-start; }
          .login-title { font-size:1.7rem; }
        }
      `}</style>

      <div className="login-wrap" ref={wrapRef}>

        {/* DECO PANEL */}
        <div className="login-deco" ref={decoRef}>
          <div className="deco-grid" />
          <div ref={orbA} className="deco-orb" style={{ width:320, height:320, top:'-60px', right:'-80px', background:'rgba(29,158,117,0.12)' }} />
          <div ref={orbB} className="deco-orb" style={{ width:220, height:220, bottom:'30px', left:'-60px', background:'rgba(201,168,76,0.08)' }} />

          <div className="deco-content">
            <div className="deco-logo deco-logo-anim">SenCompta IA</div>
            <p className="deco-tagline deco-logo-anim">La comptabilité intelligente pour les commerçants sénégalais.</p>
            <div className="deco-feats">
              {FEATURES.map((f, i) => (
                <div key={i} className="deco-feat deco-feat-anim">
                  <div className="deco-feat-ico">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={f.icon}/></svg>
                  </div>
                  <span className="deco-feat-txt">{f.text}</span>
                </div>
              ))}
            </div>
            <div className="deco-free-tag deco-feat-anim">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Gratuit pour commencer — 20 transactions/mois
            </div>
            <div className="deco-disclaimer deco-feat-anim">
              SenCompta IA est un assistant automatisé. Ses analyses ne remplacent pas un expert-comptable agréé.
            </div>
          </div>
        </div>

        {/* MOBILE TOP */}
        <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
          <div className="mobile-top">
            <div className="mobile-logo">SenCompta IA</div>
            <a href="/pricing" className="mobile-offers">Voir les offres</a>
          </div>

          <div className="login-form-zone">
            <div className="form-card">
              {!sent ? (
                <>
                  <h1 className="login-title">Connexion</h1>
                  <p className="login-hint">Entrez votre numéro WhatsApp pour recevoir votre lien de connexion sécurisé.</p>

                  <div className="mobile-feats">
                    {FEATURES.map((f, i) => (
                      <div key={i} className="mobile-feat">
                        <div className="mf-dot" />
                        <span>{f.text}</span>
                      </div>
                    ))}
                  </div>

                  {errorKey && <div className="error-box">{ERROR_MESSAGES[errorKey] || 'Erreur de connexion.'}</div>}
                  {serverError && <div className="error-box">{serverError}</div>}

                  <div className="field">
                    <label>Numéro WhatsApp</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+221 77 000 00 00" inputMode="tel" autoComplete="tel" />
                  </div>
                  <div className="field">
                    <label>Nom de votre boutique (optionnel)</label>
                    <input type="text" value={boutique} onChange={e => setBoutique(e.target.value)} placeholder="Ex : Boutique Aminata" autoComplete="organization" />
                  </div>

                  <div className="cgu-box" onClick={() => setAccepted(!accepted)}>
                    <div className="cgu-row">
                      <div className={`cgu-check ${accepted ? 'on' : ''}`}>
                        {accepted && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <span className="cgu-text">
                        J'accepte les{' '}
                        <a href="/mentions-legales" target="_blank" className="cgu-link" onClick={e => e.stopPropagation()}>mentions légales</a>{' '}et la{' '}
                        <a href="/confidentialite"  target="_blank" className="cgu-link" onClick={e => e.stopPropagation()}>politique de confidentialité</a>.
                        Je comprends que SenCompta IA est un <strong style={{color:'var(--txt)'}}>assistant automatisé</strong>.
                      </span>
                    </div>
                  </div>

                  <button className={`btn-submit ${accepted ? 'active' : 'inactive'}`} onClick={handleSubmit} disabled={loading || !accepted}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    {loading ? 'Envoi en cours…' : 'Recevoir mon lien de connexion'}
                  </button>

                  <p className="form-footer">Pas encore inscrit ?{' '}<a href="/pricing">Découvrir les offres →</a></p>
                </>
              ) : (
                <div className="success-box">
                  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#3ED98A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{margin:'0 auto',display:'block'}}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <div className="success-title">Lien envoyé !</div>
                  <p className="success-msg">
                    Un lien a été envoyé sur WhatsApp au numéro{' '}
                    <strong style={{color:'var(--txt)'}}>{phone}</strong>.<br /><br />
                    Cliquez dessus pour accéder à votre dashboard. Valide <strong style={{color:'var(--txt)'}}>15 minutes</strong>.
                  </p>
                  {debugLink && (
                    <div className="debug-link">
                      <strong>DEV — </strong><a href={debugLink} style={{color:'var(--gold)'}}>Cliquer ici</a><br />{debugLink}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{background:'#07100A',minHeight:'100vh'}} />}>
      <LoginContent />
    </Suspense>
  );
}
