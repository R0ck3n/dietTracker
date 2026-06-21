# Diet Tracker

Application web personnelle de suivi quotidien, installable en **Progressive Web App (PWA)**, permettant de suivre :

- le poids
- l'alimentation
- le sport et les calories dépensées
- l'hydratation
- le sommeil
- les notes journalières
- l'évolution des données dans le temps

L'application est conçue pour être utilisée principalement sur mobile tout en restant parfaitement utilisable sur desktop.

> Projet à usage personnel — accès via réseau privé via Tailscale.

---

## Fonctionnalités

### Poids

- Une mesure de poids par jour
- Historique consultable
- Visualisation graphique de l'évolution

### Alimentation

Saisie des aliments consommés dans la journée :

- Nom de l'aliment
- Quantité (grammes)
- Calories pour 100 g

Calcul automatique :

```txt
Calories = (Poids × Calories/100g) / 100
```

Calcul automatique des calories totales de la journée.

### Sport

Saisie des activités physiques réalisées dans la journée :

- Nom de l'activité
- Durée (minutes)
- Calories dépensées

Fonctionnalités :

- Ajouter / modifier / supprimer une activité
- Plusieurs activités par jour
- Calcul automatique du total des calories dépensées

### Hydratation

- Volume consommé (litres et centilitres)
- Une seule saisie par jour

### Sommeil

- Heure de coucher
- Heure de réveil
- Commentaire optionnel

Gestion des interruptions :

- Heure de début
- Heure de fin
- Commentaire optionnel

Calcul automatique :

- Temps au lit
- Temps d'interruption
- Sommeil net

### Notes du jour

Champ libre permettant de consigner :

- ressenti
- énergie
- remarques diverses

### Statistiques

Graphiques réalisés avec Chart.js :

- évolution du poids
- calories consommées (alimentation)
- durée de sommeil
- **choix de période** : 7 j, 30 j, mois, 3 m, 6 m, 1 an, ou plage personnalisée (début / fin)

### Progressive Web App (PWA)

- Installation sur écran d'accueil
- Plein écran
- Icône dédiée
- Expérience proche d'une application native

### Authentification

- **Plusieurs comptes** — chaque utilisateur a ses propres données (isolées par `UserID` en base)
- Inscription ouverte via `/register` ou script CLI
- Login local, mot de passe hashé (Argon2)
- Session sécurisée par cookie
- Suppression des données ou du compte (confirmation par mot de passe)

---

## Stack technique

| Couche | Technologie |
|----------|----------|
| Frontend | React 19 (SPA) + TypeScript |
| Backend | Node.js + Fastify 5 |
| Base de données | SQLite (better-sqlite3) |
| Graphiques | Chart.js |
| PWA | Vite PWA Plugin |
| Déploiement prod | Caddy + scripts PowerShell (`deploy/`) |
| Réseau | Tailscale |

---

## Démarrage rapide (développement)

```bash
# Backend (:3000)
cd backend
cp .env.example .env   # si absent
npm install
npm run dev

# Frontend (:5173, proxy /api → backend)
cd frontend
cp .env.example .env     # si absent
npm install
npm run dev
```

Créer un utilisateur en CLI :

```bash
cd backend
npm run user:create -- monidentifiant monmotdepasse
```

> Si `better-sqlite3` plante après un changement de version Node : `npm rebuild better-sqlite3`

---

## Architecture

```txt
┌────────────────────────────┐
│ React SPA + PWA            │
│ Dashboard + Login          │
└──────────────┬─────────────┘
               │ REST API
               ▼
┌────────────────────────────┐
│ Fastify API                │
│ Routes                     │
│ Services                   │
│ Repositories               │
└──────────────┬─────────────┘
               │
               ▼
┌────────────────────────────┐
│ SQLite                     │
└────────────────────────────┘
```

### Principes backend

- Séparation stricte routes / services / repositories
- Logique métier dans les services
- API REST stateless
- Validation stricte des entrées
- Architecture modulaire

---

## Modèle de données

### Journal quotidien

Une entrée par utilisateur et par jour.

Contient :

- date
- poids
- hydratation
- notes

### Aliments

Chaque aliment est directement rattaché à une journée :

| Champ |
|---------|
| foodName |
| weightGrams |
| caloriesPer100g |

