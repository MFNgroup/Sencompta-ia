// app/page.jsx — SenCompta IA · Landing Page Redesign 2025
// Drop-in replacement — Next.js 14 compatible

import Link from 'next/link';

export const metadata = {
  title: 'SenCompta IA — La comptabilité intelligente pour votre boutique',
  description: 'Enregistrez vos transactions via WhatsApp en français et wolof. Tableau de bord, analyses IA, suivi des créances.',
};

const features = [
  {
    title: 'Saisie WhatsApp',
    desc: 'Envoyez vos transactions en français ou wolof. "Vendu tissus 25000" suffit — l\'IA comprend et classe automatiquement.',
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  },
  {
    title: 'Analyse IA',
    desc: 'Recevez des conseils stratégiques personnalisés basés sur vos vraies données. Pas des généralités — des insights actionnables.',
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  },
  {
    title: 'Dashboard temps réel',
    desc: 'Visualisez votre CA, charges et résultat net. Graphiques clairs, données live, exportables en un clic.',
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  },
  {
    title: 'Suivi des créances',
    desc: 'Gardez une trace de qui vous doit de l\'argent. Alertes automatiques sur WhatsApp avant les échéances.',
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  },
  {
    title: 'Messages vocaux',
    desc: 'Parlez, SenCompta IA transcrit et enregistre votre transaction automatiquement. Même sans les mains libres.',
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  },
  {
    title: 'Rappels automatiques',
    desc: 'Abonnement, créances, bilans mensuels — des rappels intelligents arrivent directement sur votre WhatsApp.',
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  },
];

