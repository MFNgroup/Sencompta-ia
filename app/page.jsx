// app/page.jsx — Landing page SenCompta IA
'use client';
import { useState } from 'react';

const FEATURES = [
  {
    icon: '💬',
    title: 'WhatsApp en français & wolof',
    desc:  'Envoyez "vendu riz 15000" ou "bind légumes 8500 fàkk". L\'IA comprend votre langue.',
  },
  {
    icon: '🤖',
    title: 'Analyse IA par Gemini',
    desc:  'Google Gemini extrait automatiquement le type, le montant et la catégorie de chaque opération.',
  },
  {
    icon: '📊',
    title: 'Dashboard temps réel',
    desc:  'CA, Charges, Résultat net. Graphiques de flux et répartition des dépenses en un coup d\'œil.',
  },
  {
    icon: '🎙️',
    title: 'Saisie vocale (Premium)',
    desc:  'Envoyez un message vocal — l\'IA transcrit et enregistre automatiquement.',
  },
  {
    icon: '✅',
    title: 'Validation avant enregistrement',
    desc:  'Le bot vous demande confirmation avant d\'enregistrer. Zéro erreur possible.',
  },
  {
    icon: '💡',
    title: '3 conseils stratégiques / semaine',
    desc:  'Gemini analyse vos 30 dernières transactions et identifie des leviers de croissance concrets.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Aminata D.',
    role: 'Vendeuse de tissus, Sandaga',
    text: 'Avant j\'avais un cahier que je perdais tout le temps. Maintenant j\'envoie juste sur WhatsApp et tout est là.',
    plan: 'Premium',
  },
  {
    name: 'Moussa K.',
    role: 'Restaurateur, Dakar Plateau',
    text: 'En wolof ça marche ! "bind poisson 12000" — il enregistre directement. Incroyable.',
    plan: 'Standard',
  },
  {
    name: 'Fatou N.',
    role: 'Boutique épicerie, Thiès',
    text: 'Les conseils IA m\'ont dit que mes dépenses transport étaient trop élevées. J\'ai changé de fournisseur.',
    plan: 'Premium',
  },
];

