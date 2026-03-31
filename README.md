# SenCompta IA — Guide de Déploiement Complet

> Stack : Next.js 14 · MySQL · Gemini 1.5 Flash · PayTech.sn · WhatsApp Business

---

## 📁 Arborescence du projet

```
sencompta-ia/
├── app/
│   ├── layout.jsx                    # Layout racine
│   ├── globals.css
│   ├── page.jsx                      # Landing page
│   ├── not-found.jsx                 # Page 404
│   ├── auth/
│   │   └── login/page.jsx            # Connexion Magic Link
│   ├── dashboard/
│   │   ├── layout.jsx                # Layout sidebar partagé
│   │   ├── page.jsx                  # Dashboard principal (KPIs, Recharts)
│   │   ├── transactions/page.jsx     # Liste & saisie transactions
│   │   ├── debts/page.jsx            # Gestion créances
│   │   └── settings/page.jsx         # Paramètres utilisateur
│   ├── pricing/
│   │   └── page.jsx                  # Tarifs + PayTech checkout
│   └── api/
│       ├── webhook/route.js          # WhatsApp + Gemini IA
│       ├── auth/
│       │   ├── magic-link/route.js   # Génération lien connexion
│       │   ├── verify/route.js       # Validation token → session JWT
│       │   └── logout/route.js       # Déconnexion
│       ├── user/me/route.js          # Profil utilisateur
│       ├── transactions/route.js     # CRUD transactions
│       ├── ai-advice/route.js        # Conseils Gemini (Premium)
│       ├── debts/
│       │   ├── route.js              # Liste + création créances
│       │   └── [id]/route.js         # PATCH (marquer payé)
│       ├── checkout/route.js         # Init paiement PayTech
│       └── callback/payment/route.js # IPN PayTech (webhook paiement)
├── lib/
│   ├── db.js                         # Pool MySQL + helpers
│   ├── auth.js                       # JWT session
│   └── whatsapp.js                   # Envoi messages WhatsApp
├── public/
│   └── manifest.json                 # PWA manifest
├── middleware.js                     # Protection des routes
├── schema.sql                        # Schéma MySQL complet
├── SenCompta_Postman_Collection.json # Tests API
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
├── package.json
└── .env.example                      # Variables d'environnement
```

---

## 1. Prérequis

- Node.js >= 18.x
- Compte Hostinger avec MySQL 8.0+
- Clé API Google AI Studio (Gemini) — gratuit : https://aistudio.google.com/app/apikey
- Compte PayTech.sn (mode test disponible)
- Numéro WhatsApp Business (Meta Cloud API, Twilio, ou 360Dialog)

---

## 2. Installation locale

```bash
git clone https://github.com/votreuser/sencompta-ia.git
cd sencompta-ia
npm install
cp .env.example .env.local
# → Remplir les variables dans .env.local
```

---

## 3. Base de données MySQL (Hostinger)

### Depuis le panneau Hostinger :
1. `hPanel` → `Bases de données` → Créer une base `sencompta`
2. Créer un utilisateur MySQL avec tous les droits sur cette base
3. Importer `schema.sql` via phpMyAdmin (Importer → Choisir le fichier)

### Remplir les variables dans `.env.local` :
```
DB_HOST=srv123.hostinger.com
DB_PORT=3306
DB_USER=u123456_sencompta
DB_PASSWORD=VotreMotDePasse
DB_NAME=u123456_sencompta
```

---

## 4. Configuration Google Gemini

1. Aller sur https://aistudio.google.com/app/apikey
2. Créer un projet → Générer une clé API
3. Ajouter dans `.env.local` :
```
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXX
```

---

## 5. Configuration PayTech.sn

1. S'inscrire sur https://paytech.sn
2. Tableau de bord → API Keys → Copier API_KEY et API_SECRET
3. Ajouter dans `.env.local` :
```
PAYTECH_API_KEY=votre_api_key
PAYTECH_API_SECRET=votre_api_secret
```
4. En mode test, les paiements Wave/Orange Money sont simulés.

