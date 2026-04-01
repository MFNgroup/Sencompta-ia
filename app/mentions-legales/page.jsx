// app/mentions-legales/page.jsx
export const metadata = {
  title: 'Mentions légales — SenCompta IA',
};

export default function MentionsLegales() {
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
        .legal-section ul li { font-size: 0.9rem; color: #C4C9BE; line-height: 1.8; margin-bottom: 6px; }
        .highlight { color: #C9A84C; font-weight: 600; }
        .disclaimer-box { background: rgba(224,123,84,0.08); border: 1px solid rgba(224,123,84,0.25); border-radius: 12px; padding: 20px 24px; margin-top: 12px; }
        .disclaimer-box p { color: #E07B54; font-size: 0.88rem; line-height: 1.7; margin: 0; }
        .footer-links { margin-top: 48px; padding-top: 24px; border-top: 1px solid #1E3328; display: flex; gap: 24px; flex-wrap: wrap; }
        .footer-links a { font-size: 0.82rem; color: #8A9E8F; text-decoration: none; }
        .footer-links a:hover { color: #C9A84C; }
      `}</style>

      <div className="legal-page">
        <nav className="legal-nav">
          <a href="/" className="nav-logo">SenCompta IA</a>
          <a href="/" className="nav-back">← Retour à l'accueil</a>
        </nav>

        <h1 className="legal-title">Mentions légales</h1>
        <p className="legal-date">Dernière mise à jour : avril 2025</p>

        <div className="legal-section">
          <h2>1. Éditeur du service</h2>
          <p>Le service <span className="highlight">SenCompta IA</span> est édité par un entrepreneur individuel domicilié à <span className="highlight">Dakar, Sénégal</span>.</p>
          <p>Contact : <span className="highlight">dnledaf@gmail.com</span></p>
        </div>

        <div className="legal-section">
          <h2>2. Hébergement</h2>
          <p>Le site est hébergé par <span className="highlight">Vercel Inc.</span>, 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.</p>
          <p>Les données utilisateurs sont stockées sur <span className="highlight">Railway</span>, infrastructure hébergée en Europe, conforme aux standards internationaux de sécurité des données.</p>
        </div>

        <div className="legal-section">
          <h2>3. Propriété intellectuelle</h2>
          <p>L'ensemble du contenu du service SenCompta IA (textes, interfaces, code, graphismes, marque) est la propriété exclusive de l'éditeur. Toute reproduction, même partielle, sans autorisation écrite préalable est interdite.</p>
        </div>

        <div className="legal-section">
          <h2>4. Limitation de responsabilité</h2>
          <div className="disclaimer-box">
            <p>⚠️ <strong>SenCompta IA est un outil d'assistance comptable automatisé.</strong> Les analyses, conseils et rapports générés par l'intelligence artificielle sont fournis à titre informatif uniquement. Ils ne constituent en aucun cas un service de comptabilité agréé, un conseil fiscal, juridique ou financier professionnel.</p>
          </div>
          <p style={{ marginTop: 12 }}>L'éditeur ne saurait être tenu responsable des décisions prises sur la base des informations fournies par le service. Pour toute décision financière importante, l'utilisateur est invité à consulter un expert-comptable agréé ou un conseiller fiscal qualifié.</p>
        </div>

        <div className="legal-section">
          <h2>5. Droit applicable</h2>
          <p>Le présent service est soumis au droit sénégalais, notamment :</p>
          <ul>
            <li>La <span className="highlight">Loi n°2008-12</span> du 25 janvier 2008 sur la protection des données à caractère personnel</li>
            <li>La <span className="highlight">Loi n°2008-08</span> du 25 janvier 2008 sur les transactions électroniques</li>
            <li>Le Code des obligations civiles et commerciales (COCC) du Sénégal</li>
          </ul>
          <p>Tout litige relatif à l'utilisation du service sera soumis aux tribunaux compétents de Dakar, Sénégal.</p>
        </div>

        <div className="legal-section">
          <h2>6. Autorité de contrôle</h2>
          <p>Le traitement des données personnelles est effectué dans le respect des dispositions de la loi n°2008-12 et sous le contrôle de la <span className="highlight">Commission de Protection des Données Personnelles (CDP)</span> du Sénégal.</p>
          <p>Site de la CDP : <span className="highlight">www.cdp.sn</span></p>
        </div>

        <div className="footer-links">
          <a href="/confidentialite">Politique de confidentialité</a>
          <a href="/pricing">Tarifs</a>
          <a href="/auth/login">Connexion</a>
        </div>
      </div>
    </>
  );
}
