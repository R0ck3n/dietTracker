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
- calories consommées et dépensées
- durée de sommeil
- corrélations (optionnelles)

### Progressive Web App (PWA)

- Installation sur écran d'accueil
- Plein écran
- Icône dédiée
- Expérience proche d'une application native

### Authentification

- Utilisateur unique
- Login local
- Mot de passe hashé
- Session sécurisée par cookie

---

## Stack technique

| Couche | Technologie |
|----------|----------|
| Frontend | React (SPA) |
| Langage Frontend | TypeScript |
| Backend | Node.js + Fastify |
| Base de données | SQLite |
| Graphiques | Chart.js |
| PWA | Vite PWA Plugin |
| Réseau | Tailscale |

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
- Graphiques (page dédiée)

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

### Poids

Suivi de l'évolution dans le temps.

### Calories

Total journalier consommé et total dépensé via le sport.

### Sommeil

Durée nette de sommeil.

### Corrélations (optionnel)

- sommeil ↔ poids
- sommeil ↔ calories consommées
- calories consommées ↔ calories dépensées

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

🚧 En cours de test.