export default function LandingPage() {
  const [demoInput, setDemoInput] = useState('');
  const [demoResult, setDemoResult] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);

  const DEMO_EXAMPLES = [
    'vendu du riz 15000',
    'bind légumes 8500 fàkk',
    'loyer payé 75000',
    'reçu 200k pour prestation couture',
    'transport 3500 pour livraison',
  ];

  const runDemo = async () => {
    if (!demoInput.trim()) return;
    setDemoLoading(true);
    setDemoResult(null);
    // Simulation locale (pas d'appel API réel depuis la landing)
    await new Promise((r) => setTimeout(r, 900));
    const lower = demoInput.toLowerCase();
    const isRecette = lower.includes('vendu') || lower.includes('reçu') || lower.includes('jënd') || lower.includes('recette');
    const amountMatch = demoInput.match(/(\d[\d\s]*(?:k|000)?)/);
    let montant = 0;
    if (amountMatch) {
      const raw = amountMatch[1].replace(/\s/g, '');
      montant = raw.endsWith('k') ? parseInt(raw) * 1000 : parseInt(raw);
    }
    setDemoResult({
      type:      isRecette ? 'RECETTE' : 'DEPENSE',
      montant:   montant || 10000,
      libelle:   demoInput.slice(0, 40),
      categorie: isRecette ? 'Vente marchandise' : 'Achat marchandise',
      confiance: 'HAUTE',
    });
    setDemoLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=IBM+Plex+Sans:wght@400;500;600&family=DM+Mono:wght@500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0D1B14; color: #EDE8DC; font-family: 'IBM Plex Sans', sans-serif; overflow-x: hidden; }

        /* ── Tokens ── */
        :root {
          --gold:    #C9A84C; --gold-light: #E8C97D;
          --green:   #4CAF7D; --red: #E07B54;
          --bg:      #0D1B14; --surface: #122019; --border: #1E3328;
          --text:    #EDE8DC; --muted: #8A9E8F;
        }

        /* ── NAV ── */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 48px;
          background: rgba(13,27,20,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(30,51,40,0.6);
        }
        .nav-logo { font-family: 'Playfair Display', serif; color: var(--gold); font-size: 1.4rem; text-decoration: none; }
        .nav-links { display: flex; align-items: center; gap: 32px; }
        .nav-link  { font-size: 0.88rem; color: var(--muted); text-decoration: none; transition: color 0.15s; }
        .nav-link:hover { color: var(--text); }
        .nav-cta {
          background: linear-gradient(135deg, var(--gold), #A07820);
          color: #0D1B14; padding: 9px 22px; border-radius: 10px;
          font-size: 0.88rem; font-weight: 700; text-decoration: none;
          transition: opacity 0.15s;
        }
        .nav-cta:hover { opacity: 0.88; }

        /* ── HERO ── */
        .hero {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          text-align: center; padding: 120px 24px 80px;
          position: relative; overflow: hidden;
        }
        .hero-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(76,175,125,0.05) 0%, transparent 50%);
        }
        .hero-grid {
          position: absolute; inset: 0;
          background-image:
            repeating-linear-gradient(0deg, transparent, transparent 59px, #1E3328 60px),
            repeating-linear-gradient(90deg, transparent, transparent 59px, #1E3328 60px);
          opacity: 0.25;
        }
        .hero-inner { position: relative; z-index: 1; max-width: 760px; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.25);
          color: var(--gold); font-size: 0.72rem; text-transform: uppercase;
          letter-spacing: 2px; padding: 5px 14px; border-radius: 20px;
          margin-bottom: 24px;
        }
        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.4rem, 6vw, 4rem); line-height: 1.1;
          margin-bottom: 20px;
        }
        .hero-title em { font-style: italic; color: var(--gold); }
        .hero-sub {
          font-size: 1.05rem; color: var(--muted); line-height: 1.7;
          max-width: 580px; margin: 0 auto 36px;
        }
        .hero-ctas { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .btn-hero-primary {
          background: linear-gradient(135deg, var(--gold), #A07820);
          color: #0D1B14; padding: 14px 32px; border-radius: 12px;
          font-size: 1rem; font-weight: 700; text-decoration: none;
          transition: opacity 0.15s; display: inline-block;
        }
        .btn-hero-primary:hover { opacity: 0.88; }
        .btn-hero-secondary {
          background: rgba(255,255,255,0.05); border: 1px solid var(--border);
          color: var(--text); padding: 14px 28px; border-radius: 12px;
          font-size: 1rem; text-decoration: none; transition: background 0.15s;
          display: inline-block;
        }
        .btn-hero-secondary:hover { background: rgba(255,255,255,0.09); }
        .hero-stats {
          display: flex; gap: 40px; justify-content: center; flex-wrap: wrap;
          margin-top: 56px; padding-top: 40px;
          border-top: 1px solid var(--border);
        }
        .stat-item { text-align: center; }
        .stat-num { font-family: 'DM Mono', monospace; font-size: 2rem; color: var(--gold); display: block; }
        .stat-lbl { font-size: 0.78rem; color: var(--muted); }

        /* ── DEMO ── */
        .demo-section { padding: 80px 24px; max-width: 700px; margin: 0 auto; }
        .section-label {
          text-align: center; font-size: 0.7rem; text-transform: uppercase;
          letter-spacing: 2px; color: var(--gold); margin-bottom: 8px;
        }
        .section-title { font-family: 'Playfair Display', serif; text-align: center; font-size: clamp(1.5rem, 4vw, 2.2rem); margin-bottom: 40px; }
        .demo-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 20px; padding: 28px;
        }
        .demo-whatsapp {
          background: #1A2E20; border-radius: 14px; padding: 18px;
          margin-bottom: 20px; font-family: 'DM Mono', monospace; font-size: 0.85rem;
        }
        .wa-header { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
        .wa-avatar { width: 32px; height: 32px; background: var(--gold); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; color: #0D1B14; font-weight: 700; }
        .wa-name { font-size: 0.82rem; color: var(--gold); }
        .wa-bubble {
          background: #0D1B14; border-radius: 0 12px 12px 12px;
          padding: 10px 14px; display: inline-block; max-width: 80%;
          font-size: 0.88rem; color: var(--text); margin-bottom: 8px;
        }
        .wa-input-row { display: flex; gap: 8px; }
        .wa-input {
          flex: 1; background: #0D1B14; border: 1px solid var(--border);
          border-radius: 10px; padding: 10px 14px; color: var(--text);
          font-family: 'DM Mono', monospace; font-size: 0.85rem; outline: none;
        }
        .wa-input:focus { border-color: var(--gold); }
        .wa-send {
          background: var(--gold); color: #0D1B14; border: none;
          border-radius: 10px; padding: 10px 16px; cursor: pointer;
          font-size: 0.88rem; font-weight: 700; transition: opacity 0.15s;
        }
        .wa-send:hover { opacity: 0.85; }
        .demo-examples { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
        .demo-chip {
          background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.2);
          color: var(--muted); border-radius: 20px; padding: 4px 12px;
          font-size: 0.72rem; cursor: pointer; transition: all 0.15s;
          font-family: 'DM Mono', monospace;
        }
        .demo-chip:hover { background: rgba(201,168,76,0.15); color: var(--gold); }
        .demo-result {
          background: #0D1B14; border: 1px solid var(--border);
          border-radius: 12px; padding: 14px 18px;
          font-family: 'DM Mono', monospace; font-size: 0.8rem;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .result-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #1E3328; }
        .result-row:last-child { border: none; }
        .result-key { color: var(--muted); }
        .result-val { color: var(--text); }
        .result-val.recette { color: var(--green); }
        .result-val.depense { color: var(--red); }

        /* ── FEATURES ── */
        .features-section { padding: 80px 24px; max-width: 1000px; margin: 0 auto; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .feature-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 16px; padding: 24px;
          transition: transform 0.2s, border-color 0.2s;
        }
        .feature-card:hover { transform: translateY(-3px); border-color: rgba(201,168,76,0.3); }
        .feature-icon { font-size: 1.8rem; margin-bottom: 12px; }
        .feature-title { font-family: 'Playfair Display', serif; font-size: 1rem; margin-bottom: 6px; }
        .feature-desc { font-size: 0.82rem; color: var(--muted); line-height: 1.6; }

        /* ── TESTIMONIALS ── */
        .testimonials-section { padding: 80px 24px; max-width: 900px; margin: 0 auto; }
        .testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .testi-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 16px; padding: 24px;
        }
        .testi-quote { font-size: 0.88rem; color: var(--muted); line-height: 1.65; margin-bottom: 16px; font-style: italic; }
        .testi-author { display: flex; align-items: center; gap: 10px; }
        .testi-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, var(--gold), #8B6914);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 0.85rem; color: #0D1B14;
          flex-shrink: 0;
        }
        .testi-name { font-size: 0.85rem; font-weight: 600; }
        .testi-role { font-size: 0.72rem; color: var(--muted); }
        .testi-plan {
          margin-left: auto; font-size: 0.65rem; padding: 2px 8px;
          border-radius: 12px; border: 1px solid rgba(201,168,76,0.3);
          color: var(--gold); background: rgba(201,168,76,0.06);
        }

        /* ── CTA SECTION ── */
        .cta-section {
          padding: 80px 24px; text-align: center;
          background: linear-gradient(160deg, #122019 0%, #0D1B14 100%);
          border-top: 1px solid var(--border);
        }
        .cta-title { font-family: 'Playfair Display', serif; font-size: clamp(1.8rem, 4vw, 2.8rem); margin-bottom: 12px; }
        .cta-sub { color: var(--muted); margin-bottom: 32px; }

        /* ── FOOTER ── */
        footer {
          padding: 24px 48px; border-top: 1px solid var(--border);
          display: flex; justify-content: space-between; align-items: center;
          font-size: 0.78rem; color: var(--muted);
        }

        @media (max-width: 768px) {
          nav { padding: 14px 20px; }
          .nav-links { gap: 16px; }
          .features-grid, .testi-grid { grid-template-columns: 1fr; }
          footer { flex-direction: column; gap: 8px; text-align: center; }
        }
        @media (max-width: 480px) {
          .hero-stats { gap: 20px; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <a href="/" className="nav-logo">SenCompta IA</a>
        <div className="nav-links">
          <a href="#demo"     className="nav-link">Démo</a>
          <a href="#features" className="nav-link">Fonctionnalités</a>
          <a href="/pricing"  className="nav-link">Tarifs</a>
          <a href="/auth/login" className="nav-cta">Connexion →</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-inner">
          <div className="hero-badge">✦ Propulsé par Google Gemini</div>
          <h1 className="hero-title">
            La comptabilité<br />
            <em>par WhatsApp</em><br />
            pour les commerçants
          </h1>
          <p className="hero-sub">
            Envoyez vos opérations en <strong>français ou en wolof</strong>. L'IA enregistre, catégorise et analyse. Votre bilan en temps réel.
          </p>
          <div className="hero-ctas">
            <a href="/auth/login" className="btn-hero-primary">Commencer gratuitement →</a>
            <a href="#demo"       className="btn-hero-secondary">Voir la démo</a>
          </div>
          <div className="hero-stats">
            {[
              { num: '< 5s', lbl: 'Saisie par WhatsApp' },
              { num: 'FR + WO', lbl: 'Français & Wolof' },
              { num: '3 000', lbl: 'FCFA / mois Standard' },
              { num: '99%', lbl: 'Précision de l\'IA' },
            ].map((s, i) => (
              <div key={i} className="stat-item">
                <span className="stat-num">{s.num}</span>
                <span className="stat-lbl">{s.lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO INTERACTIVE */}
      <section id="demo" className="demo-section">
        <div className="section-label">Essai en direct</div>
        <h2 className="section-title">Testez l'IA maintenant</h2>
        <div className="demo-card">
          <div className="demo-whatsapp">
            <div className="wa-header">
              <div className="wa-avatar">SC</div>
              <span className="wa-name">SenCompta Bot</span>
            </div>
            <div className="wa-bubble">Bonjour ! 👋 Envoyez-moi une opération en français ou en wolof.</div>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#8A9E8F', marginBottom: '10px' }}>Exemples rapides :</p>
          <div className="demo-examples">
            {DEMO_EXAMPLES.map((ex) => (
              <span key={ex} className="demo-chip" onClick={() => setDemoInput(ex)}>{ex}</span>
            ))}
          </div>
          <div className="wa-input-row" style={{ marginBottom: '14px' }}>
            <input
              className="wa-input"
              value={demoInput}
              onChange={(e) => setDemoInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runDemo()}
              placeholder="Ex : vendu boubou 45000"
            />
            <button className="wa-send" onClick={runDemo} disabled={demoLoading}>
              {demoLoading ? '…' : '↑'}
            </button>
          </div>
          {demoResult && (
            <div className="demo-result">
              <div className="result-row">
                <span className="result-key">type</span>
                <span className={`result-val ${demoResult.type.toLowerCase()}`}>
                  {demoResult.type === 'RECETTE' ? '💰 RECETTE' : '💸 DEPENSE'}
                </span>
              </div>
              <div className="result-row">
                <span className="result-key">montant</span>
                <span className="result-val">{demoResult.montant.toLocaleString('fr-SN')} FCFA</span>
              </div>
              <div className="result-row">
                <span className="result-key">libelle</span>
                <span className="result-val">{demoResult.libelle}</span>
              </div>
              <div className="result-row">
                <span className="result-key">categorie</span>
                <span className="result-val">{demoResult.categorie}</span>
              </div>
              <div className="result-row">
                <span className="result-key">confiance</span>
                <span className="result-val" style={{ color: '#4CAF7D' }}>✓ {demoResult.confiance}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="features-section">
        <div className="section-label">Fonctionnalités</div>
        <h2 className="section-title">Tout ce dont vous avez besoin</h2>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <div className="section-label">Témoignages</div>
        <h2 className="section-title">Ils gèrent leur boutique avec SenCompta</h2>
        <div className="testi-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testi-card">
              <p className="testi-quote">"{t.text}"</p>
              <div className="testi-author">
                <div className="testi-avatar">{t.name[0]}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-role">{t.role}</div>
                </div>
                <span className="testi-plan">{t.plan}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="cta-title">Prêt à piloter votre boutique ?</h2>
        <p className="cta-sub">Démarrez en 2 minutes. Aucune installation. Paiement Wave ou Orange Money.</p>
        <div className="hero-ctas">
          <a href="/pricing"    className="btn-hero-primary">Voir les tarifs →</a>
          <a href="/auth/login" className="btn-hero-secondary">Connexion</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <span>© 2025 SenCompta IA — Dakar, Sénégal</span>
        <span>Propulsé par Google Gemini · PayTech.sn · WhatsApp Business</span>
      </footer>
    </>
  );
}
