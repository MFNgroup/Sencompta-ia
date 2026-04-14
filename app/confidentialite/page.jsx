// app/confidentialite/page.jsx
export const metadata = {
  title: 'Politique de confidentialité — SenCompta IA',
};

export default function Confidentialite() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D1B14; color: #EDE8DC; font-family: 'IBM Plex Sans', sans-serif; }
        .legal-page { max-width: 760px; margin: 0 auto; padding: 60px 24px 80px; }
        .legal-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 48px; padding-bottom: 20px; border-bottom: 1px solid #1E3328; }
        .nav-logo { font-family: 'Playfair Display', serif; color: #C9A84C; font-size: 1.3rem; text-decoration: none; }
        .nav-back { font-size: 0.85rem; color: #8A9E8F; text-decoration: none; }
        .nav-back:hover { color: #EDE8DC; }
        .legal-title { font-family: 'Playfair Display', serif; font-size: 2.2rem; margin-bottom: 8px; }
        .legal-date { font-size: 0.8rem; color: #8A9E8F; margin-bottom: 48px; }
        .legal-section { margin-bottom: 36px; }
        .legal-section h2 { font-family: 'Playfair Display', serif; font-size: 1.2rem; color: #C9A84C; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #1E3328; }
        .legal-section p { font-size: 0.9rem; color: #C4C9BE; line-height: 1.8; margin-bottom: 10px; }
        .legal-section ul { padding-left: 20px; }
        .legal-section ul li { font-size: 0.9rem; color: #C4C9BE; line-height: 1.8; margin-bottom: 8px; }
        .highlight { color: #C9A84C; font-weight: 600; }
        .rights-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
        .right-card { background: #122019; border: 1px solid #1E3328; border-radius: 10px; padding: 14px 16px; }
        .right-card .right-title { font-size: 0.82rem; font-weight: 600; color: #C9A84C; margin-bottom: 4px; }
        .right-card .right-desc { font-size: 0.78rem; color: #8A9E8F; line-height: 1.5; }
        .info-box { background: rgba(201,168,76,0.06); border: 1px solid rgba(201,168,76,0.2); border-radius: 12px; padding: 18px 22px; margin-top: 12px; }
        .info-box p { font-size: 0.87rem; color: #C4C9BE; line-height: 1.7; margin: 0; }
        .footer-links { margin-top: 48px; padding-top: 24px; border-top: 1px solid #1E3328; display: flex; gap: 24px; flex-wrap: wrap; }
        .footer-links a { font-size: 0.82rem; color: #8A9E8F; text-decoration: none; }
        .footer-links a:hover { color: #C9A84C; }
        @media (max-width: 600px) { .rights-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="legal-page">
        <nav className="legal-nav">
          <a href="/" className="nav-logo">SenCompta IA</a>
          <a href="/" className="nav-back">← Retour à l'accueil</a>
        </nav>

        <h1 className="legal-title">Politique de confidentialité</h1>
        <p className="legal-date">Dernière mise à jour : avril 2025 — Conforme à la Loi n°2008-12 (Sénégal)</p>

        <div className="legal-section">
          <h2>1. Responsable du traitement</h2>
          <p>Le responsable du traitement des données personnelles collectées via SenCompta IA est l'entrepreneur individuel éditeur du service, joignable à l'adresse : <span className="highlight">dnledaf@gmail.com</span></p>
        </div>

        <div className="legal-section">
          <h2>2. Données collectées</h2>
          <p>Dans le cadre de l'utilisation du service, nous collectons les données suivantes :</p>
          <ul>
            <li><strong>Numéro de téléphone WhatsApp</strong> — identifiant unique de connexion</li>
            <li><strong>Nom de la boutique</strong> — fourni volontairement lors de l'inscription</li>
            <li><strong>Transactions comptables</strong> — montants, libellés, catégories, dates saisies via WhatsApp</li>
            <li><strong>Données de paiement</strong> — traitées exclusivement par PayTech.sn, non stockées sur nos serveurs</li>
            <li><strong>Données de connexion</strong> — tokens temporaires, horodatages de session</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>3. Finalités du traitement</h2>
          <p>Vos données sont utilisées exclusivement pour :</p>
          <ul>
            <li>Fournir le service de comptabilité assistée par IA</li>
            <li>Authentifier et sécuriser votre accès au dashboard</li>
            <li>Générer vos rapports et analyses financières personnalisés</li>
            <li>Gérer votre abonnement et les paiements associés</li>
            <li>Améliorer la qualité du service (données agrégées et anonymisées uniquement)</li>
          </ul>
          <div className="info-box">
            <p>🔒 <strong>Aucune donnée n'est vendue, louée ou cédée à des tiers.</strong> Vos informations comptables ne sont jamais partagées sans votre consentement explicite.</p>
          </div>
        </div>

        <div className="legal-section">
          <h2>4. Rôle de l'intelligence artificielle</h2>
          <p>SenCompta IA utilise <span className="highlight">un moteur d'analyse IA</span> pour interpréter vos messages et générer des analyses. À ce titre :</p>
          <ul>
            <li>Vos messages WhatsApp sont transmis à l'API Google Gemini pour traitement</li>
            <li>Google Gemini est soumis aux conditions d'utilisation de Google LLC</li>
            <li>Les données transmises sont utilisées uniquement pour générer une réponse contextuelle</li>
            <li><strong>L'IA est un assistant automatisé — ses analyses ne remplacent pas un expert-comptable agréé</strong></li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>5. Durée de conservation</h2>
          <ul>
            <li><strong>Données de compte</strong> — conservées pendant la durée de l'abonnement + 12 mois après résiliation</li>
            <li><strong>Transactions comptables</strong> — conservées 5 ans conformément aux obligations légales comptables</li>
            <li><strong>Tokens de connexion</strong> — supprimés automatiquement après 15 minutes</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>6. Vos droits (Loi n°2008-12)</h2>
          <p>Conformément à la loi sénégalaise sur la protection des données personnelles, vous disposez des droits suivants :</p>
          <div className="rights-grid">
            <div className="right-card">
              <div className="right-title">Droit d'accès</div>
              <div className="right-desc">Obtenir une copie de vos données personnelles détenues</div>
            </div>
            <div className="right-card">
              <div className="right-title">Droit de rectification</div>
              <div className="right-desc">Corriger des données inexactes ou incomplètes</div>
            </div>
            <div className="right-card">
              <div className="right-title">Droit de suppression</div>
              <div className="right-desc">Demander l'effacement de vos données personnelles</div>
            </div>
            <div className="right-card">
              <div className="right-title">Droit d'opposition</div>
              <div className="right-desc">Vous opposer à certains traitements de vos données</div>
            </div>
          </div>
          <p style={{ marginTop: 16 }}>Pour exercer ces droits, contactez-nous à : <span className="highlight">dnledaf@gmail.com</span>. Nous répondons sous 30 jours maximum.</p>
          <p>Vous pouvez également saisir la <span className="highlight">Commission de Protection des Données Personnelles (CDP)</span> du Sénégal en cas de litige.</p>
        </div>

        <div className="legal-section">
          <h2>7. Sécurité des données</h2>
          <ul>
            <li>Toutes les communications sont chiffrées via <strong>HTTPS/TLS</strong></li>
            <li>Les mots de passe ne sont pas utilisés — authentification par token unique à usage unique</li>
            <li>La base de données est hébergée sur <strong>Railway (Europe)</strong> avec accès restreint</li>
            <li>Les tokens d'accès expirent automatiquement</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>8. Modifications</h2>
          <p>Nous nous réservons le droit de modifier cette politique à tout moment. Les utilisateurs seront informés par WhatsApp de tout changement substantiel. La version en vigueur est toujours accessible sur cette page.</p>
        </div>

        <div className="footer-links">
          <a href="/mentions-legales">Mentions légales</a>
          <a href="/pricing">Tarifs</a>
          <a href="/auth/login">Connexion</a>
        </div>
      </div>
    </>
  );
}
