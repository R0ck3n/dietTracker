# 📌 Cahier des charges – Diet Tracker (React + PWA + Fastify + SQLite)

## 1. Objectif du projet

Développer une application web personnelle de suivi quotidien, installable en **Progressive Web App (PWA)**, permettant à un utilisateur unique de :

* Suivre son poids quotidien
* Enregistrer ses repas avec calcul automatique des calories
* Enregistrer ses activités sportives et les calories dépensées
* Suivre son hydratation
* Suivre son sommeil (heures + interruptions)
* Visualiser des statistiques via graphiques
* Utiliser l'application sur mobile et desktop
* Installer l'application sur écran d'accueil (PWA)
* Accéder via réseau privé (Tailscale)

---

## 2. Architecture technique

### Frontend

* React (SPA)
* TypeScript recommandé
* Mobile-first responsive design
* PWA obligatoire

### Backend

* Node.js
* Fastify (API REST légère)
* Architecture modulaire (par domaine métier)

### Base de données

* SQLite (simple, locale, sans serveur dédié)

### Hébergement

* Serveur sur mini PC
* Accès via Tailscale uniquement (réseau privé)

---

## 3. Fonctionnalités principales

### 3.1 Authentification simple

* Un seul utilisateur
* Login + mot de passe local
* Mot de passe hashé (bcrypt ou argon2)
* Session via cookie sécurisé
* Pas d'OAuth, pas d'auth externe

---

### 3.2 Journal quotidien

Chaque journée contient :

#### Poids

* weight (number, kg avec précision au gramme)
* Une seule entrée par jour

---

#### Alimentation

Chaque aliment consommé contient :

* foodName (string)
* weightGrams (number)
* caloriesPer100g (number)
* totalCalories (calculé automatiquement)

Formule :

* totalCalories = (weightGrams × caloriesPer100g) / 100

Fonctionnalités :

* Ajouter / modifier / supprimer une ligne
* Plusieurs aliments par jour
* Modification simple et rapide (mobile-first)
* Total journalier des calories consommées

---

#### Sport

Chaque activité physique contient :

* activityName (string)
* durationMinutes (number)
* caloriesBurned (number)

Fonctionnalités :

* Ajouter / modifier / supprimer une activité
* Plusieurs activités par jour
* Total journalier des calories dépensées

---

#### Hydratation

* hydrationLiters (number, litres avec précision au centilitre)
* Une seule entrée par jour

---

#### Sommeil

* bedTime (datetime)
* wakeTime (datetime)
* comment (string optionnel)

##### Interruptions de sommeil

* startTime
* endTime
* comment optionnel

---

#### Notes du jour

* notes (string optionnel)

---

## 4. API REST (Fastify)

### Journal

* GET /journal/:date
* POST /journal
* PUT /journal/:date

### Poids

* PATCH /journal/:date/weight

### Alimentation

* POST /journal/:date/foods
* PUT /foods/:id
* DELETE /foods/:id

### Sport

* POST /journal/:date/activities
* PUT /activities/:id
* DELETE /activities/:id

### Hydratation

* PATCH /journal/:date/hydration

### Sommeil

* POST /journal/:date/sleep
* PUT /sleep/:id

---

## 5. Logique métier (backend)

* Calcul automatique des calories journalières consommées
* Agrégation des aliments par jour
* Agrégation des calories dépensées via le sport
* Calcul de la durée de sommeil nette (avec interruptions)
* Validation stricte des données
* Aucune logique métier dans les routes (services dédiés)

---

## 6. Frontend (React SPA + PWA)

### 6.1 Structure générale

Application SPA avec deux écrans principaux :

* Dashboard journalier (écran principal)
* Page graphiques (évolution dans le temps)
* Login page

---

### 6.2 Dashboard journalier

Éléments :

* Sélecteur de date (précédent / aujourd'hui / suivant + calendrier)
* Résumé du jour (poids, alimentation, sport, sommeil, hydratation)
* Bloc alimentation
* Bloc sport
* Bloc hydratation
* Bloc sommeil
* Bloc poids
* Bloc notes du jour

#### Desktop

* Sidebar avec récapitulatif du jour
* Grille de blocs de saisie
* Graphique intégré au dashboard

#### Mobile

* Navigation par icônes (accueil, graphiques, déconnexion)
* Sections empilées verticalement
* Saisie optimisée au pouce

---

### 6.3 UX mobile-first

* Interface optimisée pour saisie rapide
* Ajout dynamique de lignes alimentation et sport
* Navigation minimale
* Expérience fluide type application native

Objectif :

> Saisir une journée complète en moins d'une minute.

---

## 7. PWA (obligatoire)

### Fonctionnalités requises

* Installation sur écran d'accueil
* Manifest.json configuré
* Service Worker actif

### Fonctionnalités souhaitées

* Mode offline (lecture + saisie temporaire)
* Synchronisation au retour réseau
* Cache des derniers jours consultés

### UX PWA

* Ouverture en plein écran
* Icône application dédiée
* Lancement rapide type application mobile native

---

## 8. Graphiques

Utilisation de Chart.js

### Graphiques requis :

* Poids dans le temps (line chart)
* Calories consommées journalières (line ou bar chart)
* Calories dépensées via le sport (line ou bar chart)
* Sommeil total (line chart)
* Corrélation sommeil / poids (scatter optionnel)

---

## 9. Règles de données

* Une seule entrée de poids par jour
* Une seule entrée d'hydratation par jour
* Plusieurs aliments par jour autorisés
* Plusieurs activités sportives par jour autorisées
* Données brutes stockées en base
* Agrégations calculées côté backend ou frontend

---

## 10. Contraintes techniques

* Backend léger et modulaire
* Séparation stricte routes / services / repository
* API stateless
* Code maintenable et lisible
* Optimisé pour usage personnel

---

## 11. Sécurité

* Auth locale simple
* Hash sécurisé des mots de passe
* Accès uniquement via Tailscale
* Validation stricte des entrées utilisateur

---

## 12. Évolutions possibles

* Notifications PWA (rappels poids / repas / sport / sommeil)
* Export CSV / JSON
* Analyse automatique des tendances
* Objectifs personnalisés (poids, calories, sommeil)
* Suggestions basées sur historique

---

## 13. Philosophie du projet

* Simplicité maximale
* Utilisation quotidienne rapide (< 1 minute pour saisir une journée)
* Mobile-first prioritaire
* Offline-friendly via PWA
* Projet personnel uniquement
* Évolutif mais non complexe
