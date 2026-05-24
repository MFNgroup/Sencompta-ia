'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const PLANS = [
  {
    id: 'FREE', label: 'Gratuit', price: 0, color: '#3A5040', subtle: true,
    tagline: 'Pour découvrir sans engagement',
    features: ['Bot WhatsApp (20 tx/mois)', 'Balance quotidienne simple', 'Accès 7 jours gratuits'],
    cta: 'Commencer gratuitement', href: '/auth/login',
  },
  {
    id: 'STANDARD', label: 'Standard', price: 10000, color: '#3ED98A',
    tagline: 'Pour piloter votre boutique au quotidien',
    features: [
      'Bot WhatsApp illimité (FR & Wolof)',
      'Dashboard complet en temps réel',
      'Factures conformes DGI / TVA 18%',
      'Suivi créances & relances',
      'Conseils IA personnalisés',
      'Export PDF bilans & factures',
      'Historique illimité',
    ],
    cta: 'Choisir Standard',
  },
  {
    id: 'PREMIUM', label: 'Premium', price: 20000, color: '#C9A84C', popular: true,
    tagline: 'Pour scaler votre activité comme un pro',
    features: [
      'Tout Standard, plus :',
      'Multi-boutique (jusqu\'à 3)',
      'Intégration Wave / Orange Money',
      'Scoring crédit exportable',
      'Rapport SYSCOHADA complet',
      'Support prioritaire WhatsApp',
      'API partenaires comptables',
    ],
    cta: 'Choisir Premium',
  },
];

const FAQ = [
  { q: 'Comment fonctionne la saisie WhatsApp ?', a: 'Enregistrez notre numéro et envoyez vos opérations en texte ou vocal. "Vendu tissus 25 000", "jënd légumes 8 500" — l\'IA comprend et classe automatiquement.' },
  { q: 'Mes données restent-elles après expiration ?', a: 'Oui. Toutes vos transactions et votre historique restent intacts, peu importe votre statut d\'abonnement.' },
  { q: 'Les factures sont-elles vraiment conformes DGI ?', a: 'Oui. SenCompta génère des factures avec NINEA, TVA 18%, numérotation séquentielle — conformes à la loi n°2025-02 du 28 déc. 2024.' },
  { q: 'Y a-t-il un engagement ?', a: 'Aucun. Abonnement mensuel résiliable à tout moment. Vos données restent disponibles.' },
  { q: 'Quels moyens de paiement sont acceptés ?', a: 'Wave, Orange Money, Free Money — via PayTech.sn, la passerelle de paiement sénégalaise de référence.' },
];