const steps = [
  { num: '01', title: 'Choisissez votre plan', desc: 'Standard à 10 000 FCFA ou Premium à 15 000 FCFA/mois. Paiement Wave, Orange Money ou Free Money.' },
  { num: '02', title: 'Recevez votre accès', desc: 'Un lien sécurisé est envoyé sur votre WhatsApp dans les minutes qui suivent.' },
  { num: '03', title: 'Commencez à saisir', desc: 'Envoyez vos premières transactions. L\'IA comprend votre français, votre wolof, vos habitudes.' },
];

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Syne:wght@600;700;800&family=Outfit:wght@300;400;500;600&display=swap');

        :root {
          --bg:        #07100A;
          --s1:        #0B1710;
          --s2:        #0F1E13;
          --brd:       #182A1C;
          --gold:      #D4A843;
          --gold-2:    #E8C97D;
          --gold-dim:  rgba(212,168,67,0.10);
          --gold-glow: rgba(212,168,67,0.20);
          --green:     #3ED98A;
          --red:       #F06543;
          --txt:       #EDE5CC;
          --txt-2:     #7A9A82;
          --txt-3:     #3A5040;
          --r:         16px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        html, body {
          background: var(--bg);
          color: var(--txt);
          font-family: 'Outfit', sans-serif;
          -webkit-font-smoothing: antialiased;
          line-height: 1.6;
        }
        a { text-decoration: none; color: inherit; }
        img { max-width: 100%; }

        /* ─── Noise overlay ─── */
        body::after {
          content: '';
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          opacity: 0.5;
        }

        /* ─── Keyframes ─── */
        @keyframes float   { 0%,100%{transform:translateY(0)}    50%{transform:translateY(-14px)} }
        @keyframes pulse-d { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes fadein  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

        /* ─── Utility ─── */
        .z1 { position: relative; z-index: 1; }
        .serif { font-family: 'Cormorant Garamond', serif; }
        .syne  { font-family: 'Syne', sans-serif; }

        /* ─── NAV ─── */
        .nav-shell {
          position: sticky; top: 0; z-index: 100;
          background: rgba(7,16,10,.92); backdrop-filter: blur(24px);
          border-bottom: 1px solid var(--brd);
        }
        .nav-in {
          max-width: 1200px; margin: 0 auto; padding: 0 28px;
          height: 64px; display: flex; align-items: center; justify-content: space-between;
        }
        .logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.45rem; font-weight: 600; color: var(--gold);
          letter-spacing: -.02em; display: flex; align-items: center; gap: 4px;
        }
        .logo-ia {
          font-size: .75rem; font-weight: 600; font-family: 'Syne', sans-serif;
          color: var(--txt-2); letter-spacing: .08em; margin-left: 2px; align-self: flex-end; padding-bottom: 3px;
        }
        .nav-r { display: flex; align-items: center; gap: 28px; }
        .nav-a {
          font-size: .83rem; color: var(--txt-2); font-weight: 400;
          transition: color .2s;
        }
        .nav-a:hover { color: var(--txt); }
        .btn-cnx {
          font-size: .8rem; font-weight: 600; font-family: 'Syne', sans-serif;
          color: var(--gold); background: var(--gold-dim);
          border: 1px solid var(--gold-glow); border-radius: 9px;
          padding: 8px 20px; letter-spacing: .02em; transition: all .2s;
          cursor: pointer;
        }
        .btn-cnx:hover { background: rgba(212,168,67,.18); border-color: var(--gold); }

        /* ─── HERO ─── */
        .hero-shell { position: relative; overflow: hidden; }
        .hero-orb {
          position: absolute; border-radius: 50%; pointer-events: none;
          filter: blur(90px);
        }
        .hero-in {
          max-width: 1200px; margin: 0 auto;
          padding: 128px 28px 100px;
          display: grid; grid-template-columns: 1fr 440px; gap: 64px;
          align-items: center;
        }

        /* Left */
        .hero-badge {
          display: inline-flex; align-items: center; gap: 9px;
          font-family: 'Syne', sans-serif; font-size: .68rem;
          text-transform: uppercase; letter-spacing: .18em; color: var(--gold);
          background: var(--gold-dim); border: 1px solid rgba(212,168,67,.22);
          border-radius: 100px; padding: 6px 16px; margin-bottom: 32px;
        }
        .badge-dot {
          width: 7px; height: 7px; border-radius: 50%; background: var(--gold);
          animation: pulse-d 2.4s ease-in-out infinite;
        }
        .hero-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3rem, 6.5vw, 5.2rem);
          font-weight: 600; line-height: 1.04;
          letter-spacing: -.025em; margin-bottom: 24px;
        }
        .hero-h1 em {
          font-style: italic; color: var(--gold);
          display: block;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-2) 50%, var(--gold) 100%);
          background-size: 200%;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 5s linear infinite;
        }
        .hero-p {
          font-size: clamp(.95rem, 1.8vw, 1.1rem);
          color: var(--txt-2); line-height: 1.78; font-weight: 300;
          max-width: 500px; margin-bottom: 40px;
        }
        .hero-btns { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 56px; }
        .btn-gold {
          display: inline-flex; align-items: center; gap: 10px;
          background: linear-gradient(135deg,#D4A843 0%,#B8881E 100%);
          color: #07100A; border: none; border-radius: 12px;
          padding: 14px 32px; font-size: .92rem; font-weight: 700;
          font-family: 'Syne', sans-serif; letter-spacing: .01em;
          cursor: pointer;
          box-shadow: 0 8px 28px rgba(212,168,67,.28);
          transition: all .2s;
        }
        .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 14px 40px rgba(212,168,67,.38); }
        .btn-ghost {
          display: inline-flex; align-items: center; gap: 10px;
          background: transparent; border: 1px solid var(--brd);
          color: var(--txt); border-radius: 12px;
          padding: 14px 32px; font-size: .92rem; font-weight: 500;
          font-family: 'Outfit', sans-serif;
          cursor: pointer; transition: all .2s;
        }
        .btn-ghost:hover { border-color: rgba(212,168,67,.4); color: var(--gold); }

        .hero-stats {
          display: flex; gap: 36px; flex-wrap: wrap;
          padding-top: 28px; border-top: 1px solid var(--brd);
        }
        .stat-v {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.85rem; font-weight: 600; line-height: 1.1;
          color: var(--txt);
        }
        .stat-l { font-size: .75rem; color: var(--txt-2); margin-top: 3px; font-weight: 400; }

        /* Right — WhatsApp mockup */
        .wa-card {
          background: rgba(11,23,16,.85); border: 1px solid var(--brd);
          backdrop-filter: blur(24px); border-radius: 20px; overflow: hidden;
          animation: float 6.5s ease-in-out infinite;
        }
        .wa-top {
          background: #075E54; padding: 14px 18px;
          display: flex; align-items: center; gap: 10px;
        }
        .wa-av {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg,#D4A843,#8B6914);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: .78rem; font-weight: 700; color: #07100A;
        }
        .wa-name { font-size: .84rem; font-weight: 600; color: #fff; }
        .wa-status { font-size: .68rem; color: rgba(255,255,255,.7); }
        .wa-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
        .wa-msg {
          max-width: 86%; border-radius: 14px;
          padding: 10px 14px; font-size: .8rem; line-height: 1.5;
        }
        .wa-sent {
          align-self: flex-end; background: #005C4B; color: #fff;
          border-bottom-right-radius: 4px;
        }
        .wa-recv {
          align-self: flex-start; background: var(--s2); color: var(--txt);
          border: 1px solid var(--brd); border-bottom-left-radius: 4px;
        }
        .wa-t { font-size: .62rem; opacity: .55; margin-top: 5px; text-align: right; }

        .mini-card {
          margin-top: 14px;
          background: rgba(11,23,16,.85); border: 1px solid var(--brd);
          backdrop-filter: blur(24px); border-radius: 14px;
          padding: 18px 20px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .mini-lbl { font-size: .68rem; color: var(--txt-2); margin-bottom: 4px; font-weight: 400; }
        .mini-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.7rem; font-weight: 600; color: var(--gold);
        }

        /* ─── Divider ─── */
        .divider { height: 1px; background: var(--brd); max-width: 1200px; margin: 0 auto; }

        /* ─── Section layout ─── */
        .sect { max-width: 1200px; margin: 0 auto; padding: 100px 28px; }
        .sect-head-2col {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 48px; align-items: end; margin-bottom: 64px;
        }
        .eyebrow {
          font-family: 'Syne', sans-serif;
          font-size: .68rem; text-transform: uppercase; letter-spacing: .18em;
          color: var(--gold); margin-bottom: 16px;
        }
        .s-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 4.5vw, 3.2rem);
          font-weight: 600; line-height: 1.1; letter-spacing: -.02em;
        }
        .s-sub {
          font-size: .95rem; color: var(--txt-2); line-height: 1.75;
          font-weight: 300;
        }

        /* ─── FEATURES GRID ─── */
        .feat-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          border: 1px solid var(--brd); border-radius: 20px;
          overflow: hidden; background: var(--brd); gap: 1px;
        }
        .feat-cell {
          background: var(--s1); padding: 32px 28px;
          position: relative; overflow: hidden;
          transition: background .25s;
        }
        .feat-cell::before {
          content: ''; position: absolute; inset: 0; opacity: 0;
          background: linear-gradient(135deg, rgba(212,168,67,.06) 0%, transparent 60%);
          transition: opacity .3s;
        }
        .feat-cell:hover { background: var(--s2); }
        .feat-cell:hover::before { opacity: 1; }
        .feat-ic {
          width: 46px; height: 46px; border-radius: 12px;
          background: var(--gold-dim); border: 1px solid rgba(212,168,67,.2);
          display: flex; align-items: center; justify-content: center;
          color: var(--gold); margin-bottom: 20px;
        }
        .feat-title {
          font-family: 'Syne', sans-serif; font-size: .9rem; font-weight: 700;
          margin-bottom: 10px; letter-spacing: -.005em;
        }
        .feat-desc { font-size: .82rem; color: var(--txt-2); line-height: 1.68; font-weight: 300; }

        /* ─── STEPS ─── */
        .steps-layout {
          display: grid; grid-template-columns: 5fr 4fr;
          gap: 80px; align-items: center;
        }
        .steps-list { display: flex; flex-direction: column; }
        .step-row {
          display: flex; gap: 24px; padding: 28px 0;
          border-bottom: 1px solid var(--brd);
          transition: background .2s;
        }
        .step-row:first-child { padding-top: 0; }
        .step-row:last-child  { border-bottom: none; padding-bottom: 0; }
        .step-n {
          width: 40px; height: 40px; flex-shrink: 0; border-radius: 10px;
          background: var(--gold-dim); border: 1px solid rgba(212,168,67,.25);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: .72rem; font-weight: 800;
          color: var(--gold); letter-spacing: .04em; margin-top: 2px;
        }
        .step-tt { font-family: 'Syne', sans-serif; font-size: .9rem; font-weight: 700; margin-bottom: 8px; }
        .step-ds { font-size: .83rem; color: var(--txt-2); line-height: 1.65; font-weight: 300; }

        .steps-vis {
          background: var(--s1); border: 1px solid var(--brd);
          border-radius: 24px; padding: 28px; min-height: 440px;
          display: flex; flex-direction: column; gap: 10px;
          position: relative; overflow: hidden;
        }
        .steps-vis-top {
          font-family: 'Syne', sans-serif; font-size: .65rem;
          text-transform: uppercase; letter-spacing: .12em;
          color: var(--txt-3); margin-bottom: 8px;
        }
        .vis-orb {
          position: absolute; border-radius: 50%;
          filter: blur(40px); pointer-events: none;
        }

        /* ─── CTA ─── */
        .cta-shell { padding: 80px 0; }
        .cta-box {
          max-width: 1144px; margin: 0 auto; padding: 88px 64px;
          background: var(--s1); border: 1px solid var(--brd);
          border-radius: 28px; text-align: center;
          position: relative; overflow: hidden;
        }
        .cta-box::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse 65% 55% at 50% 0%, rgba(212,168,67,.09) 0%, transparent 70%);
        }
        .cta-line {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 55%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212,168,67,.5), transparent);
        }
        .cta-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.8rem, 4.5vw, 3rem);
          font-weight: 600; line-height: 1.15;
          letter-spacing: -.02em; margin-bottom: 20px;
        }
        .cta-p {
          font-size: .97rem; color: var(--txt-2); line-height: 1.75;
          font-weight: 300; margin-bottom: 36px;
        }
        .cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .cta-note { font-size: .72rem; color: var(--txt-3); margin-top: 24px; font-weight: 300; }

        /* ─── FOOTER ─── */
        .ft-shell { border-top: 1px solid var(--brd); }
        .ft-in {
          max-width: 1200px; margin: 0 auto; padding: 40px 28px;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 20px;
        }
        .ft-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem; color: var(--gold); font-weight: 600;
        }
        .ft-links { display: flex; gap: 24px; flex-wrap: wrap; }
        .ft-a { font-size: .78rem; color: var(--txt-2); transition: color .2s; }
        .ft-a:hover { color: var(--txt); }
        .ft-copy { font-size: .73rem; color: var(--txt-3); font-weight: 300; }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 1024px) {
          .hero-in { grid-template-columns: 1fr; }
          .wa-card, .mini-card { display: none; }
          .steps-layout { grid-template-columns: 1fr; }
          .steps-vis { display: none; }
          .sect-head-2col { grid-template-columns: 1fr; gap: 20px; }
        }
        @media (max-width: 768px) {
          .feat-grid { grid-template-columns: 1fr; }
          .hero-in { padding: 80px 20px 64px; }
          .nav-r .nav-a { display: none; }
          .cta-box { padding: 48px 24px; margin: 0 16px; }
          .ft-in { flex-direction: column; text-align: center; }
          .ft-links { justify-content: center; }
          .sect { padding: 72px 20px; }
        }
        @media (max-width: 480px) {
          .hero-btns { flex-direction: column; }
          .btn-gold, .btn-ghost { justify-content: center; }
          .hero-stats { gap: 24px; }
          .cta-btns { flex-direction: column; align-items: center; }
        }
      `}</style>

      {/* ── NAV ── */}
      <div className="nav-shell">
        <nav className="nav-in z1">
          <div className="logo">
            SenCompta<span className="logo-ia">IA</span>
          </div>
          <div className="nav-r">
            <a href="#fonctionnalites" className="nav-a">Fonctionnalités</a>
            <a href="#comment"        className="nav-a">Comment ça marche</a>
            <a href="/pricing"        className="nav-a">Tarifs</a>
            <a href="/auth/login"     className="btn-cnx">Connexion</a>
          </div>
        </nav>
      </div>

      {/* ── HERO ── */}
      <div className="hero-shell">
        <div className="hero-orb" style={{width:600,height:600,background:'rgba(212,168,67,.065)',top:-120,right:-80}} />
        <div className="hero-orb" style={{width:340,height:340,background:'rgba(62,217,138,.045)',bottom:-60,left:-40}} />

        <div className="hero-in z1">
          {/* Left */}
          <div>
            <div className="hero-badge">
              <div className="badge-dot"/>
              Comptabilité intelligente · Sénégal
            </div>

            <h1 className="hero-h1">
              Gérez votre boutique
              <em>depuis WhatsApp.</em>
            </h1>

            <p className="hero-p">
              Enregistrez vos recettes et dépenses en français ou wolof.
              Votre tableau de bord se met à jour automatiquement —
              sans application à installer, sans formation.
            </p>

            <div className="hero-btns">
              <a href="/pricing" className="btn-gold">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                Commencer maintenant
              </a>
              <a href="#comment" className="btn-ghost">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
                </svg>
                Voir la démo
              </a>
            </div>

            <div className="hero-stats">
              <div>
                <div className="stat-v">2 min</div>
                <div className="stat-l">Pour s'inscrire</div>
              </div>
              <div>
                <div className="stat-v">100%</div>
                <div className="stat-l">WhatsApp natif</div>
              </div>
              <div>
                <div className="stat-v">Wolof + FR</div>
                <div className="stat-l">Langues supportées</div>
              </div>
            </div>
          </div>

          {/* Right — mockup */}
          <div>
            <div className="wa-card">
              <div className="wa-top">
                <div className="wa-av">SC</div>
                <div>
                  <div className="wa-name">SenCompta IA</div>
                  <div className="wa-status">En ligne</div>
                </div>
              </div>
              <div className="wa-body">
                <div className="wa-msg wa-sent">
                  Vendu tissus 25000 à Mariama
                  <div className="wa-t">09:32 ✓✓</div>
                </div>
                <div className="wa-msg wa-recv">
                  <strong>✅ Recette enregistrée</strong><br/>
                  <span style={{color:'var(--txt-2)',fontSize:'.76rem'}}>
                    Vendu tissus · 25 000 FCFA<br/>
                    Catégorie : Ventes
                  </span>
                  <div className="wa-t">09:32</div>
                </div>
                <div className="wa-msg wa-sent" style={{marginTop:4}}>
                  Acheté sac de riz 18000
                  <div className="wa-t">10:15 ✓✓</div>
                </div>
                <div className="wa-msg wa-recv">
                  <strong>📦 Dépense enregistrée</strong><br/>
                  <span style={{color:'var(--txt-2)',fontSize:'.76rem'}}>
                    Sac de riz · 18 000 FCFA<br/>
                    Catégorie : Alimentation
                  </span>
                  <div className="wa-t">10:15</div>
                </div>
              </div>
            </div>

            <div className="mini-card">
              <div>
                <div className="mini-lbl">Bilan du jour</div>
                <div className="mini-val">+7 000 FCFA</div>
              </div>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--txt-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="divider"/>

      {/* ── FEATURES ── */}
      <section className="sect z1" id="fonctionnalites">
        <div className="sect-head-2col">
          <div>
            <div className="eyebrow">Ce que vous obtenez</div>
            <h2 className="s-title">Tout ce dont votre boutique a besoin</h2>
          </div>
          <p className="s-sub">
            Un outil simple, pensé pour les commerçants sénégalais.
            Fonctionne sur n'importe quel téléphone. Pas de formation nécessaire.
          </p>
        </div>

        <div className="feat-grid">
          {features.map((f, i) => (
            <div key={i} className="feat-cell">
              <div className="feat-ic">{f.svg}</div>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider"/>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="sect z1" id="comment">
        <div className="steps-layout">
          <div>
            <div className="eyebrow">Démarrage en 3 étapes</div>
            <h2 className="s-title" style={{marginBottom:16}}>Prêt en moins<br/>de 5 minutes</h2>
            <p className="s-sub" style={{marginBottom:48}}>
              Pas d'application à télécharger. Tout fonctionne sur votre WhatsApp habituel.
            </p>

            <div className="steps-list">
              {steps.map((s, i) => (
                <div key={i} className="step-row">
                  <div className="step-n">{s.num}</div>
                  <div>
                    <div className="step-tt">{s.title}</div>
                    <div className="step-ds">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="steps-vis">
            <div className="vis-orb" style={{width:200,height:200,background:'rgba(212,168,67,.08)',bottom:-60,right:-60}}/>
            <div className="steps-vis-top">SenCompta IA · WhatsApp</div>

            <div className="wa-msg wa-sent" style={{marginTop:'auto'}}>
              Dépense loyer boutique 35000
              <div className="wa-t">14:00 ✓✓</div>
            </div>
            <div className="wa-msg wa-recv">
              <strong>🏠 Charge enregistrée</strong><br/>
              <span style={{color:'var(--txt-2)',fontSize:'.76rem'}}>Loyer boutique · 35 000 FCFA</span>
              <div className="wa-t">14:00</div>
            </div>
            <div className="wa-msg wa-sent" style={{marginTop:8}}>
              Bilan du mois
              <div className="wa-t">14:02 ✓✓</div>
            </div>
            <div className="wa-msg wa-recv">
              <strong>📊 Bilan Avril 2025</strong><br/>
              <span style={{color:'var(--txt-2)',fontSize:'.76rem',lineHeight:1.7}}>
                CA : 420 000 FCFA<br/>
                Charges : 180 000 FCFA<br/>
                <strong style={{color:'var(--green)'}}>Résultat : +240 000 FCFA</strong>
              </span>
              <div className="wa-t">14:02</div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"/>

      {/* ── CTA FINAL ── */}
      <section className="cta-shell z1">
        <div className="cta-box">
          <div className="cta-line"/>
          <h2 className="cta-title">
            Prêt à organiser<br/>votre comptabilité ?
          </h2>
          <p className="cta-p">
            Rejoignez les commerçants sénégalais qui pilotent leur boutique intelligemment.<br/>
            Paiement Wave, Orange Money ou Free Money. Sans engagement.
          </p>
          <div className="cta-btns">
            <a href="/pricing"    className="btn-gold">Voir nos offres</a>
            <a href="/auth/login" className="btn-ghost">J'ai déjà un compte</a>
          </div>
          <p className="cta-note">
            À partir de 10 000 FCFA/mois · Résiliable à tout moment · Données sécurisées
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <div className="ft-shell z1">
        <div className="ft-in">
          <div className="ft-logo">SenCompta IA</div>
          <div className="ft-links">
            <a href="/pricing"          className="ft-a">Tarifs</a>
            <a href="/mentions-legales" className="ft-a">Mentions légales</a>
            <a href="/confidentialite"  className="ft-a">Confidentialité</a>
            <a href="/auth/login"       className="ft-a">Connexion</a>
          </div>
          <div className="ft-copy">© 2025 SenCompta IA · Dakar, Sénégal</div>
        </div>
      </div>
    </>
  );
}
