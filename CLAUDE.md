# Ninho

Household app: to-do lists with repeating chores and someone in charge of each, a shopping list where items can belong to a specific supermarket and carry tags and a photo, recipes with tags and photos, and a shared home calendar whose events can be added to Google or Apple Calendar. Private and self-hosted; one household per instance, a handful of people. Used mostly on phones (in the supermarket, in the kitchen, often from the home screen), sometimes on desktop.

One repo, one container: `api/` (Express 5 + TypeScript + SQLite) serves the built `web/` (React 19 + Vite). See README for running, configuring and deploying.

## Context

- Built for one household and meant for others to self-host, so deploy-time settings matter. Code should be easy to read and own: explicit and conventional, never clever.
- Design new screens and bigger visual changes with the `ui-ux-pro-max` skill.
- Served at `http://<host>:8090`, usually over a home network or Tailscale, often without HTTPS. Data is one SQLite file in the `ninho` volume; the container starts as root only to give the data folder to `PUID:PGID` (default 1000) in `entrypoint.sh`, then runs as that user through `su-exec`; run one-off scripts through `ninho-entrypoint` so new files get the same owner.
- Public on GitHub as `aamadeira/ninho` (MIT). Every push to `main` publishes `ghcr.io/aamadeira/ninho` for amd64 and arm64 (`.github/workflows/publish.yml`), and the server's compose file pulls it. Don't commit or push unless asked.

## Features and people

- Each tab is a feature (`todos`, `shopping`, `recipes`, `calendar`). Deployers turn features off with `DISABLED_FEATURES` (opt-out, so new features appear after an upgrade); the API reports the enabled ones at the public `/auth/features` (so it loads alongside `/me`) and only the web hides them (`useNavigationItems`, `RequireFeature`, `HomeRedirect`). A new feature adds its name to `api/src/config/features.ts`, the `Feature` type, `navigationItems` and a `RequireFeature` route. With one tab left, the tab bar hides itself.
- The people page is called "Ninho" (`/ninho`): an instance is "a Ninho", so the page, the copy and the nav all use that word.
- People sign in with a name and a password, no email. The first person to open a fresh instance creates the admin account (`/auth/setup`, 409 afterwards). Only the admin adds, resets (signs that person out everywhere) or removes people (`UsersUtils.getAdminUserOrThrow`); everyone can change their own password. No open sign-up. `saveUser.js <name> <password>` is the server-side escape hatch. Sessions are random tokens stored hashed, sent as the httpOnly `ninho_session` cookie for a year; `SECURE_COOKIE=true` once there's HTTPS.

## How things behave

- **To-do lists** live in `todo_lists` and are entirely the household's own; nothing is seeded, because stored names can't be translated. Todos store their list's name in `list_name` (required); `TodoListsUtils.getOrCreateName` maps it to the stored spelling (unique regardless of case) and recreates a list deleted elsewhere. Deleting a list deletes its todos. Quick-add only appears when a list is selected. A todo can have an assignee (NULL when that person is removed), a `due_date` (future ones wait in "Coming up") and a repeat rule (`repeat_every` + `repeat_unit`: day, week, month, year). On to-do and shopping rows (`CheckRow`) only the checkbox ticks, with an Undo toast; tapping the rest of the row opens the edit sheet, because ticking by accident was common. Ticking a repeating todo never marks it done: the server moves `due_date` to the first occurrence after today, counted from the old date so it keeps its weekday, and the web shows an Undo toast. "Clear done" only removes one-off todos. Todos and shopping items have optional `notes` (up to 5000 characters, edited in their sheets, shown on the row cut to two lines); calendar events have them too. Quick-adding a todo or shopping item shows an "Added X" toast whose Details button opens its edit sheet once the server has returned the real id (the add mutations swap the server's row into the cache and don't await their refetch, so that takes one round trip).
- **Shopping** items have an optional store, tags (filter with AND; quick-add while filtering gives the new item those tags) and a photo. `status` goes `needed` → tick → `cart` → "Done shopping" (`POST /api/shopping/checkout`) → `bought`, shown as "Inventory" (things in stock). Unticking an inventory item puts it back on the list, so bought items are kept on purpose; "Only buying this once" items (`buy_once`) are deleted at checkout instead. Adding a name that already exists (any case) puts that item back on the list instead of duplicating it. Store and tag suggestions come from the items on the list.
- **Images** are resized in the browser (`lib/images.ts`: 1600px longest side plus a 320px thumbnail, JPEG). The API only accepts JPEG (magic bytes), stores BLOBs in `images` and serves them immutable for a year; new upload, new id. `ImagesUtils.deleteUnused()` skips images younger than a minute to cover the gap between saving an image and the row that points to it.
- **Recipes** store ingredients and steps one per line. `EntryListField` edits them like the recipe page looks: one card per section, rows that show their controls only when focused (✕ for an ingredient; Up / Down / Remove for a step), Enter adds the next entry, Backspace on an empty one removes it, pasting several lines splits them. Ingredients are sorted on save and on display.
- **Calendar** events are `date` plus optional `startTime`/`endTime` (none means all day). "Google Calendar" and "Apple Calendar" (`.ics` as `text/calendar`) are built on the server in `CalendarExportUtils` with floating times on purpose.
- **Sorting** uses `compareText` (`lib/sorting.ts`: case-insensitive, numbers before letters, 2 before 10) for list chips, todos within a list and under Done, shopping items in every section, stores, tags and ingredients. "Coming up" sorts by date, then name. Recipes and people come sorted from the API.
- **Live sync:** every change calls `LiveUtils.broadcast(topic)`; `/api/live` (SSE) pushes it and `useLiveUpdates` invalidates the query with the same key. After a reconnect it refetches everything.

