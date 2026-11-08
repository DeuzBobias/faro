# Deploy FARO on Netlify

FARO uses Netlify Functions, Netlify Identity, and Netlify Database. The functions verify the Identity token on every request and scope every record query to that verified user ID.

## Connect the project

Import this Git repository in Netlify with the repository root as the base directory. The included `netlify.toml` configures the pnpm build, static output, API function routing, and SPA fallback. Netlify deploys subsequent Git pushes automatically.

After the first site is created:

1. Enable Netlify Identity in the site dashboard and set registration to invite-only if FARO is being used by a defined research cohort. Configure the confirmation and recovery email settings.
2. Enable Netlify Database for the site. The SQL migration under `netlify/database/migrations` creates the tables automatically during deployment.
3. Add Netlify Identity widget/SDK configuration to the site before opening sign-in to participants. Set the permitted site URL and auth redirect URLs in the Identity settings.
4. Confirm a production deploy and test registration, sign-in, record isolation, account deletion, and offline sync with test accounts before inviting participants.

The previous hosted account IDs are provider-specific. No migration of existing user accounts or records is performed by this code. Export any needed records from the old service before retiring it, and plan an explicit account recovery/import process if old records must be retained.
