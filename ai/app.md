# Diet Tracker — guide IA (`ai/app.md`)

> **Rôle de ce fichier** : contexte de reprise pour l’agent. À mettre à jour après tout changement fonctionnel (cf. `.cursor/rules/custom-module-ia.mdc`).

---

## 1. Vue d’ensemble

PWA React/Vite + API Fastify/SQLite pour suivi quotidien : poids, alimentation, sport, hydratation, sommeil, notes, graphiques.

- **Usage** : personnel, réseau privé (Tailscale)
- **Utilisateur** : compte unique (login local, session cookie)
- **Breakpoint desktop** : `1024px` (`useMediaQuery('(min-width: 1024px)')`)

### Compte de test

| Champ | Valeur |
|-------|--------|
| User | `admin` |
| Pass | `secret123` |

### Commandes dev

```bash
cd backend && npm run dev    # :3000
cd frontend && npm run dev   # :5173, proxy /api → backend
cd frontend && npm run build
```

Base SQLite : `data/diettracker.db` — schéma source `diettracker.sql` (migration auto colonne `Unit` sur `FoodEntry` dans `backend/src/db/connection.ts`).

---

## 2. Stack

| Couche | Tech |
|--------|------|
| Frontend | React 18, TypeScript, Vite, react-router-dom, Chart.js, vite-plugin-svgr, vite-plugin-pwa |
| Backend | Fastify 5, Zod, better-sqlite3, @fastify/session + cookie, bcrypt |
| Styles | CSS Modules + tokens Figma (`frontend/src/styles/tokens.css`) |

---

## 3. Routes frontend

| Route | Page | Accès |
|-------|------|-------|
| `/login` | `AuthPage` (mode login) | public |
| `/register` | `AuthPage` (mode inscription) | public si aucun user |
| `/` | `DashboardPage` | protégé |
| `/graphiques` | `GraphsPage` | protégé |

Guards : `frontend/src/routes/Guards.tsx` — `AuthContext` pour session.

---

## 4. Layout Dashboard — mobile vs desktop

**Important** : un seul layout monté à la fois (`useMediaQuery`), pas de double rendu CSS `display:none` (évite boucles de re-render).

### Mobile (< 1024px)

Ordre dans `AppShell` :

1. Alimentation → Sport → Hydratation → Sommeil → Poids → Note du jour  
2. `DailySummary` en haut  
3. Nav bas : Accueil, Graphiques, Déconnexion  
4. Polices plafonnées à **24px** (`--font-size-mobile-max`)

### Desktop (≥ 1024px)

- **Sidebar** (`Sidebar.tsx`) : récap du jour + déconnexion  
- **Header** : logo + titre  
- **Grille** (`DashboardPage.module.css`) :
  - **Ligne 1** : Poids | Alimentation | Sport — hauteur égale (`Card` `layout="stretch"`)
  - **Ligne 2** : Graphique (2 cols, hauteur restante) | Colonne droite (`space-between`) : Hydratation, Sommeil, Note du jour (note alignée en bas du graph)
- Page **≤ 100vh**, `overflow: hidden`
- Listes alimentation/sport : **3 lignes visibles** puis scroll interne (`.listScroll`, scrollbars thématisées orange/jaune)

---

## 5. Composants UI clés

| Composant | Fichier | Rôle |
|-----------|---------|------|
| `Card` | `ui/Card.tsx` | Variants couleur ; `layout`: `stretch` \| `fill` \| `flat` |
| `NumberStepper` | `ui/NumberStepper.tsx` | Poids (kg/g), hydratation (L/cl), heures sommeil |
| `FoodProductModal` | `dashboard/FoodProductModal.tsx` | Modale Figma alimentation ; unité g/ml ; sync énergie /100 ↔ total |
| `Modal` | `ui/Modal.tsx` | Modale sport (`variant="sport"`, bordure `--color-energy`) |
| `UnitSelect` | `ui/UnitSelect.tsx` | Toggle g / ml |
| `StatsChart` | `dashboard/StatsChart.tsx` | Chart.js, memo, `compact` pour dashboard desktop |
| `Icons` | `icons/Icons.tsx` | SVG via SVGR, `fill="currentColor"` |

### Modales — points d’attention

- **Pas de `method="dialog"`** sur les forms (fermeture immédiate)
- **`ignoreCloseRef`** sur `Modal.tsx` et `FoodProductModal.tsx` pour fermetures programmatiques
- `FoodProductModal` : `useEffect` form init dépend de `[open, editing?.id]` (pas l’objet `editing` entier → boucle infinie)
- Dialog **toujours dans le DOM** (pas de `return null` qui démonte brutalement)

### Alimentation — logique front

