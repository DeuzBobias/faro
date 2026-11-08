# FARO local professional portal

Run `npm.cmd run dev` in this folder, then open http://127.0.0.1:8445.
The server also binds to the laptop's network address for phones on the same LAN.

## Accounts and permissions

Local accounts now require registration and a matching password. Passwords are salted and hashed; sessions use HTTP-only cookies and expire after 24 hours. Local accounts are independent of Netlify accounts. Older simulated accounts did not have passwords: register the same email locally to associate a password with that demonstration identity and keep its records. Do not put real participant data in this development database.

Create the first administrator from a terminal on the laptop after starting the app:

```powershell
node scripts/local-admin.mjs admin@faro.local
```

The command prints a randomly generated password for a new account. Existing accounts keep their password. Optional final argument: `doctor` or `psychologist`. The script is a laptop-owner provisioning operation, not a public API.

The administrator signs in at the normal login page and is routed to `/admin/users`. Administrators can assign verified roles, suspend/reactivate accounts, and review access events. They cannot open the professional record APIs. Changing access invalidates that account's sessions.

Doctors and psychologists are routed to `/doctor`. They see only active students who have enabled sharing in **Professional support**. They can review FAS history and the latest 90 daily logs, then send preventive guidance or a consultation recommendation. Messages appear in the student's care inbox. Consent withdrawal blocks subsequent record reads and messages. Optional local web-push delivery is documented in LOCAL-PHONE-NOTIFICATIONS.md. This prototype has no email notification delivery, automated medical escalation, or trained MLR inference. FAS score bands are not urgency categories.

## Without internet

The laptop can sign in, register, save FAS, record routines, and use the professional portal without internet while the local server is running. Browser connectivity indicators do not determine whether localhost is reachable.

A disconnected phone cannot reach the laptop's server. Student cached access requires first loading the **production-built PWA over HTTPS**, waiting for offline assets to finish, and signing in to save a device snapshot. It resumes that student's saved records; it does not authenticate a new account offline. New FAS submissions and professional/admin operations require a reachable server. Signing out or clearing browser storage removes offline access. Ordinary HTTP LAN development URLs cannot provide installable offline service-worker behavior on phones. This work does not deploy a hosted update or configure HTTPS certificates on the phone.

## Scope and verification

The care APIs and local password accounts are implemented for the SQLite development version. Netlify authentication and existing production admin routes are unchanged; the professional portal is not a production deployment. Use fictional test records only on the HTTP LAN preview.

Run `npm.cmd run typecheck`, `npm.cmd test`, and `npm.cmd run build` for checks.
