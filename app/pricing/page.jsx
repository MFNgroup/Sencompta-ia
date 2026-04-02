'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import './pricing.css';

const PLANS = [
  {
    id: 'STANDARD',
    label: 'Standard',
    price: 10000,
    period: 'mois',
    tagline: 'Pour commencer à organiser vos finances',
    color: '#4CAF7D',
    features: [
      { ok: true,  text: 'Saisie texte WhatsApp (FR & Wolof)' },
      { ok: true,  text: 'Dashboard (CA, Charges, Net)' },
      { ok: true,  text: 'Bilan du jour, semaine, mois' },
      { ok: true,  text: 'Historique 30 jours' },
      { ok: true,  text: 'Export CSV mensuel' },
      { ok: false, text: 'Saisie vocale WhatsApp' },
      { ok: false, text: 'Conseils IA personnalisés' },
      { ok: false, text: 'Graphiques avancés' },
      { ok: false, text: 'Suivi créances clients' },
      { ok: false, text: 'Bilan annuel' },
    ],
  },
  {
    id: 'PREMIUM',
    label: 'Premium',
    price: 15000,
    period: 'mois',
    tagline: 'Pour piloter votre business comme un pro',
    color: '#C9A84C',
    popular: true,
    features: [
      { ok: true, text: 'Tout Standard, plus :' },
      { ok: true, text: 'Saisie vocale WhatsApp' },
      { ok: true, text: 'Validation IA avant enregistrement' },
      { ok: true, text: 'Conseils stratégiques IA / semaine' },
      { ok: true, text: 'Graphiques avancés interactifs' },
      { ok: true, text: 'Score de santé financière' },
      { ok: true, text: 'Suivi créances + relances' },
      { ok: true, text: 'Historique illimité + bilan annuel' },
      { ok: true, text: 'Rappels renouvellement WhatsApp' },
      { ok: true, text: 'Support prioritaire WhatsApp' },
    ],
  },
];

const FAQ = [
  {
    q: 'Comment fonctionne la saisie WhatsApp ?',
    a: "Enregistrez notre numéro, envoyez vos opérations en texte. L'IA comprend le français et le wolof. Ex : \"vendu tissus 25000\" ou \"jënd légumes 8500\".",
  },
  {
    q: 'Comment se passe le renouvellement ?',
    a: "Vous recevrez un rappel WhatsApp 3 jours avant expiration, puis le jour J. Cliquez le lien, payez — l'abonnement est prolongé immédiatement depuis la date d'expiration, sans interruption.",
  },
  {
    q: 'Mes données sont-elles conservées après expiration ?',
    a: "Oui. Toutes vos transactions et votre historique restent intacts. Vous reprenez là où vous vous êtes arrêté.",
  },
  {
    q: 'Puis-je changer de plan ?',
    a: "Oui. Passer au Premium prolonge votre accès depuis votre date d'expiration actuelle.",
  },
  {
    q: "Y a-t-il un engagement ?",
    a: "Aucun. Abonnement mensuel sans engagement. Arrêt possible à tout moment.",
  },
];

