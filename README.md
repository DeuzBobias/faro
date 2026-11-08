# FARO

## Local professional portal

The SQLite development version now includes password-checked accounts, an administrator access-management panel, and a consent-based doctor/psychologist review panel. See [LOCAL-PORTAL.md](LOCAL-PORTAL.md) for account provisioning, offline limitations, and the distinction from the hosted configuration. The earlier simulated any-password sign-in is no longer used.

FARO is a personal routine tracker. It uses React, Netlify Functions, Netlify Identity, and Netlify Database.

## What works

- Netlify Identity sign-in, profile setup and editing, and account-scoped database access.
- First-time profile setup leads to the separate Fatigue Assessment Scale (FAS); results remain separate from daily fatigue monitoring, with server-enforced three-month retakes.
- Create, edit, and delete one daily log per date with server-side validation.
- Dashboard averages, calendar history, fatigue and energy trends from saved entries.
- Routine reflections based on the latest entry and personal goals.
- CSV log export, JSON account export, printable summary, and account data deletion.
- PWA manifest and icons, home-screen installation on supported browsers, and offline screens with device-saved records and queued changes.

Fatigue ratings are self-reported. No trained prediction model is connected. The local SQLite version includes consent-based clinical review and optional web-push notifications; hosted feature parity has not been verified. After the first online sign-in, profile and logs are stored on this device. Offline edits and deletions queue locally and sync while FARO is open after reconnecting. First sign-in and account deletion require a connection.

## Development

Use Node.js 24 or newer (the development database uses Node SQLite) and pnpm.

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:8445 on the laptop. To preview on a phone connected to the same private Wi-Fi, open `http://<laptop Wi-Fi IPv4 address>:8445` (find the address with `ipconfig`). Keep the laptop and server running. The local preview uses password-checked local accounts and SQLite data in `.local/faro.sqlite`, separate from production. Use test data on this network-accessible preview; this folder is ignored by Git.

```powershell
pnpm typecheck
pnpm test
pnpm build
```

The build outputs the client to `dist/client`; Netlify Functions and the SQL schema migration are in `netlify/`. See `netlify/README.md` for the destination setup requirements.

## Phone

Open the hosted FARO URL and sign in with Netlify Identity. Set up your profile, then save your first log. On Android, choose Install app/Add to Home Screen in Chrome. On iPhone, use Safari's Share → Add to Home Screen. Open once online and wait for the offline download before disconnecting; the laptop is not needed.

## Security and data

Netlify Identity verifies the user token in each function request; user IDs are taken only from that verified token, never client-supplied data. Every data query is scoped to that user. Mutations validate request origin, fields, and size. Logs and profile API responses use no-store. The service worker caches the app shell and local assets, never API responses. Account data and pending changes are stored separately in localStorage on this device. Use a trusted device: local records are readable by anyone using its browser profile. Sign-out, a rejected session, or switching accounts clears the previous device snapshot and unsynced changes. Sync verifies account identity before replaying changes; same-date offline edits replace the server entry. Storage quota errors are reported without claiming a save. No trained model or model-training pipeline is connected. Clinical review is available in the local SQLite version for active students who enable sharing.

Test coverage includes authentication, cross-account isolation, invalid inputs, record updates, deletion, restart persistence, summary calculations, and safe CSV quoting.

## Branding

App-ready FARO V2 assets are in `public/branding`. The original artwork remains in the parent workspace's `assets/branding` folder. Navy #081E35, green #54B391, mint #E9F5F2, and dark green #23745B.