## Code style (both sides)

- No comments. Names and small, readable steps explain the code.
- Spelled-out code over clever one-liners: no dense ternary chains, no reduce tricks, no inline IIFEs.
- 4-space indentation, double quotes, semicolons.

## API

- Static `XUtils` classes in `src/utils/<domain>/utils.ts`, routers in `src/api/<domain>/_index.ts`, config in `src/config/*`.
- Routes: `try { ... return Generic.handleSuccessMessage(...) } catch (e: any) { return Generic.handleExceptionMessage(e.message, response) }`.
- Validate input in the utils with the `Generic.parse*` helpers; throw with `Generic.throw*` / `Generic.buildNotFoundException`.
- SQL: raw parameterized queries through `new DB().fetch(query, parameters)` with `?` placeholders and table-prefixed aliases (`t.id AS t_id`). Booleans are stored as `0/1`, dates as ISO text.
- Migrations: plain `.sql` files in `api/migrations`, named `<timestamp>-<what>.sql`, applied in order on startup. Never edit an applied one; add a new file. They run with foreign keys off and are checked with `foreign_key_check` before commit, so rebuilding a table is safe.
- Images: JPEG data URLs as `image: { data, thumbnail }` (`null` removes, missing keeps), served from `/api/images/:id` and `/:id/thumbnail`. Lists show thumbnails only. Call `ImagesUtils.deleteUnused()` after anything that drops an image reference.
- Everything under `/api` is behind `Generic.requireAuth`. Identity comes only from the session cookie. State changes use POST/PUT/PATCH/DELETE. JSON parsing for `/api` (8mb, for photos) runs only after auth; `/auth` parses 16kb.
- Every change that other people should see calls `LiveUtils.broadcast(<topic>)`; topics match the web query keys.
- Calendar dates and times are local strings (`YYYY-MM-DD`, `HH:MM`) with no timezone, exported as floating times. Repeating todos use the server's local date, so set `TZ` in `docker-compose.yml`.

## Web

