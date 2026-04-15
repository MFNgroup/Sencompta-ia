// app/page.jsx — Landing page SenCompta IA

import Link from 'next/link';

export const metadata = {
  title: 'SenCompta IA — La comptabilité intelligente pour votre boutique',
  description: 'Enregistrez vos transactions via WhatsApp en français et wolof. Tableau de bord, analyses IA, suivi des créances.',
};

const features = [
  {
    title: 'Saisie WhatsApp',
    desc: 'Envoyez vos transactions en français ou wolof. "Vendu tissus 25000" suffit.',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
    ),
  },
  {
    title: 'Analyse IA',
    desc: 'Recevez des conseils stratégiques personnalisés basés sur vos vraies données.',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    title: 'Dashboard temps réel',
    desc: 'Visualisez votre CA, charges et résultat net avec des graphiques clairs.',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    title: 'Suivi des créances',
    desc: 'Gardez une trace de qui vous doit de l\'argent. Alertes automatiques.',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  {
    title: 'Messages vocaux',
    desc: 'Parlez, SenCompta IA transcrit et enregistre votre transaction automatiquement.',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
    ),
  },
  {
    title: 'Rappels automatiques',
    desc: 'Recevez un rappel WhatsApp avant l\'expiration de votre abonnement.',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
];

const steps = [
  { num: '01', title: 'Choisissez votre plan', desc: 'Standard à 10 000 FCFA ou Premium à 15 000 FCFA/mois.' },
  { num: '02', title: 'Recevez votre lien', desc: 'Un lien de connexion sécurisé est envoyé sur votre WhatsApp.' },
  { num: '03', title: 'Commencez à saisir', desc: 'Envoyez vos transactions directement depuis WhatsApp.' },
];

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #0D1B14; color: #EDE8DC; font-family: 'IBM Plex Sans', sans-serif; -webkit-font-smoothing: antialiased; }
        a { text-decoration: none; color: inherit; }

        /* ── Nav ── */
        .nav {
          position: sticky; top: 0; z-index: 50;
          background: rgba(13,27,20,0.95); backdrop-filter: blur(12px);
          border-bottom: 1px solid #1E3328;
          padding: 16px 24px;
          display: flex; align-items: center; justify-content: space-between;
          max-width: 1100px; margin: 0 auto;
        }
        .nav-wrap { position: sticky; top: 0; z-index: 50; background: rgba(13,27,20,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid #1E3328; }
        .nav-logo { font-family: 'Playfair Display', serif; font-size: 1.4rem; color: #C9A84C; }
        .nav-links { display: flex; align-items: center; gap: 20px; }
        .nav-link { font-size: 0.85rem; color: #8A9E8F; }
        .nav-link:hover { color: #EDE8DC; }
        .btn-nav {
          background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.3);
          color: #C9A84C; border-radius: 8px; padding: 8px 18px; font-size: 0.83rem;
        }
        .btn-nav:hover { background: rgba(201,168,76,0.18); }

        /* ── Hero ── */
        .hero {
          max-width: 1100px; margin: 0 auto;
          padding: 80px 24px 64px;
          text-align: center;
          position: relative;
        }
        .hero-eyebrow {
          display: inline-block; font-size: 0.7rem; text-transform: uppercase;
          letter-spacing: 2px; color: #C9A84C;
          background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.25);
          padding: 4px 14px; border-radius: 20px; margin-bottom: 24px;
        }
        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.2rem, 6vw, 4rem);
          line-height: 1.15; margin-bottom: 20px;
        }
        .hero-title em { font-style: italic; color: #C9A84C; }
        .hero-sub {
          font-size: clamp(0.95rem, 2vw, 1.1rem);
          color: #8A9E8F; line-height: 1.7;
          max-width: 600px; margin: 0 auto 36px;
        }
        .hero-ctas { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-bottom: 56px; }
        .btn-primary {
          background: linear-gradient(135deg, #C9A84C, #A07820);
          color: #0D1B14; border: none; border-radius: 12px;
          padding: 14px 32px; font-size: 1rem; font-weight: 700;
          cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
          transition: opacity 0.15s;
        }
        .btn-primary:hover { opacity: 0.88; }
        .btn-secondary-hero {
          background: transparent; border: 1px solid #1E3328;
          color: #EDE8DC; border-radius: 12px;
          padding: 14px 32px; font-size: 1rem; font-weight: 500;
          cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
          transition: all 0.15s;
        }
        .btn-secondary-hero:hover { border-color: #C9A84C; color: #C9A84C; }

        /* ── Video ── */
        .video-wrap {
          max-width: 800px; margin: 0 auto;
          border-radius: 16px; overflow: hidden;
          border: 1px solid #1E3328;
          background: #122019;
          aspect-ratio: 16/9;
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .video-placeholder {
          display: flex; flex-direction: column; align-items: center; gap: 16px;
          color: #8A9E8F; text-align: center; padding: 40px;
        }
        .video-play-btn {
          width: 72px; height: 72px; border-radius: 50%;
          background: rgba(201,168,76,0.15); border: 2px solid rgba(201,168,76,0.4);
          display: flex; align-items: center; justify-content: center;
          color: #C9A84C; cursor: pointer; transition: all 0.2s;
        }
        .video-play-btn:hover { background: rgba(201,168,76,0.25); transform: scale(1.05); }
        /* Pour intégrer une vraie vidéo YouTube/Vimeo, remplace video-wrap par :
           <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden">
             <iframe src="https://www.youtube.com/embed/TON_ID" style="position:absolute;top:0;left:0;width:100%;height:100%" frameborder="0" allowfullscreen></iframe>
           </div>
        */

        /* ── Section ── */
        .section { max-width: 1100px; margin: 0 auto; padding: 80px 24px; }
        .section-eyebrow { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 2px; color: #C9A84C; margin-bottom: 12px; }
        .section-title { font-family: 'Playfair Display', serif; font-size: clamp(1.6rem, 4vw, 2.4rem); line-height: 1.2; margin-bottom: 16px; }
        .section-sub { font-size: 0.95rem; color: #8A9E8F; line-height: 1.7; max-width: 500px; }
        .divider { height: 1px; background: #1E3328; max-width: 1100px; margin: 0 auto; }

        /* ── Features ── */
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 48px; }
        .feature-card {
          background: #122019; border: 1px solid #1E3328;
          border-radius: 14px; padding: 24px;
          transition: border-color 0.2s, transform 0.2s;
        }
        .feature-card:hover { border-color: rgba(201,168,76,0.3); transform: translateY(-2px); }
        .feature-icon {
          width: 44px; height: 44px; border-radius: 10px;
          background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.2);
          display: flex; align-items: center; justify-content: center;
          color: #C9A84C; margin-bottom: 16px;
        }
        .feature-title { font-weight: 600; font-size: 0.95rem; margin-bottom: 8px; }
        .feature-desc { font-size: 0.83rem; color: #8A9E8F; line-height: 1.6; }

        /* ── Steps ── */
        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px; }
        .step-card { position: relative; padding: 28px 24px; }
        .step-num {
          font-family: 'Playfair Display', serif; font-size: 3rem;
          color: rgba(201,168,76,0.15); line-height: 1; margin-bottom: 12px;
        }
        .step-title { font-weight: 600; font-size: 1rem; margin-bottom: 8px; color: #EDE8DC; }
        .step-desc { font-size: 0.83rem; color: #8A9E8F; line-height: 1.6; }
        .step-line {
          position: absolute; top: 44px; right: -12px;
          width: 24px; height: 1px; background: #1E3328;
        }

        /* ── CTA final ── */
        .cta-section {
          background: linear-gradient(135deg, #122019, #0D1B14);
          border: 1px solid #1E3328; border-radius: 20px;
          padding: 64px 40px; text-align: center;
          margin: 0 24px 80px; max-width: 1052px;
          margin-left: auto; margin-right: auto;
        }
        .cta-title { font-family: 'Playfair Display', serif; font-size: clamp(1.6rem, 4vw, 2.4rem); margin-bottom: 16px; }
        .cta-sub { font-size: 0.95rem; color: #8A9E8F; margin-bottom: 32px; }

        /* ── Footer ── */
        .footer {
          border-top: 1px solid #1E3328; padding: 32px 24px;
          max-width: 1100px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 16px;
        }
        .footer-logo { font-family: 'Playfair Display', serif; color: #C9A84C; font-size: 1.1rem; }
        .footer-links { display: flex; gap: 20px; }
        .footer-link { font-size: 0.8rem; color: #8A9E8F; }
        .footer-link:hover { color: #EDE8DC; }
        .footer-copy { font-size: 0.75rem; color: #4A5E50; }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .hero { padding: 48px 20px 40px; }
          .features-grid { grid-template-columns: 1fr; }
          .steps-grid { grid-template-columns: 1fr; }
          .step-line { display: none; }
          .nav-links .nav-link { display: none; }
          .cta-section { padding: 40px 24px; }
          .footer { flex-direction: column; text-align: center; }
          .footer-links { justify-content: center; }
        }
        @media (max-width: 480px) {
          .hero-ctas { flex-direction: column; align-items: stretch; }
          .btn-primary, .btn-secondary-hero { justify-content: center; }
        }
      `}</style>

      {/* Nav */}
      <div className="nav-wrap">
        <nav className="nav">
          <div className="nav-logo">SenCompta IA</div>
          <div className="nav-links">
            <a href="#fonctionnalites" className="nav-link">Fonctionnalités</a>
            <a href="#comment" className="nav-link">Comment ça marche</a>
            <a href="/pricing" className="nav-link">Tarifs</a>
            <a href="/auth/login" className="btn-nav">Connexion</a>
          </div>
        </nav>
      </div>

      {/* Hero */}
      <section className="hero">
        <div className="hero-eyebrow">Comptabilité intelligente</div>
        <h1 className="hero-title">
          Gérez votre boutique<br />
          <em>depuis WhatsApp</em>
        </h1>
        <p className="hero-sub">
          Enregistrez vos recettes et dépenses en français ou wolof directement sur WhatsApp.
          Votre tableau de bord se met à jour en temps réel.
        </p>
        <div className="hero-ctas">
          <a href="/pricing" className="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
            Commencer maintenant
          </a>
          <a href="#comment" className="btn-secondary-hero">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
            </svg>
            Voir comment ça marche
          </a>
        </div>

        {/* Section vidéo */}
        <div className="video-wrap">
          {/* 
            POUR AJOUTER UNE VRAIE VIDÉO YOUTUBE :
            Remplace tout le contenu de video-wrap par :
            <iframe
              width="100%" height="100%"
              src="https://www.youtube.com/embed/TON_VIDEO_ID"
              title="SenCompta IA"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}}
            />
          */}
          <div className="video-placeholder">
            <div className="video-play-btn">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
            <p style={{fontSize:'0.9rem', color:'#C9A84C', fontWeight:600}}>Vidéo de présentation</p>
            <p style={{fontSize:'0.78rem'}}>Ajoutez votre vidéo YouTube en remplaçant ce bloc</p>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Fonctionnalités */}
      <section className="section" id="fonctionnalites">
        <div className="section-eyebrow">Ce que vous obtenez</div>
        <h2 className="section-title">Tout ce dont votre boutique a besoin</h2>
        <p className="section-sub">Un outil simple, pensé pour les commerçants sénégalais. Pas de formation nécessaire.</p>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.svg}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* Comment ça marche */}
      <section className="section" id="comment">
        <div className="section-eyebrow">Démarrage en 3 étapes</div>
        <h2 className="section-title">Prêt en moins de 5 minutes</h2>
        <p className="section-sub">Pas d'application à télécharger. Tout fonctionne sur votre WhatsApp habituel.</p>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <div key={i} className="step-card">
              <div className="step-num">{s.num}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
              {i < steps.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* CTA Final */}
      <section style={{padding:'80px 0 0'}}>
        <div className="cta-section">
          <h2 className="cta-title">Prêt à organiser votre comptabilité ?</h2>
          <p className="cta-sub">
            Rejoignez les commerçants sénégalais qui pilotent leur boutique intelligemment.<br />
            Paiement Wave ou Orange Money. Sans engagement.
          </p>
          <div style={{display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap'}}>
            <a href="/pricing" className="btn-primary">
              Voir nos offres
            </a>
            <a href="/auth/login" className="btn-secondary-hero">
              J'ai déjà un compte
            </a>
          </div>
          <p style={{fontSize:'0.75rem', color:'#4A5E50', marginTop:24}}>
            À partir de 10 000 FCFA/mois · Wave · Orange Money · Free Money
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{borderTop:'1px solid #1E3328', marginTop:0}}>
        <div className="footer">
          <div className="footer-logo">SenCompta IA</div>
          <div className="footer-links">
            <a href="/pricing" className="footer-link">Tarifs</a>
            <a href="/mentions-legales" className="footer-link">Mentions légales</a>
            <a href="/confidentialite" className="footer-link">Confidentialité</a>
            <a href="/auth/login" className="footer-link">Connexion</a>
          </div>
          <div className="footer-copy">© 2025 SenCompta IA · Dakar, Sénégal</div>
        </div>
      </footer>
    </>
  );
}