### Activités sportives

Chaque activité est directement rattachée à une journée :

| Champ |
|---------|
| activityName |
| durationMinutes |
| caloriesBurned |

### Sommeil

| Champ |
|---------|
| bedTime |
| wakeTime |
| comment |

### Interruptions de sommeil

| Champ |
|---------|
| startTime |
| endTime |
| comment |

---

## API REST

### Journal

| Méthode | Endpoint |
|----------|----------|
| GET | `/journal/:date` |
| POST | `/journal` |
| PUT | `/journal/:date` |

### Poids

| Méthode | Endpoint |
|----------|----------|
| PATCH | `/journal/:date/weight` |

### Alimentation

| Méthode | Endpoint |
|----------|----------|
| POST | `/journal/:date/foods` |
| PUT | `/foods/:id` |
| DELETE | `/foods/:id` |

### Sport

| Méthode | Endpoint |
|----------|----------|
| POST | `/journal/:date/activities` |
| PUT | `/activities/:id` |
| DELETE | `/activities/:id` |

### Hydratation

| Méthode | Endpoint |
|----------|----------|
| PATCH | `/journal/:date/hydration` |

### Sommeil

| Méthode | Endpoint |
|----------|----------|
| POST | `/journal/:date/sleep` |
| PUT | `/sleep/:id` |

### Statistiques

| Méthode | Endpoint |
|----------|----------|
| GET | `/stats?from=YYYY-MM-DD&to=YYYY-MM-DD` |

### Authentification

| Méthode | Endpoint |
|----------|----------|
| POST | `/auth/login` |
| POST | `/auth/register` |
| GET | `/auth/status` |
| GET | `/auth/me` |
| POST | `/auth/logout` |
| DELETE | `/auth/data` | Supprime toutes les données du user connecté (body : `{ password }`) |
| DELETE | `/auth/account` | Supprime le compte et les données (body : `{ password }`) |

---

## Interface utilisateur

### Login

- Authentification locale
- Session sécurisée

### Dashboard journalier

Navigation rapide :

```txt
< Jour précédent | Aujourd'hui | Jour suivant >
```

Sections :

- Résumé du jour (poids, alimentation, sport, sommeil, hydratation)
- Alimentation
- Sport
- Hydratation
- Sommeil
- Poids
- Notes du jour
- Graphiques (page `/graphiques` + widget desktop dans le dashboard)
- Liens compte en haut à droite : supprimer mes données / supprimer mon compte

Objectif principal :

> Saisir une journée complète en moins d'une minute.

---

## PWA

### Obligatoire

- Manifest configuré
- Service Worker
- Installation sur écran d'accueil
- Mode plein écran

### Évolutions futures

- Mode hors ligne
- Synchronisation différée
- Notifications de rappel

---

## Graphiques

Page `/graphiques` (mobile) et zone graphique du dashboard (desktop).

### Période affichée

Préréglages : **7 j · 30 j · Mois · 3 m · 6 m · 1 an · Perso** (dates début/fin).

### Courbes

- Poids (axe gauche)
- Calories alimentation (axe droit)
- Sommeil net en heures (axe droit)

---

## Déploiement production

Scripts dans `deploy/` (Windows, mini PC) :

- `install.ps1` — installation initiale (npm ci, .env, build)
- `start.ps1` / `stop.ps1` — démarrage / arrêt (backend + Caddy)
- `register-startup.ps1` — lancement au boot Windows
- `Caddyfile` — reverse proxy (frontend statique + API)

Voir `deploy/backend.env.example` et `deploy/frontend.env.production` pour la config prod.

---

## Sécurité

- Mot de passe hashé (Argon2 recommandé)
- Session via cookie sécurisé
- Validation serveur systématique
- Accès limité au réseau Tailscale
- Aucun accès public Internet

---

## Philosophie du projet

- Simplicité maximale
- Mobile-first
- Rapide à utiliser
- Facile à maintenir
- Sans sur-ingénierie

---

## Évolutions envisagées

- Notifications PWA
- Export CSV
- Export JSON
- Analyse automatique des tendances

---

## Documentation

Les spécifications détaillées sont disponibles dans :

`specifications.md`

---

## Statut du projet

✅ Fonctionnel — usage personnel (Tailscale). Développement terminé (juin 2026).