- One component per file, PascalCase, with a sibling `Component.module.css`. Pages in `src/pages/<area>`, shared pieces in `src/components`, data access in `src/lib`.
- All server data goes through the hooks in `src/lib/queries.ts`. Never `fetch` inside components. Adding, checking, editing and deleting update the cache optimistically and sheets close straight away; only photo uploads wait for the server. Home Wi-Fi can take 40 ms to 2.5 s per round trip while the server answers in ~3 ms, so don't make the UI wait on anything it can predict.
- No user-facing text in components: every string is a key in `src/translations/en.ts` with a European Portuguese twin in `pt.ts` (typed as `Translations`, so a missing key fails the build). Components call `useTranslation()` for `t` and `locale`; helpers outside components take `t` or the `Translator` as an argument. Values go in as `{name}` placeholders, counts as `{ one, other }` plural entries (`Intl.PluralRules`). Pass `locale` to the `lib/dates.ts` formatters. Sentences whose grammar changes with the value (weekdays in "every Monday") get one key per value rather than glued fragments. API errors are shown by `internalErrorCode` (`getErrorMessage(error, t)`), never by their English `description`. The language follows the device unless someone picks one on the Ninho page (stored per device in `localStorage`). Stored data (list names, tags, items) is never translated.
- Use tokens from `src/styles/tokens.css` for every color, size, radius, font and duration. No raw hex values in component CSS.
- Adding and editing happen in bottom sheets (`Sheet`), never on separate form pages. Read "Sheets" below before touching `Sheet`.
- Tags are lowercase pills typed into `TagsField` (Enter, a comma or leaving the field adds one), with tags already in use offered underneath. Free-text values that repeat, like stores, get the same `Suggestions` chips as you type. Don't use `<datalist>`: iOS Safari barely shows it.
- Free-text fields in sheets set `autoComplete="off"`, or iOS offers "AutoFill Contact" on anything labelled like a name.
- Hover styles that would stick after a tap on iPhone go inside `@media (hover: hover)`; use `:active` for touch feedback.

## Sheets

Every add/edit form is a bottom card that rises from the bottom of the screen and can be pulled down to close. Most of `Sheet`'s code exists because of iOS Safari; each part fixed a reported bug.

- **Plain fixed elements, not `<dialog>`.** `Sheet` portals into `<body>` a fixed `.dim`, a fixed `.panel` on the bottom edge and a `.keyboardGap`. It rebuilds the modal behaviour by hand: `#root` gets `inert`, Escape closes, the first `[data-autofocus]` field (or the panel) gets focus, focus returns to the opener, and `<html>` gets `overflow: hidden`.
- **Safari 26 bar colours.** iOS 26 (Safari and home-screen apps alike) ignores `theme-color` and tints the top and bottom bars from fixed elements at the screen edges, falling back to the body background. It re-reads them only when a top-edge layer at least ~10px tall appears or disappears; colour changes, re-inserting or hiding an existing element, thinner strips and overflow toggles do nothing. So:
  - The bottom bar is constant: `AppLayout` sets `body`'s background to `var(--surface)` while the app is shown, so the bottom bar continues the tab bar or an open card. `.layout` paints its own `--paper` background so the body colour never shows.
  - The top bar is the page colour via `AppLayout`'s 12px `.safariTopBarTint` strip. While a card is open, `Sheet` adds its own 12px `.topBarTint` above the dim, coloured like the page under the dim at the current level (`color-mix` with `--backdrop-tint` / `--backdrop-strength`, the same maths as the dim), and **replaces it with a fresh element** every time the level changes, so iOS re-reads it and the status bar dims and fades in step with the page.
  - The dim level is driven frame by frame (`--dim-level` on the sheet wrapper) for opening, dragging, closing and springing back, with a safety timer that finishes the fade if frames stall (headless Chrome runs none), so a swipe can never leave the app blocked behind an invisible card.
- **Swipe down to close.** Native touch listeners (React's are passive and the drag must block scrolling): a drag that starts on the panel while it's scrolled to the top, not on a form field, follows the finger after 10 px and closes past 30% of the panel's height or on a flick; otherwise it springs back. The dim and the top-bar tint fade with the drag. Any `input` inside the panel marks it changed, and then every way of closing (swipe, ✕, the dim, Escape) asks "Discard your changes?". Submitting a form clears the mark, because some cards stay open after saving (the calendar swaps the form for the new event's details). Saving that closes the card goes through the parent and never asks.
- **Keyboard.** Only text-entry fields (`text`, `search`, `email`, `url`, `tel`, `password`, `number`, `textarea`) open the keyboard. While one is focused, `Sheet` reads `window.visualViewport` and sets `--keyboard-inset` / `--visible-height` on its wrapper, so the panel sits right above the keyboard, and `.keyboardGap` fills the strip down to the bottom (iOS 26 floats the URL pill above the keyboard). With no text field focused it uses no viewport numbers at all: iOS sometimes reports nothing after the keyboard closes or when focus moves to a date picker, which left cards stuck at keyboard height. It re-measures every frame for 700 ms after focus or viewport changes, and scrolls the focused field into view, or its nearest `[data-sheet-reveal]` ancestor (the recipe editor rows use it so their controls clear the keyboard). A `position: fixed` `::after` inside the scrolling panel doesn't escape it on iOS; the gap filler has to be a sibling.
- **Taps while typing.** iOS moves focus off the text field when you tap a button; the card then jumped before the click landed and needed a second tap. `Sheet`'s `onMouseDown` prevents that focus change for buttons, links and labels while a text field is focused.