function PricingContent() {
  const searchParams  = useSearchParams();
  const paymentStatus = searchParams.get('payment');
  const [loading, setLoading]   = useState(null);
  const [showForm, setShowForm] = useState(null);
  const [phone, setPhone]       = useState('+221');
  const [error, setError]       = useState('');
  const [openFaq, setOpenFaq]   = useState(null);
  const cardsRef = useRef(null);
  const faqRef   = useRef(null);
  const navRef   = useRef(null);

  useEffect(() => {
    let ctx;
    (async () => {
      const { gsap }          = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        // Nav scroll
        ScrollTrigger.create({
          start: 'top -40',
          onUpdate: (self) => {
            if (navRef.current) {
              navRef.current.style.background = self.progress > 0 ? 'rgba(7,16,10,0.95)' : 'transparent';
            }
          },
        });
        // Header
        gsap.from('.pr-eyebrow, .pr-h1, .pr-sub', {
          y: 30, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out', delay: 0.1,
        });
        // Plan cards
        if (cardsRef.current) {
          gsap.from('.plan-card-new', {
            scrollTrigger: { trigger: cardsRef.current, start: 'top 78%' },
            y: 50, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out',
          });
        }
        // FAQ
        if (faqRef.current) {
          gsap.from('.faq-row', {
            scrollTrigger: { trigger: faqRef.current, start: 'top 80%' },
            y: 20, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out',
          });
        }
      });
    })();
    return () => ctx?.revert();
  }, []);

  const handleCheckout = async () => {
    if (!/^\+221[0-9]{9}$/.test(phone)) { setError('Format invalide. Ex : +221771234567'); return; }
    setLoading(showForm); setError('');
    try {
      const res  = await fetch('/api/checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ plan: showForm, phone }) });
      const data = await res.json();
      if (data.redirect_url) { window.location.href = data.redirect_url; }
      else { setError(data.error || 'Erreur. Veuillez réessayer.'); }
    } catch { setError('Erreur réseau.'); }
    finally { setLoading(null); }
  };

  const selected = PLANS.find(p => p.id === showForm);
  const FCFA = (n) => n.toLocaleString('fr-SN') + ' FCFA';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,400&family=Syne:wght@600;700&family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@500&display=swap');
        :root { --bg:#07100A; --s1:#0B1710; --s2:#0F1E13; --brd:#182A1C; --gold:#C9A84C; --gold2:#E8C97D; --green:#1D9E75; --green2:#3ED98A; --txt:#EDE5CC; --txt2:#7A9A82; --txt3:#3A5040; }
        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
        body { background: var(--bg); color: var(--txt); font-family: 'Outfit', sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        .pr-page { min-height: 100vh; }

        .pr-nav { position: fixed; top:0; left:0; right:0; z-index:100; padding: 18px 40px; display:flex; align-items:center; justify-content:space-between; transition: background 0.3s; backdrop-filter: blur(12px); }
        .pr-nav-logo { font-family:'Cormorant Garamond',serif; font-size:1.5rem; font-weight:600; color:var(--gold); text-decoration:none; }
        .pr-nav-links { display:flex; gap:20px; align-items:center; }
        .pr-nav-link { font-size:0.85rem; color:var(--txt2); text-decoration:none; }
        .pr-nav-link:hover { color:var(--txt); }
        .pr-nav-cta { padding:8px 18px; background:rgba(201,168,76,0.1); border:1px solid rgba(201,168,76,0.3); color:var(--gold); border-radius:9px; font-size:0.82rem; font-weight:600; text-decoration:none; }

        .pr-hero { padding: 140px 40px 80px; text-align:center; position:relative; overflow:hidden; }
        .pr-hero-bg { position:absolute; inset:0; background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(29,158,117,0.08) 0%, transparent 70%); pointer-events:none; }
        .pr-eyebrow { display:inline-block; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.12em; color:var(--gold); background:rgba(201,168,76,0.08); border:1px solid rgba(201,168,76,0.25); padding:5px 16px; border-radius:30px; margin-bottom:20px; }
        .pr-h1 { font-family:'Cormorant Garamond',serif; font-size:clamp(2.2rem,5vw,4rem); font-weight:600; line-height:1.1; margin-bottom:16px; }
        .pr-h1 em { font-style:italic; color:var(--gold); }
        .pr-sub { font-size:1rem; color:var(--txt2); font-weight:300; max-width:480px; margin:0 auto 12px; line-height:1.7; }

        .alert { max-width:500px; margin:0 auto 24px; padding:12px 18px; border-radius:10px; font-size:0.85rem; text-align:center; }
        .alert.err { background:rgba(240,101,67,0.1); border:1px solid rgba(240,101,67,0.3); color:#F06543; }
        .alert.ok  { background:rgba(29,158,117,0.1); border:1px solid rgba(29,158,117,0.3); color:var(--green2); }

        .plans-section { padding: 20px 40px 80px; }
        .plans-grid-new { display:grid; grid-template-columns: 0.85fr 1fr 1.05fr; gap:20px; max-width:1000px; margin:0 auto; align-items:start; }
        .plan-card-new { background:var(--s1); border:1px solid var(--brd); border-radius:22px; padding:32px 26px; position:relative; overflow:hidden; transition:transform 0.25s; }
        .plan-card-new:hover { transform: translateY(-5px); }
        .plan-card-new.is-popular { border-color: rgba(201,168,76,0.45); background: linear-gradient(160deg,#1A2E20,#122019); }
        .plan-card-new.is-subtle { opacity: 0.85; }
        .plan-card-new::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background: var(--plan-color); }
        .popular-pill { position:absolute; top:18px; right:18px; font-size:0.62rem; text-transform:uppercase; letter-spacing:0.1em; font-weight:700; padding:3px 10px; border-radius:20px; background:rgba(201,168,76,0.12); border:1px solid rgba(201,168,76,0.3); color:var(--gold); }
        .plan-label-new { font-family:'Cormorant Garamond',serif; font-size:1.5rem; font-weight:600; margin-bottom:4px; }
        .plan-tagline-new { font-size:0.78rem; color:var(--txt2); margin-bottom:20px; font-weight:300; line-height:1.5; }
        .plan-price-new { display:flex; align-items:baseline; gap:4px; margin-bottom:24px; padding-bottom:20px; border-bottom:1px solid var(--brd); }
        .price-amt { font-family:'DM Mono',monospace; font-size:2.4rem; color: var(--plan-color); }
        .price-curr { font-size:0.9rem; color:var(--txt2); }
        .price-per  { font-size:0.75rem; color:var(--txt3); }
        .plan-feats { list-style:none; display:flex; flex-direction:column; gap:9px; margin-bottom:28px; }
        .plan-feats li { display:flex; align-items:flex-start; gap:10px; font-size:0.84rem; color:var(--txt2); line-height:1.5; font-weight:300; }
        .feat-ico { flex-shrink:0; width:16px; height:16px; margin-top:1px; color: var(--plan-color); }
        .btn-plan-new { width:100%; padding:14px; border-radius:11px; border:none; font-size:0.92rem; font-weight:700; cursor:pointer; transition:all 0.2s; font-family:inherit; letter-spacing:0.01em; }
        .btn-plan-new:disabled { opacity:0.5; cursor:not-allowed; }

        .pm-row { max-width:1000px; margin:28px auto 0; display:flex; align-items:center; justify-content:center; gap:12px; flex-wrap:wrap; }
        .pm-label { font-size:0.72rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--txt3); }
        .pm-chip { background:var(--s1); border:1px solid var(--brd); border-radius:8px; padding:6px 14px; font-size:0.8rem; font-weight:600; color:var(--txt2); }

        .guarantee { max-width:800px; margin:40px auto 0; padding:20px 28px; background:rgba(201,168,76,0.05); border:1px solid rgba(201,168,76,0.18); border-radius:14px; display:flex; gap:16px; align-items:flex-start; }
        .guarantee-ico { color:var(--gold); flex-shrink:0; margin-top:2px; }
        .guarantee-title { font-weight:600; font-size:0.9rem; color:var(--gold); margin-bottom:4px; }
        .guarantee-text { font-size:0.82rem; color:var(--txt2); line-height:1.65; }

        .faq-section { max-width:700px; margin:80px auto; padding:0 40px 80px; }
        .faq-title { font-family:'Cormorant Garamond',serif; font-size:2rem; font-weight:600; margin-bottom:32px; text-align:center; }
        .faq-row { border-bottom:1px solid var(--brd); overflow:hidden; }
        .faq-q { width:100%; display:flex; align-items:center; justify-content:space-between; padding:18px 0; background:none; border:none; color:var(--txt); font-family:inherit; font-size:0.92rem; font-weight:500; cursor:pointer; text-align:left; gap:16px; }
        .faq-chevron { flex-shrink:0; transition:transform 0.3s; color:var(--txt2); }
        .faq-chevron.open { transform:rotate(180deg); }
        .faq-ans { font-size:0.84rem; color:var(--txt2); line-height:1.7; font-weight:300; padding-bottom:16px; }

        /* MODAL */
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px); z-index:200; display:flex; align-items:flex-end; justify-content:center; padding:0; }
        .modal-sheet { background:#0F1E13; border:1px solid #1E3328; border-radius:20px 20px 0 0; padding:32px 28px 40px; width:100%; max-width:480px; }
        .modal-bar { width:40px; height:4px; background:#1E3328; border-radius:2px; margin:0 auto 24px; }
        .modal-title { font-family:'Cormorant Garamond',serif; font-size:1.3rem; font-weight:600; margin-bottom:6px; }
        .modal-sub { font-size:0.82rem; color:var(--txt2); margin-bottom:22px; line-height:1.6; }
        .modal-label { font-size:0.7rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--txt2); display:block; margin-bottom:6px; }
        .modal-input { width:100%; background:#0A1610; border:1px solid #1E3328; border-radius:10px; padding:13px 16px; color:var(--txt); font-size:1rem; font-family:inherit; outline:none; transition:border 0.15s; margin-bottom:16px; }
        .modal-input:focus { border-color:var(--gold); }
        .modal-btns { display:flex; gap:10px; }
        .btn-cancel { padding:13px 18px; background:transparent; border:1px solid #1E3328; color:var(--txt2); border-radius:10px; cursor:pointer; font-family:inherit; }
        .btn-pay { flex:1; background:linear-gradient(135deg,var(--gold),#A07820); color:#0D1B14; border:none; border-radius:10px; padding:13px; font-weight:700; cursor:pointer; font-family:inherit; font-size:0.95rem; transition:opacity 0.2s; }
        .btn-pay:disabled { opacity:0.5; cursor:not-allowed; }
        .modal-secure { font-size:0.7rem; color:var(--txt3); text-align:center; margin-top:12px; }

        @media (max-width:800px) {
          .pr-nav { padding:16px 20px; }
          .pr-nav-links .pr-nav-link { display:none; }
          .pr-hero { padding:110px 20px 50px; }
          .plans-section { padding:20px 16px 60px; }
          .plans-grid-new { grid-template-columns:1fr; }
          .plan-card-new.is-subtle { order: 3; }
          .faq-section { padding:0 20px 60px; }
        }
      `}</style>

      <div className="pr-page">
        <nav className="pr-nav" ref={navRef} style={{ background:'transparent' }}>
          <a href="/" className="pr-nav-logo">SenCompta IA</a>
          <div className="pr-nav-links">
            <a href="/"           className="pr-nav-link">Accueil</a>
            <a href="/dashboard"  className="pr-nav-link">Dashboard</a>
            <a href="/auth/login" className="pr-nav-cta">Connexion</a>
          </div>
        </nav>

        <div className="pr-hero">
          <div className="pr-hero-bg" />
          <div className="pr-eyebrow">Abonnements SenCompta IA</div>
          <h1 className="pr-h1">Gérez votre boutique<br /><em>comme un expert-comptable</em></h1>
          <p className="pr-sub">Saisie WhatsApp en français et wolof. Paiement Wave ou Orange Money. Sans engagement.</p>
        </div>

        {paymentStatus === 'cancelled' && <div className="alert err" style={{margin:'0 auto 20px'}}>Paiement annulé. Vous pouvez réessayer.</div>}
        {paymentStatus === 'success'   && <div className="alert ok"  style={{margin:'0 auto 20px'}}>Paiement confirmé ! Vérifiez votre WhatsApp pour votre lien de connexion.</div>}

        <div className="plans-section">
          <div className="plans-grid-new" ref={cardsRef}>
            {PLANS.map((plan) => {
              const isFreeHref = plan.href;
              return (
                <div key={plan.id} className={`plan-card-new ${plan.popular ? 'is-popular' : ''} ${plan.subtle ? 'is-subtle' : ''}`} style={{ '--plan-color': plan.color }}>
                  {plan.popular && <div className="popular-pill">Recommandé</div>}
                  <div className="plan-label-new">{plan.label}</div>
                  <div className="plan-tagline-new">{plan.tagline}</div>
                  <div className="plan-price-new">
                    {plan.price === 0
                      ? <><span className="price-amt" style={{fontSize:'1.8rem'}}>Gratuit</span></>
                      : <><span className="price-amt">{plan.price.toLocaleString('fr-SN')}</span><span className="price-curr"> FCFA</span><span className="price-per">/mois</span></>}
                  </div>
                  <ul className="plan-feats">
                    {plan.features.map((f, i) => (
                      <li key={i}>
                        <svg className="feat-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  {isFreeHref ? (
                    <a href={plan.href} className="btn-plan-new" style={{ background:'transparent', border:'1px solid var(--brd)', color:'var(--txt2)', display:'block', textAlign:'center', textDecoration:'none' }}>
                      {plan.cta}
                    </a>
                  ) : (
                    <button
                      className="btn-plan-new"
                      style={plan.popular
                        ? { background:'linear-gradient(135deg,var(--gold),#A07820)', color:'#0D1B14' }
                        : { background:'rgba(29,158,117,0.12)', border:'1px solid rgba(29,158,117,0.3)', color:'var(--green2)' }
                      }
                      onClick={() => { setShowForm(plan.id); setError(''); }}
                      disabled={loading === plan.id}
                    >
                      {loading === plan.id ? 'Redirection…' : plan.cta}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pm-row">
            <span className="pm-label">Paiement sécurisé via PayTech.sn</span>
            {['Wave', 'Orange Money', 'Free Money'].map(m => <div key={m} className="pm-chip">{m}</div>)}
          </div>

          <div className="guarantee">
            <svg className="guarantee-ico" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <div>
              <div className="guarantee-title">Continuité & sécurité garanties</div>
              <div className="guarantee-text">Rappel WhatsApp 3 jours avant expiration. Données conservées indéfiniment. Renouvellement sans coupure. Sans engagement.</div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="faq-section" ref={faqRef}>
          <h2 className="faq-title">Questions fréquentes</h2>
          {FAQ.map((item, i) => (
            <div key={i} className="faq-row">
              <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {item.q}
                <svg className={`faq-chevron ${openFaq === i ? 'open' : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {openFaq === i && <div className="faq-ans">{item.a}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(null)}>
          <div className="modal-sheet">
            <div className="modal-bar" />
            <div className="modal-title">Abonnement {selected?.label}</div>
            <p className="modal-sub">Entrez votre numéro WhatsApp. Votre lien de connexion sera envoyé après le paiement.</p>
            {error && <div className="alert err" style={{margin:'0 0 16px'}}>{error}</div>}
            <label className="modal-label">Numéro WhatsApp</label>
            <input className="modal-input" type="tel" value={phone} inputMode="tel" onChange={e => setPhone(e.target.value)} placeholder="+221 77 000 00 00" />
            <div className="modal-btns">
              <button className="btn-cancel" onClick={() => setShowForm(null)}>Annuler</button>
              <button className="btn-pay" onClick={handleCheckout} disabled={loading === showForm}>
                {loading === showForm ? 'Redirection…' : `Payer ${selected?.price.toLocaleString('fr-SN')} FCFA`}
              </button>
            </div>
            <p className="modal-secure">Paiement sécurisé · PayTech.sn · Wave · Orange Money</p>
          </div>
        </div>
      )}
    </>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div style={{ background:'#07100A', minHeight:'100vh' }} />}>
      <PricingContent />
    </Suspense>
  );
}
