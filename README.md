# Ninho

Shared to-do lists with repeating chores, a shopping list sorted by supermarket (with photos and tags), recipes with tags and photos, and a home calendar. Runs on the home server, reached over the home network or Tailscale.

- `api/`: Express 5 + TypeScript, SQLite through Node's built-in `node:sqlite`, raw SQL, migrations in `api/migrations` (applied on startup).
- `web/`: React 19 + Vite + TanStack Query + React Router + CSS Modules.
- One container: the API serves the built web app. Changes reach the other phone live through server-sent events (`/api/live`).

## Deploy

Every push to `main` publishes `ghcr.io/aamadeira/ninho` for x86 and ARM. The server only needs [docker-compose.yml](docker-compose.yml):

```sh
docker compose up -d
```

To update: `docker compose pull && docker compose up -d`. Migrations run on startup. To run your own changes from a clone instead: `docker compose up -d --build`.

Open `http://<server>:8090`. The first person to open it creates their account and looks after this Ninho; from the **Ninho** page they add everyone else with a name and a first password. Nobody else can sign up.

On the phones: Share → Add to Home Screen.

## Configure

Set these under `environment` in `docker-compose.yml`, then `docker compose up -d`:

- `DISABLED_FEATURES`: tabs to hide, comma separated. Any of `todos`, `shopping`, `recipes`, `calendar`. Example: `recipes,calendar`. New features are on by default.
- `TZ`: your timezone, for example `Europe/Lisbon`. Repeating to-dos use it to know what "today" is.
- `SECURE_COOKIE`: set to `true` once Ninho is served over HTTPS.

The logs show which features are on: `docker compose logs ninho | grep Features`.

## Locked out

If the person who looks after Ninho forgets their password, set a new one from the server:

```sh
docker compose exec ninho node dist/scripts/saveUser.js "Their name" 'a new long password'
```

With a name that doesn't exist yet, it adds that person instead.

## Data

Everything lives in the `ninho-data` volume (one SQLite file). To back it up:

```sh
docker compose stop && docker compose cp ninho:/srv/ninho/data ./ninho-backup && docker compose start
```

## Develop

```sh
cd api && npm install
npm run dev        # API on :3000, database in api/data/; open the web app to create the first account

cd web && npm install
npm run dev        # http://localhost:5173, proxies /api and /auth to :3000
```

`cd api && npm test` runs the calendar export and repeating to-do tests.

## HTTPS

Plain HTTP is fine on the home network and over Tailscale. If you later put it behind HTTPS (for example `tailscale serve`), set `SECURE_COOKIE=true` on the container.