function PricingContent() {
  const searchParams  = useSearchParams();
  const paymentStatus = searchParams.get('payment');
  const [loading, setLoading] = useState(null);

  const handleCheckout = async (planId) => {
    setLoading(planId);
    try {
      const res  = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.redirect_url)                     window.location.href = data.redirect_url;
      else if (data.error === 'Non authentifié') window.location.href = '/auth/login';
      else                                        alert('Erreur. Veuillez réessayer.');
    } catch {
      alert('Erreur réseau.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="pricing-page">

      <nav className="top-nav">
        <a href="/" className="nav-logo">SenCompta IA</a>
        <div className="nav-links">
          <a href="/dashboard" className="nav-link">Dashboard</a>
          <a href="/auth/login" className="nav-cta">Connexion</a>
        </div>
      </nav>

      <div className="pricing-header">
        <div className="pricing-eyebrow">Abonnements</div>
        <h1 className="pricing-title">
          Gérez votre boutique<br />
          <em>comme un expert-comptable</em>
        </h1>
        <p className="pricing-sub">
          Saisie WhatsApp en français et wolof, analyse IA Gemini.<br />
          Paiement Wave ou Orange Money. Sans engagement.
        </p>
      </div>

      {paymentStatus === 'cancelled' && (
        <div className="alert error">Paiement annulé. Vous pouvez réessayer.</div>
      )}
      {paymentStatus === 'success' && (
        <div className="alert success">Paiement confirmé ! Votre abonnement est actif.</div>
      )}

      <div className="plans-grid">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${plan.popular ? 'popular' : ''}`}
            style={{ '--plan-color': plan.color }}
          >
            {plan.popular && <div className="popular-tag">Recommandé</div>}
            <div className="plan-label">{plan.label}</div>
            <div className="plan-tagline">{plan.tagline}</div>
            <div className="plan-price">
              <span className="price-amount">{plan.price.toLocaleString('fr-SN')}</span>
              <span className="price-currency"> FCFA</span>
              <span className="price-period">/{plan.period}</span>
            </div>
            <div className="plan-features">
              {plan.features.map((f, i) => (
                <div key={i} className="feature-row">
                  <span className={`feature-check ${f.ok ? 'ok' : 'no'}`}>{f.ok ? '✓' : '–'}</span>
                  <span className={`feature-text ${f.ok ? '' : 'no'}`}>{f.text}</span>
                </div>
              ))}
            </div>
            <button
              className={`btn-plan ${plan.popular ? 'primary' : 'secondary'}`}
              onClick={() => handleCheckout(plan.id)}
              disabled={loading === plan.id}
            >
              {loading === plan.id
                ? 'Redirection…'
                : `Choisir ${plan.label} — ${plan.price.toLocaleString('fr-SN')} FCFA`}
            </button>
          </div>
        ))}
      </div>

      <div className="payment-methods">
        <p className="pm-title">Paiement sécurisé via PayTech.sn</p>
        <div className="pm-logos">
          <div className="pm-logo">Wave</div>
          <div className="pm-logo">Orange Money</div>
          <div className="pm-logo">Free Money</div>
        </div>
      </div>

      <div className="continuity-banner">
        <div className="continuity-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <div className="continuity-title">Continuité garantie</div>
          <div className="continuity-text">
            Rappel WhatsApp 3 jours avant expiration. Données conservées indéfiniment.
            Le renouvellement prolonge depuis la date d'expiration — aucune coupure si vous renouvelez à temps.
          </div>
        </div>
      </div>

      <div className="pwa-banner">
        <div className="pwa-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
            <line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
        </div>
        <div>
          <div className="pwa-title">Accès rapide depuis votre téléphone</div>
          <div className="pwa-steps">
            Ajoutez SenCompta IA à votre écran d'accueil pour un accès en un clic :<br />
            <strong>iPhone :</strong> Safari → icône Partager → "Sur l'écran d'accueil"<br />
            <strong>Android :</strong> Chrome → menu (⋮) → "Ajouter à l'écran d'accueil"
          </div>
        </div>
      </div>

      <div className="faq">
        <h2 className="faq-title">Questions fréquentes</h2>
        {FAQ.map((item, i) => (
          <div key={i} className="faq-item">
            <div className="faq-q">{item.q}</div>
            <div className="faq-a">{item.a}</div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div style={{ background: '#0D1B14', minHeight: '100vh' }} />}>
      <PricingContent />
    </Suspense>
  );
}    features: [
      { ok: true, text: 'Tout Standard, plus :' },
      { ok: true, text: 'Saisie vocale WhatsApp 🎙️' },
      { ok: true, text: 'Validation IA avant enregistrement' },
      { ok: true, text: '3 conseils stratégiques IA / semaine' },
      { ok: true, text: 'Graphiques avancés interactifs' },
      { ok: true, text: 'Score de santé financière' },
      { ok: true, text: 'Suivi des créances + relances' },
      { ok: true, text: 'Historique illimité + bilan annuel' },
      { ok: true, text: 'Rappels automatiques WhatsApp' },
      { ok: true, text: 'Support prioritaire WhatsApp' },
    ],
  },
];

const FAQ = [
  {
    q: 'Comment fonctionne la saisie WhatsApp ?',
    a: "Enregistrez notre numéro WhatsApp, puis envoyez vos opérations en texte. L'IA comprend le français et le wolof. Ex : \"vendu tissus 25000\" ou \"jënd légumes 8500\".",
  },
  {
    q: "Comment se passe le renouvellement ?",
    a: "Vous recevrez un rappel WhatsApp 3 jours avant l'expiration, puis le jour J. Cliquez le lien dans le message, payez en Wave ou Orange Money — votre abonnement est prolongé immédiatement depuis la date d'expiration, sans interruption.",
  },
  {
    q: "Mes données sont-elles conservées après expiration ?",
    a: "Oui. Toutes vos transactions, votre historique et votre dashboard restent intacts. Vous pouvez reprendre là où vous vous êtes arrêté à tout moment.",
  },
  {
    q: "Puis-je changer de plan ?",
    a: "Oui. Passer au Premium prolonge votre accès Premium immédiatement depuis votre date d'expiration actuelle.",
  },
  {
    q: 'Y a-t-il un engagement minimum ?',
    a: "Aucun. Chaque abonnement est mensuel et sans engagement. Vous pouvez arrêter à tout moment.",
  },
];

function PricingContent() {
  const searchParams  = useSearchParams();
  const paymentStatus = searchParams.get('payment');
  const [loading, setLoading] = useState(null);

  const handleCheckout = async (planId) => {
    setLoading(planId);
    try {
      const res  = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.redirect_url)                    window.location.href = data.redirect_url;
      else if (data.error === 'Non authentifié') window.location.href = '/auth/login';
      else                                       alert('Erreur lors de la redirection. Veuillez réessayer.');
    } catch { alert('Erreur réseau.'); }
    finally  { setLoading(null); }
  };

  return (
    <div className="pricing-page">
      <nav className="top-nav">
        <a href="/" className="nav-logo">SenCompta IA</a>
        <div className="nav-links">
          <a href="/dashboard" className="nav-link">Dashboard</a>
          <a href="/auth/login" className="nav-cta">Connexion</a>
        </div>
      </nav>

      <div className="pricing-header">
        <div className="pricing-eyebrow">Abonnements</div>
        <h1 className="pricing-title">
          Gérez votre boutique<br />
          <em>comme un expert-comptable</em>
        </h1>
        <p className="pricing-sub">
          Saisie WhatsApp en français et wolof, analyse IA Gemini, conseils personnalisés.<br />
          Paiement Wave ou Orange Money. Sans engagement.
        </p>
      </div>

      {paymentStatus === 'cancelled' && (
        <div className="alert error">
          ✕ Le paiement a été annulé. Vous pouvez réessayer quand vous voulez.
        </div>
      )}
      {paymentStatus === 'success' && (
        <div className="alert success">
          ✓ Paiement confirmé ! Votre abonnement est actif. Rendez-vous sur votre dashboard.
        </div>
      )}

      <div className="plans-grid">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${plan.popular ? 'popular' : ''}`}
            style={{ '--plan-color': plan.color }}
          >
            {plan.popular && <div className="popular-tag">⭐ Recommandé</div>}
            <div className="plan-label">{plan.label}</div>
            <div className="plan-tagline">{plan.tagline}</div>
            <div className="plan-price">
              <span className="price-amount">{plan.price.toLocaleString('fr-SN')}</span>
              <span className="price-currency">FCFA</span>
              <span className="price-period">/{plan.period}</span>
            </div>
            <div className="plan-features">
              {plan.features.map((f, i) => (
                <div key={i} className="feature-row">
                  <span className={`feature-check ${f.ok ? 'ok' : 'no'}`}>{f.ok ? '✓' : '–'}</span>
                  <span className={`feature-text ${f.ok ? '' : 'no'}`}>{f.text}</span>
                </div>
              ))}
            </div>
            <button
              className={`btn-plan ${plan.popular ? 'primary' : 'secondary'}`}
              onClick={() => handleCheckout(plan.id)}
              disabled={loading === plan.id}
            >
              {loading === plan.id
                ? 'Redirection…'
                : `Choisir ${plan.label} — ${plan.price.toLocaleString('fr-SN')} FCFA`}
            </button>
          </div>
        ))}
      </div>

      {/* Méthodes de paiement */}
      <div className="payment-methods">
        <p className="pm-title">Paiement sécurisé via PayTech.sn</p>
        <div className="pm-logos">
          <div className="pm-logo">Wave</div>
          <div className="pm-logo">Orange Money</div>
          <div className="pm-logo">Free Money</div>
        </div>
      </div>

      {/* Garantie continuité */}
      <div className="continuity-banner">
        <div className="continuity-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <div className="continuity-title">Continuité garantie</div>
          <div className="continuity-text">
            Rappel WhatsApp 3 jours avant expiration. Vos données sont conservées indéfiniment.
            Le renouvellement prolonge depuis la date d'expiration — jamais de coupure si vous renouvelez à temps.
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="faq">
        <h2 className="faq-title">Questions fréquentes</h2>
        {FAQ.map((item, i) => (
          <div key={i} className="faq-item">
            <div className="faq-q">{item.q}</div>
            <div className="faq-a">{item.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div style={{ background: '#0D1B14', minHeight: '100vh' }} />}>
      <PricingContent />
    </Suspense>
  );
}  },
];