- `FoodSection` : `editingId` (number) au lieu de l’objet `editing` en state
- Calculs : `utils/format.ts` — `computeFoodTotalCalories`, `computeFoodCaloriesPer100`
- Backend : champ `unit` (`g` \| `ml`) sur `FoodEntry`

---

## 6. API client

`frontend/src/api/client.ts` :

- **`Content-Type: application/json` uniquement si body présent** (sinon Fastify 5 → `FST_ERR_CTP_EMPTY_JSON_BODY` sur logout/delete)
- Credentials : `include` (cookies session)

### Endpoints principaux

| Méthode | Path | Description |
|---------|------|-------------|
| POST | `/auth/login` | Login |
| POST | `/auth/register` | Inscription (si aucun user) |
| GET | `/auth/status` | `{ hasUser }` |
| GET | `/auth/me` | User courant |
| POST | `/auth/logout` | Logout (sans body) |
| GET | `/journal/:date` | Journée complète `JournalDay` |
| PATCH | `/journal/:date/weight` | Poids |
| PATCH | `/journal/:date/hydration` | Hydratation (litres) |
| PUT | `/journal/:date` | Notes |
| POST/PUT/DELETE | `/journal/:date/foods`, `/foods/:id` | Alimentation |
| POST/PUT/DELETE | `/journal/:date/activities`, `/activities/:id` | Sport |
| POST/PUT | `/journal/:date/sleep`, `/sleep/:id` | Sommeil |
| GET | `/stats?from=&to=` | Stats graphiques |

Schémas Zod : `backend/src/schemas/index.ts`  
Types miroir front : `frontend/src/api/types.ts`

---

## 7. Backend — structure

```
backend/src/
├── server.ts          # Fastify + plugins session/cors
├── routes/            # auth, journal, food, activity, sleep
├── services/          # logique métier
├── repositories/      # SQL SQLite
├── db/connection.ts   # init + migration Unit
├── lib/calculations.ts # calories alim, sommeil net
└── config/env.ts      # PORT, DB path, CORS, session secret
```

Session : cookie `sessionId`, 7 jours, `httpOnly`, `sameSite: lax`.

---

## 8. Hooks & état

| Hook | Fichier | Usage |
|------|---------|-------|
| `useJournal(date)` | `hooks/useJournal.ts` | Charge journée ; `mutate(day)` après save ; reset `day` au changement de date |
| `useMediaQuery` | `hooks/useMediaQuery.ts` | Layout mobile/desktop |
| `useAuth` | `context/AuthContext.tsx` | login, register, logout, refresh |

---

## 9. Auth / inscription

- Page unifiée `pages/AuthPage.tsx` + `AuthLayout.tsx`
- Bascule login ↔ register ; lien « Créer un compte »
- Si compte existant sur `/register` → message, pas de redirect silencieux
- Confirmation mot de passe à l’inscription (min 6 car.)

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

Logo : `frontend/public/assets/icons/logo.svg` + composant `LogoIcon`.

---

## 11. Bugs corrigés (ne pas réintroduire)

1. Logout/delete 500 : `Content-Type` sans body sur requêtes POST/DELETE vides  
2. Boucle re-render dashboard : double montage mobile+desktop ; `editing` objet dans deps useEffect  
3. Modale sport ne s’ouvrait plus : `method="dialog"` + cycle open/close  
4. Chart.js dans flex : boucle resize → `overflow: hidden`, `animation: false`, options memo  
5. `FoodProductModal.module.css` : classe `.hint` mal fermée (cassait le build)

---

## 12. Fichiers pivot (modifs fréquentes)

| Zone | Fichiers |
|------|----------|
| Dashboard layout | `pages/DashboardPage.tsx`, `DashboardPage.module.css` |
| Sections | `components/dashboard/*Section.tsx`, `Sections.module.css` |
| Modales | `FoodProductModal.tsx`, `ui/Modal.tsx` |
| API | `frontend/src/api/*`, `backend/src/routes/*` |
| DB | `diettracker.sql`, `db/connection.ts`, `repositories/*` |
| Icônes | `components/icons/Icons.tsx`, `assets/icons/*.svg` |

---

## 13. Non fait / pistes

- Modale sport alignée Figma « sport modale » (comme product modale) — partiellement (bordure jaune seulement)
- Interruptions sommeil : backend OK, UI interruptions pas exposée dashboard
- Script debug `backend/scripts/test-actions.mjs` (peut être supprimé)

---

## 14. Dernière session (juin 2026)

Travail UI/UX dashboard :

- Grille desktop 2 lignes, 100vh, scroll 3 lignes alim/sport, scrollbars custom
- Colonne droite `space-between`, marges supprimées sous blocs droits
- Mobile : typo max 24px
- Stabilisation perf (single layout, chart, modales)
