# Diet Tracker

Application web personnelle de suivi quotidien, installable en **Progressive Web App (PWA)**.

Elle permet de noter au fil des jours :

- le poids
- l'alimentation et les calories consommées
- le sport et les calories dépensées
- l'hydratation
- le sommeil
- les notes journalières
- l'évolution de ces données dans le temps (graphiques)

Conçue **mobile-first**, elle reste pleinement utilisable sur desktop. Usage privé via réseau Tailscale (pas d'exposition Internet publique).

---

## Fonctionnalités

### Poids

- Une mesure par jour
- Historique et courbe d'évolution

### Alimentation

Saisie des aliments de la journée :

- Nom
- Quantité (grammes ou millilitres)
- Calories pour 100 g / 100 ml

Calcul automatique des calories de chaque ligne et du total journalier :

```txt
Calories = (Quantité × Calories/100) / 100
```

### Sport

Plusieurs activités par jour :

- Nom, durée (minutes), calories dépensées
- Ajout / modification / suppression
- Total des calories dépensées calculé automatiquement

### Hydratation

- Volume consommé (litres et centilitres)
- Une saisie par jour

### Sommeil

- Heure de coucher / réveil, commentaire optionnel
- Interruptions (début, fin, commentaire) — modèle et API prêts ; UI d'interruptions non exposée
- Calculs : temps au lit, interruptions, sommeil net

### Notes du jour

Champ libre (ressenti, énergie, remarques).

### Statistiques

Graphiques Chart.js (page `/graphiques` + widget desktop sur le dashboard) :

- poids, calories alimentation, durée de sommeil
- périodes : 7 j, 30 j, mois, 3 m, 6 m, 1 an, ou plage personnalisée

### Authentification multi-comptes

- Plusieurs utilisateurs, données isolées par `UserID`
- Inscription ouverte (`/register`) ou création via CLI
- Mot de passe hashé (Argon2), session cookie
- Suppression des données ou du compte (confirmation par mot de passe)

### PWA

- Installation sur l'écran d'accueil, plein écran, icône dédiée

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19, TypeScript, Vite, react-router-dom, Chart.js, vite-plugin-pwa |
| Backend | Node.js, Fastify 5, Zod, Argon2, @fastify/session |
| Base de données | SQLite (`better-sqlite3`) |
| Styles | CSS Modules + design tokens |
| Prod | Caddy + scripts PowerShell (`deploy/`) |
| Réseau | Tailscale |

---

## Structure du dépôt

```txt
.
├── frontend/          # SPA React (Vite) — :5173 en dev
├── backend/           # API Fastify — :3000 en dev
├── data/              # Base SQLite (diettracker.db, créée au démarrage)
├── deploy/            # Scripts prod Windows (Caddy, install, boot)
├── diettracker.sql    # Schéma SQL de référence
├── bdd_scheme.jpg     # Diagramme du modèle de données
└── ai/app.md          # Contexte technique pour l'agent IA
```

### Backend (`backend/src/`)

```txt
routes/ → services/ → repositories/ → SQLite
```

Séparation stricte : validation Zod dans les routes/schémas, logique métier dans les services, SQL dans les repositories.

### Frontend (`frontend/src/`)

- `pages/` — Login/Register, Dashboard, Graphiques
- `components/` — dashboard, layout, UI, auth
- `hooks/` — journal du jour, stats graphiques, media query
- `api/` — client HTTP (cookies session) + types
- `context/` — authentification

Breakpoint desktop : **1024px** (layouts mobile et desktop montés séparément).

---

## Démarrage rapide (développement)

Prérequis : Node.js (LTS recommandé).

```bash
# Terminal 1 — Backend (:3000)
cd backend
cp .env.example .env   # si besoin
npm install
npm run dev

# Terminal 2 — Frontend (:5173, proxy /api → backend)
cd frontend
cp .env.example .env   # si besoin
npm install
npm run dev
```

Ouvrir `http://localhost:5173`.

### Utilisateurs (CLI)

```bash
cd backend
npm run user:create -- monidentifiant monmotdepasse   # créer
npm run user:set -- monidentifiant monmotdepasse      # créer ou maj mot de passe
npm run db:init                                       # (ré)initialiser le schéma
```

Inscription aussi disponible dans l'UI via `/register`.

> Si `better-sqlite3` échoue après un changement de version Node :  
> `cd backend && npm rebuild better-sqlite3`

Base SQLite par défaut : `data/diettracker.db` (chemin configurable via `DATABASE_PATH` dans `backend/.env`).

---

## Architecture

```txt
┌────────────────────────────┐
│ React SPA + PWA            │
│ Dashboard / Graphiques     │
│ Login · Register           │
└──────────────┬─────────────┘
               │ REST /api/*
               ▼
┌────────────────────────────┐
│ Fastify                    │
│ Routes · Services · Repos  │
└──────────────┬─────────────┘
               ▼
┌────────────────────────────┐
│ SQLite                     │
└────────────────────────────┘
```

---

## Modèle de données

Schéma source : [`diettracker.sql`](diettracker.sql) · aperçu : [`bdd_scheme.jpg`](bdd_scheme.jpg).

| Table | Rôle |
|-------|------|
| `User` | Comptes (username + hash Argon2) |
| `Journal` | Une ligne par utilisateur et par jour (poids, hydratation, notes) |
| `FoodEntry` | Aliments liés à un journal (`Unit` : `g` \| `ml`) |
| `SportActivity` | Activités liées à un journal |
| `Sleep` | Une entrée sommeil par journal |
| `SleepInterruption` | Interruptions liées au sommeil |

Les suppressions cascade depuis `User` / `Journal` / `Sleep`.

---

## API REST

Préfixe côté frontend : `/api` (proxy Vite ou Caddy). Toutes les routes métier exigent une session authentifiée.

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/login` | Connexion |
| POST | `/auth/register` | Inscription |
| GET | `/auth/status` | `{ hasUser }` |
| GET | `/auth/me` | Utilisateur courant |
| POST | `/auth/logout` | Déconnexion |
| DELETE | `/auth/data` | Efface les données du compte (`{ password }`) |
| DELETE | `/auth/account` | Supprime le compte (`{ password }`) |

### Journal & saisie

| Méthode | Endpoint |
|---------|----------|
| GET | `/journal/:date` |
| PUT | `/journal/:date` |
| PATCH | `/journal/:date/weight` |
| PATCH | `/journal/:date/hydration` |
| POST | `/journal/:date/foods` |
| PUT / DELETE | `/foods/:id` |
| POST | `/journal/:date/activities` |
| PUT / DELETE | `/activities/:id` |
| POST | `/journal/:date/sleep` |
| PUT | `/sleep/:id` |
| GET | `/stats?from=YYYY-MM-DD&to=YYYY-MM-DD` |

---

## Interface

### Routes

| Route | Accès |
|-------|--------|
| `/login`, `/register` | public |
| `/` (dashboard) | authentifié |
| `/graphiques` | authentifié |

### Dashboard

Navigation jour : précédent · aujourd'hui · suivant.

Objectif : saisir une journée complète en moins d'une minute.

- **Mobile** : résumé + sections empilées + nav bas (Accueil, Graphiques, Déconnexion)
- **Desktop** : sidebar (user + récap) + grille (poids / alim / sport, graphiques, hydratation / sommeil / notes)

Actions compte (haut droite) : supprimer mes données / supprimer mon compte.

---

## Déploiement production

Scripts Windows dans `deploy/` (cible typique : mini PC derrière Tailscale) :

| Script | Rôle |
|--------|------|
| `install.ps1` | Installation (npm ci, `.env`, build) |
| `start.ps1` / `stop.ps1` | Démarrage / arrêt (backend + Caddy) |
| `register-startup.ps1` | Lancement au boot Windows |
| `Caddyfile` | Reverse proxy : frontend statique + `/api` → `:3000` |

Exemples de config : `deploy/backend.env.example`, `deploy/frontend.env.production`.

URL typique : `http://<ip-tailscale>:8080`.

---

## Sécurité

- Mots de passe hashés avec Argon2
- Session cookie `httpOnly` (7 jours, `sameSite: lax`)
- Validation serveur systématique (Zod)
- Accès limité au réseau privé (Tailscale) — pas d'accès public Internet

---

## Philosophie

- Simplicité maximale, mobile-first
- Rapide à utiliser au quotidien
- Architecture claire, sans sur-ingénierie

---

## Évolutions envisagées

- Mode hors ligne / sync différée
- Notifications PWA de rappel
- Export CSV / JSON
- UI des interruptions de sommeil
- Analyse / corrélations de tendances

---

## Documentation complémentaire

| Fichier | Contenu |
|---------|---------|
| [`ai/app.md`](ai/app.md) | Guide technique détaillé (routes, composants, pièges connus) pour reprise IA |
| [`diettracker.sql`](diettracker.sql) | Schéma SQLite |
| [`deploy/`](deploy/) | Procédure et config de production |

---

## Statut

Fonctionnel — usage personnel (Tailscale). Développement principal terminé (juin 2026).