## Other gotchas

- TypeScript is pinned to `~6.0.3`: 7.x breaks ts-node. TS 6 has `strict` on by default, which is why `Generic.throw*` helpers return `never`; keep that so narrowing works.
- `node:sqlite` won't bind JS booleans: store `0/1`, map with `=== 1`. Use `RETURNING id` to detect "not found" on UPDATE/DELETE.
- Route order matters (`/done`, `/checkout` and `/me/...` before `/:id`). The SPA fallback uses Express 5 `/{*path}`; `/api` has its own JSON 404.
- Hashed `/assets` are served `immutable` for a year; `index.html` is always revalidated.
- The Dockerfile's build stages run on the builder's own platform (`--platform=$BUILDPLATFORM`) and only the last stage is built per target, so the arm64 image doesn't emulate Vite and tsc. Their output must stay plain JS; the runtime stage installs the production dependencies itself.
- The home-screen scope comes from `public/manifest.webmanifest` (`scope` and `start_url` `/`). Without it iOS treated the saved URL as the whole app and showed Safari's bar on other tabs. iOS reads it only when the icon is added.
- Chrome on Android installs Ninho as an app only over HTTPS (on plain HTTP it offers just a shortcut) and only with the 192 and 512 px PNG icons in the manifest (`icon-192.png`, `icon-512.png`, maskable, with padding for the crop).
- iOS form quirks: date and time inputs need `appearance: none`, `min-width: 0` and a fixed height (`TextField.module.css`), and `select` must inherit `font`/`color` or iOS paints it system blue.
- TanStack `mutate(..., { onSuccess })` callbacks only fire for the last call when one mutation runs several times at once.

## Checks to run

```sh
cd api && npm test            # strict tsc + node:test (calendar export, repeating to-dos)
cd web && npm run build       # strict tsc -b + vite build
cd web && npm run lint        # oxlint on src
docker build --platform linux/amd64 -t ninho:test .   # from the repo root
```

## Testing in a browser

- End to end: run the built API on a scratch DB, `DATABASE_PATH=<scratch>/x.db PORT=3912 WEB_DIST_PATH=<absolute path to web/dist> node api/dist/app.js`, and seed it through the API with curl and a cookie jar (`/auth/setup` creates the first user).
- Headless Chrome: work on a scratch copy of the built site. Stub `window.EventSource` in its `index.html`, or `--virtual-time-budget` never settles because of SSE. Drive the app inside a 375px iframe on a same-origin harness page, and write results into the page for `--dump-dom`. CSS animations freeze under virtual time, so finish them (`getAnimations()`) before measuring. A small Node proxy that delays requests reproduces slow Wi-Fi.
- iOS: use an Xcode iOS 26 simulator (e.g. iOS 26.2 "iPhone 17 Pro"), which shows the software keyboard. `xcrun simctl boot | ui <device> appearance dark | openurl | io <device> screenshot`. Sign in with a scratch page that POSTs `/auth/login` and redirects; open sheets with a scratch script that clicks an element named in the URL hash (change the query too, or the page won't reload). Read colours by converting screenshots with `sips -s format bmp`. Scripting real taps and drags needs macOS Accessibility permission; without it, test gestures with synthetic touch events in Chrome.

## Not verified on a device

- "Apple Calendar" opening the iOS add-event sheet.
- Picking photos on an iPhone (HEIC should arrive as JPEG; `createImageBitmap(..., { imageOrientation: "from-image" })` should honour EXIF rotation).
- Swipe-to-close and the keyboard behaviour with real fingers, and the home-screen manifest scope after re-adding the icon.

## Ideas mentioned or deferred

- Trip planning, eventually.
- Chores that alternate between people ("take turns"); today the assignee is fixed.
- "Add this recipe's ingredients to the shopping list".
- Events that span several days.
- A "more" button beside quick-add that opens the full sheet with the typed name, for items that need details from the start.
- HTTPS through `tailscale serve`, then offline support (a service worker needs a secure context).
- One instance is one household; don't build multi-household support until asked.