---

## 6. Configuration WhatsApp Business

### Option A — Meta Cloud API (recommandé, gratuit) :
1. Créer une app Meta sur https://developers.facebook.com
2. Activer WhatsApp Business API
3. Récupérer Phone Number ID et Access Token permanent
4. Ajouter dans `.env.local` :
```
WHATSAPP_TOKEN=EAAxxxxx
WHATSAPP_PHONE_ID=123456789012345
```
5. Configurer le webhook entrant vers :
   `https://sencompta.sn/api/webhook`

### Option B — 360Dialog (plus simple) :
- Adapter `lib/whatsapp.js` pour utiliser leur API REST.

---

## 7. Déploiement sur Hostinger (Node.js)

Hostinger supporte Node.js via le panneau hPanel :

### Étape 1 — Préparer le build
```bash
npm run build
```

### Étape 2 — Upload via FTP ou Git
```bash
# Via hPanel → Git Repository
# ou FTP : uploader le dossier .next, lib, app, public, package.json, next.config.js
```

### Étape 3 — Configurer l'app Node.js sur Hostinger
Dans hPanel → `Hébergement Web` → `Node.js` :
- Version Node : 18.x ou 20.x
- Entry point : `node_modules/.bin/next`
- Start command : `npm start`

### Étape 4 — Variables d'environnement
Dans hPanel → section Node.js → Environment Variables :
Copier toutes les variables de `.env.local`

### Étape 5 — Démarrer l'application
Cliquer sur "Restart" dans le panneau Node.js

---

## 8. Tests API avec Postman

1. Ouvrir Postman
2. Importer `SenCompta_Postman_Collection.json`
3. Modifier la variable `BASE_URL` : `http://localhost:3000` (dev) ou `https://sencompta.sn` (prod)
4. Modifier la variable `PHONE` avec votre numéro test

### Ordre de test recommandé :
1. `POST /api/auth/magic-link` → récupérer le lien dans les logs
2. `GET /api/auth/verify?token=XXX` → obtenir la session cookie
3. `GET /api/user/me` → vérifier l'authentification
4. `POST /api/webhook` avec différents messages texte
5. `GET /api/transactions` → vérifier l'enregistrement
6. `GET /api/ai-advice` → tester les conseils IA (requires Premium)

---

## 9. Checklist de lancement

- [ ] Variables `.env.local` toutes renseignées
- [ ] `schema.sql` importé sur Hostinger MySQL
- [ ] `npm run build` sans erreur
- [ ] Webhook WhatsApp Business configuré
- [ ] Tests Postman webhook (texte FR + wolof) ✓
- [ ] Test Magic Link reçu sur WhatsApp
- [ ] Test paiement PayTech mode test
- [ ] IPN callback vérifié (abonnement activé en base)
- [ ] Domaine sencompta.sn configuré avec SSL
- [ ] manifest.json accessible sur /manifest.json (PWA)
- [ ] Google Analytics ou Plausible configuré

---

## 10. Modèle économique — Rappel

| Plan     | Prix          | Fonctionnalités clés                          |
|----------|---------------|-----------------------------------------------|
| Standard | 3 000 FCFA/mois | Saisie texte WhatsApp, Dashboard de base   |
| Premium  | 7 500 FCFA/mois | Vocal + Validation IA + Conseils + Graphiques avancés |

**Objectif mois 1** : 50 Standard + 20 Premium = **300 000 FCFA**
**Objectif mois 3** : 100 Standard + 50 Premium = **675 000 FCFA**
**Objectif mois 6** : 200 Standard + 100 Premium = **1 350 000 FCFA** → 1M FCFA/mois ✓

---

## 11. Support & Contact

- Email : support@sencompta.sn
- WhatsApp Business : numero_du_bot
- Documentation : https://sencompta.sn/docs

---

*Généré automatiquement · SenCompta IA MVP · Avril 2025*