const FAQ = [
  { q: 'Comment fonctionne la saisie WhatsApp ?', a: "Enregistrez notre numéro WhatsApp, puis envoyez vos opérations en texte ou vocal. L'IA comprend le français et le wolof." },
  { q: "Puis-je changer de plan en cours d'abonnement ?", a: "Oui. Passer au Premium prolonge votre accès Premium immédiatement." },
  { q: 'Mes données sont-elles sécurisées ?', a: "Vos données sont hébergées en Europe sur des serveurs sécurisés. La connexion est chiffrée (HTTPS)." },
  { q: 'Y a-t-il un engagement minimum ?', a: "Aucun. Chaque abonnement est mensuel et sans engagement." },
];

function PricingContent() {
  const searchParams  = useSearchParams();
  const paymentStatus = searchParams.get('payment');
  const [loading, setLoading] = useState(null);

  const handleCheckout = async (planId) => {
    setLoading(planId);
    try {
      const res  = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: planId }) });
      const data = await res.json();
      if (data.redirect_url)            window.location.href = data.redirect_url;
      else if (data.error === 'Non authentifié') window.location.href = '/auth/login';
      else alert('Erreur lors de la redirection. Veuillez réessayer.');
    } catch { alert('Erreur réseau.'); }
    finally  { setLoading(null); }
  };

  return (
    <div className="pricing-page">
      <nav className="top-nav">
        <a href="/" className="nav-logo">SenCompta IA</a>
        <div className="nav-links">
          <a href="/dashboard" className="nav-link">Dashboard</a>
          <a href="/auth/login" className="nav-cta">Connexion</a>
        </div>
      </nav>

      <div className="pricing-header">
        <div className="pricing-eyebrow">Abonnements</div>
        <h1 className="pricing-title">Gérez votre boutique<br /><em>comme un expert-comptable</em></h1>
        <p className="pricing-sub">Saisie WhatsApp en français et wolof, analyse IA Gemini. Paiement Wave ou Orange Money.</p>
      </div>

      {paymentStatus === 'cancelled' && (
        <div className="alert error">✕ Le paiement a été annulé. Vous pouvez réessayer quand vous voulez.</div>
      )}

      <div className="plans-grid">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`plan-card ${plan.popular ? 'popular' : ''}`} style={{ '--plan-color': plan.color }}>
            {plan.popular && <div className="popular-tag">⭐ Recommandé</div>}
            <div className="plan-label">{plan.label}</div>
            <div className="plan-tagline">{plan.tagline}</div>
            <div className="plan-price">
              <span className="price-amount">{plan.price.toLocaleString('fr-SN')}</span>
              <span className="price-currency">FCFA</span>
              <span className="price-period">/{plan.period}</span>
            </div>
            <div className="plan-features">
              {plan.features.map((f, i) => (
                <div key={i} className="feature-row">
                  <span className={`feature-check ${f.ok ? 'ok' : 'no'}`}>{f.ok ? '✓' : '–'}</span>
                  <span className={`feature-text ${f.ok ? '' : 'no'}`}>{f.text}</span>
                </div>
              ))}
            </div>
            <button className={`btn-plan ${plan.popular ? 'primary' : 'secondary'}`} onClick={() => handleCheckout(plan.id)} disabled={loading === plan.id}>
              {loading === plan.id ? '⌛ Redirection…' : `Choisir ${plan.label} — ${plan.price.toLocaleString('fr-SN')} FCFA`}
            </button>
          </div>
        ))}
      </div>

      <div className="payment-methods">
        <p className="pm-title">Paiement sécurisé via PayTech.sn</p>
        <div className="pm-logos">
          <div className="pm-logo">🌊 Wave</div>
          <div className="pm-logo">🟠 Orange Money</div>
          <div className="pm-logo">🆓 Free Money</div>
        </div>
      </div>

      <div className="faq">
        <h2 className="faq-title">Questions fréquentes</h2>
        {FAQ.map((item, i) => (
          <div key={i} className="faq-item">
            <div className="faq-q">{item.q}</div>
            <div className="faq-a">{item.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div style={{ background: '#0D1B14', minHeight: '100vh' }} />}>
      <PricingContent />
    </Suspense>
  );
}
