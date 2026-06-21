# Diet Tracker — guide IA (`ai/app.md`)

> **Rôle de ce fichier** : contexte de reprise pour l’agent. À mettre à jour après tout changement fonctionnel (cf. `.cursor/rules/custom-module-ia.mdc`).

---

## 1. Vue d’ensemble

PWA React/Vite + API Fastify/SQLite pour suivi quotidien : poids, alimentation, sport, hydratation, sommeil, notes, graphiques.

- **Usage** : personnel, réseau privé (Tailscale)
- **Utilisateurs** : **multi-comptes** — données isolées par `UserID` (session cookie)
- **Breakpoint desktop** : `1024px` (`useMediaQuery('(min-width: 1024px)')`)

### Commandes dev

```bash
cd backend && npm run dev    # :3000
cd frontend && npm run dev   # :5173, proxy /api → backend
cd frontend && npm run build
cd backend && npm run user:create -- <user> <pass>
cd backend && npm run user:set -- <user> <pass>   # crée ou met à jour le mot de passe
```

Base SQLite : `data/diettracker.db` — schéma source `diettracker.sql` (migration auto colonne `Unit` sur `FoodEntry` dans `backend/src/db/connection.ts`).

**Piège Node** : après changement de version Node, `npm rebuild better-sqlite3` dans `backend/`.

---

## 2. Stack

| Couche | Tech |
|--------|------|
| Frontend | React 19, TypeScript, Vite, react-router-dom, Chart.js, vite-plugin-svgr, vite-plugin-pwa |
| Backend | Fastify 5, Zod, better-sqlite3, @fastify/session + cookie, **Argon2** |
| Styles | CSS Modules + tokens Figma (`frontend/src/styles/tokens.css`) |
| Prod | `deploy/` — Caddy, scripts PowerShell (install, start, boot) |

---

## 3. Routes frontend

| Route | Page | Accès |
|-------|------|-------|
| `/login` | `AuthPage` (mode login) | public |
| `/register` | `AuthPage` (mode inscription) | public (toujours ouverte) |
| `/` | `DashboardPage` | protégé |
| `/graphiques` | `GraphsPage` | protégé |

Guards : `frontend/src/routes/Guards.tsx` — `AuthContext` pour session.

---

## 4. Layout Dashboard — mobile vs desktop

**Important** : un seul layout monté à la fois (`useMediaQuery`), pas de double rendu CSS `display:none`.

### Mobile (< 1024px)

Ordre dans `AppShell` :

1. `AccountActions` (haut droite) → Alimentation → Sport → Hydratation → Sommeil → Poids → Note  
2. `DailySummary` en haut  
3. Nav bas : Accueil, Graphiques, Déconnexion  
4. Polices plafonnées à **24px** (`--font-size-mobile-max`)

### Desktop (≥ 1024px)

- **Sidebar** : username + récap jour + déconnexion  
- **Header** : logo + titre + **`AccountActions`** (haut droite)  
- **Grille** :
  - Ligne 1 : Poids | Alimentation | Sport (`layout="stretch"`)
  - Ligne 2 : Graphique + `ChartPeriodSelector` (2 cols) | Hydratation, Sommeil, Notes
- Page ≤ 100vh, `overflow: hidden`

---

## 5. Composants UI clés

| Composant | Fichier | Rôle |
|-----------|---------|------|
| `Card` | `ui/Card.tsx` | Variants couleur ; `layout`: `stretch` \| `fill` \| `flat` |
| `NumberStepper` | `ui/NumberStepper.tsx` | Poids (kg/g), hydratation (L/cl), heures sommeil |
| `FoodProductModal` | `dashboard/FoodProductModal.tsx` | Modale alimentation ; unité g/ml |
| `Modal` | `ui/Modal.tsx` | Modales ; `variant`: `default` \| `sport` \| **`danger`** |
| `ChartPeriodSelector` | `dashboard/ChartPeriodSelector.tsx` | Préréglages 7j/30j/mois/3m/6m/1an + plage perso |
| `StatsChart` | `dashboard/StatsChart.tsx` | Chart.js, memo, `compact` pour dashboard |
| `AccountActions` | `layout/AccountActions.tsx` | Supprimer données / compte (modale + mot de passe) |
| `Icons` | `icons/Icons.tsx` | SVG via SVGR |

### Modales — points d’attention

- Pas de `method="dialog"` sur les forms
- **`ignoreCloseRef`** sur fermetures programmatiques
- `FoodProductModal` : deps `[open, editing?.id]` (pas l’objet `editing` entier)

### Alimentation

- Champ `unit` (`g` \| `ml`) sur `FoodEntry`
- Calculs : `utils/format.ts`, `lib/calculations.ts` (backend)

---

## 6. API client

`frontend/src/api/client.ts` :

- **`Content-Type: application/json` uniquement si body présent** (sinon Fastify 5 → erreur sur logout/delete sans body)
- Credentials : `include` (cookies session)

