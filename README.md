# CESIZen — Front-end Back-Office

Interface d'administration web du projet **CESIZen**, construite avec **Vue 3**, **TypeScript** et **Vite**. Elle permet aux administrateurs de gérer les utilisateurs, les quiz de bien-être, les pages de contenu et la configuration des résultats.

---

## Table des matières

- [Technologies](#technologies)
- [Architecture du projet](#architecture-du-projet)
- [Prérequis](#prérequis)
- [Installation & lancement](#installation--lancement)
- [Mode local (npm)](#mode-local-npm)
- [Mode Docker](#mode-docker)
- [Variables d'environnement](#variables-denvironnement)
- [Routes & navigation](#routes--navigation)
- [Fonctionnalités](#fonctionnalités)
- [Tests](#tests)

---

## Technologies

| Outil | Version | Rôle |
|---|---|---|
| [Vue 3](https://vuejs.org/) | `^3.4` | Framework UI (Composition API) |
| [TypeScript](https://www.typescriptlang.org/) | `^5.4` | Typage statique |
| [Vite](https://vitejs.dev/) | `^5.2` | Bundler & dev server |
| [Vue Router](https://router.vuejs.org/) | `^4.3` | Routing SPA |
| [Pinia](https://pinia.vuejs.org/) | `^2.1` | Gestion d'état |
| [Axios](https://axios-http.com/) | `^1.7` | Client HTTP |
| [Vitest](https://vitest.dev/) | `^4.1` | Tests unitaires |

---

## Architecture du projet

```
src/
├── api/               # Appels HTTP par domaine (auth, users, quiz, pages, reset)
├── components/
│   ├── layout/        # AppLayout (admin) et PublicLayout (zone publique)
│   └── ui/            # Composants réutilisables (ConfirmModal, Pagination)
├── router/            # Configuration des routes et guards de navigation
├── stores/            # Stores Pinia (auth, users, quiz, pages, reset)
├── types/             # Interfaces TypeScript (DTOs request/response)
├── views/
│   ├── auth/          # Connexion
│   ├── profile/       # Profil de l'utilisateur connecté
│   ├── users/         # CRUD utilisateurs (admin)
│   ├── quiz/          # CRUD quiz + vue publique
│   ├── pages/         # CRUD pages de contenu + vue publique
│   ├── reset/         # Réinitialisation de mot de passe (3 étapes)
│   └── result-config/ # Configuration des messages de résultat
└── tests/
    └── api/           # Tests unitaires des couches API
```

---

## Prérequis

- **Node.js** ≥ 20
- **npm** ≥ 9
- API back-end CESIZen accessible (Spring Boot, port `8080` par défaut)

---

## Installation & lancement

### Mode local (npm)

```bash
# 1. Cloner le dépôt
git clone <url-du-repo>
cd CESIZen--frontend-backOffice

# 2. Installer les dépendances
npm install

# 3. Lancer en développement
npm run dev -- --mode development
```

L'application est accessible sur **http://localhost:5173**.

Le dev server proxifie automatiquement `/api` vers `http://localhost:8080` (configurable via `VITE_API_URL`).

#### Autres scripts

```bash
npm run build    # Build de production (TypeScript + Vite)
npm run preview  # Prévisualiser le build de production
```

---

### Mode Docker

Un `Dockerfile` et un `docker-compose.yml` sont fournis pour lancer l'application en environnement conteneurisé.

```bash
docker compose up --build
```

L'application sera disponible sur **http://localhost:5173**.

> Le service rejoint le réseau externe `app-network`. Créer le réseau par le `docker-compose` cesi-backend-api (back-end + base de données).

```bash
docker network create app-network
```

---

## Variables d'environnement

| Variable | Valeur par défaut | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080` | URL de base de l'API back-end |

Créez un fichier `.env.development` à la racine pour surcharger ces valeurs :

```env
VITE_API_URL=http://localhost:8080
```

En mode Docker, le fichier `.env.docker` est utilisé automatiquement.

---

## Routes & navigation

### Authentification

| Route | Description |
|---|---|
| `/login` | Connexion |
| `/reset` | Demande de réinitialisation de mot de passe |
| `/reset/verify` | Vérification du code PIN |
| `/reset/new-password` | Saisie du nouveau mot de passe |

### Back-office admin (`/`)

Accessible uniquement aux utilisateurs avec le rôle `ROLE_ADMIN`.

| Route | Description |
|---|---|
| `/` | Dashboard |
| `/profile` | Profil de l'administrateur connecté |
| `/profile/edit` | Modification du profil |
| `/admin/users` | Liste des utilisateurs |
| `/admin/users/create` | Créer un utilisateur |
| `/admin/users/:id` | Détail d'un utilisateur |
| `/admin/quiz` | Liste des quiz (administration) |
| `/admin/quiz/create` | Créer un quiz |
| `/admin/quiz/:id/edit` | Modifier un quiz |
| `/admin/result-config` | Configuration des messages de résultat |
| `/admin/pages` | Liste des pages (administration) |
| `/admin/pages/create` | Créer une page |
| `/admin/pages/:id/edit` | Modifier une page |

### Guards de navigation

- Un utilisateur non connecté est redirigé vers `/login`.
- Un utilisateur connecté sans rôle admin est redirigé vers `/forbidden` s'il tente d'accéder au back-office.
- Un utilisateur déjà connecté est redirigé hors de la page de login (`/login`).

---

## Fonctionnalités

### Authentification JWT
- Connexion par identifiant (email ou username) + mot de passe.
- Le token JWT est stocké en `localStorage` et attaché automatiquement à chaque requête via un intercepteur Axios.
- Une réponse `401` de l'API déconnecte automatiquement l'utilisateur et le redirige vers `/login`.
- Décodage du payload JWT côté client pour extraire le rôle et l'identifiant.

### Gestion des utilisateurs (admin)
- Liste paginée des utilisateurs.
- Création, consultation et modification d'un utilisateur.
- Rôles supportés : `ROLE_ADMIN`, `ROLE_USER`.

### Gestion des quiz
- CRUD complet des quiz avec leurs questions (`statement`, `scoreValue`, `correctAnswer`).
- Vue publique de passation d'un quiz avec soumission des réponses.

### Configuration des résultats
- Définition des plages de score par quiz (`minScore`, `maxScore`, `riskLevel`, `message`).

### Gestion des pages de contenu
- CRUD des pages composées de blocs de contenu (`name`, `description`, `itemUrl`), associées à une catégorie.

### Réinitialisation de mot de passe
- Flux en 3 étapes : choix du canal (email ou SMS) → vérification du PIN → nouveau mot de passe.

---

## Tests

Les tests unitaires couvrent les couches API (avec `axios-mock-adapter`).

```bash
# Lancer les tests
npx vitest

# Interface graphique Vitest
npx vitest --ui
```

Les fichiers de test sont situés dans `src/tests/api/` et ciblent les modules `auth`, `users`, `quiz`, `pages` et `reset`.