### Endpoints principaux

| Méthode | Path | Description |
|---------|------|-------------|
| POST | `/auth/login` | Login |
| POST | `/auth/register` | Inscription (multi-user) |
| GET | `/auth/status` | `{ hasUser }` |
| GET | `/auth/me` | User courant |
| POST | `/auth/logout` | Logout (sans body) |
| DELETE | `/auth/data` | Supprime toutes les données du user (body `{ password }`) |
| DELETE | `/auth/account` | Supprime compte + données + session |
| GET | `/journal/:date` | Journée `JournalDay` |
| PATCH | `/journal/:date/weight` | Poids |
| PATCH | `/journal/:date/hydration` | Hydratation |
| PUT | `/journal/:date` | Notes |
| POST/PUT/DELETE | foods, activities, sleep | CRUD par journée |
| GET | `/stats?from=&to=` | Stats graphiques (filtré par user session) |

Schémas Zod : `backend/src/schemas/index.ts` (`confirmPasswordSchema` pour suppressions)  
Types miroir : `frontend/src/api/types.ts`

---

## 7. Backend — structure

```
backend/src/
├── server.ts
├── routes/            # auth, journal, food, activity, sleep
├── services/          # auth (verifyPassword, deleteUserData, deleteAccount)
├── repositories/      # journal.deleteAllForUser, user.deleteById
├── db/connection.ts
├── scripts/           # init-db, create-user, set-user
└── config/env.ts
```

**Isolation données** : routes → `requireUser()` → services avec `userId` → `Journal WHERE UserID = ?`. Food/activity/sleep via ownership journal (`findByIdForUser`).

Session : cookie `sessionId`, 7 jours, `httpOnly`, `sameSite: lax`.

---

## 8. Hooks & état

| Hook | Fichier | Usage |
|------|---------|-------|
| `useJournal(date)` | `hooks/useJournal.ts` | Charge journée ; `mutate(day)` après save |
| `useChartStats(preset, endDate)` | `hooks/useChartStats.ts` | Stats graphiques + sync période prédéfinie |
| `useMediaQuery` | `hooks/useMediaQuery.ts` | Layout mobile/desktop |
| `useAuth` | `context/AuthContext.tsx` | login, register, logout, refresh, hasAccount |

Utilitaires dates : `utils/dates.ts` — `ChartPeriodPreset`, `getPresetRange`, `clampDateRange`.

---

## 9. Auth / comptes

- Inscription **toujours ouverte** (`/register`)
- `hasAccount` (status API) : hint « aucun compte » sur login uniquement
- Username affiché : sidebar desktop, subtitle mobile `AppShell`
- **AccountActions** : DELETE data (journal cascade) ou DELETE account (user cascade) — confirmation mot de passe
- Scripts CLI : `user:create` → `createUser` ; `user:set` → create ou update password par username

---

## 10. Design tokens (extraits)

```css
--color-fire: #ec7e56      /* alimentation */
--color-energy: #b18d2a    /* sport */
--color-green: #55b78d     /* poids, graph */
--color-hydratation: #40a1ea
--color-night: #7061d0     /* sommeil */
--font-size-mobile-max: 24px
```

---

## 11. Bugs corrigés (ne pas réintroduire)

1. Logout/delete 500 : `Content-Type` sans body sur requêtes POST/DELETE vides  
2. Boucle re-render dashboard : double montage mobile+desktop  
3. Modale sport : `method="dialog"` + cycle open/close  
4. Chart.js flex : `overflow: hidden`, `animation: false`, options memo, `maxTicksLimit`  
5. `better-sqlite3` : rebuild après changement version Node

---

## 12. Fichiers pivot

| Zone | Fichiers |
|------|----------|
| Dashboard | `pages/DashboardPage.tsx`, `DashboardPage.module.css` |
| Graphiques | `GraphsPage.tsx`, `ChartPeriodSelector.tsx`, `StatsChart.tsx`, `useChartStats.ts` |
| Compte | `AccountActions.tsx`, `auth.service.ts`, `auth.routes.ts` |
| API | `frontend/src/api/*`, `backend/src/routes/*` |
| DB | `diettracker.sql`, `repositories/*` |
| Deploy | `deploy/install.ps1`, `start.ps1`, `Caddyfile` |

---

## 13. Non fait / pistes

- Modale sport alignée Figma complète
- Interruptions sommeil : backend OK, UI pas exposée
- Corrélations graphiques (scatter) — non implémentées
- Session store persistant (Redis/SQLite) si multi-instance

---

## 14. Dernière session (juin 2026)

- **Multi-comptes** : inscription ouverte, données par `UserID`
- **Graphiques** : `ChartPeriodSelector` (préréglages + plage perso) dashboard + `/graphiques`
- **Compte** : `AccountActions` — supprimer données / supprimer compte (mot de passe)
- **Deploy** : dossier `deploy/` documenté dans README
- **README** + ce fichier mis à jour
