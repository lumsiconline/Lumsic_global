# Lumsic Global

React + JavaScript customer experience with a Node.js/Express API and Supabase auth/database integration.

## Routes
- `/` public website
- `/login`, `/signup`, `/forgot-password` account access
- `/account` customer area
- `/admin` protected admin workspace
- `/astrologer` protected astrologer workspace
- `/chat/:sessionId` protected direct chat route

## Local setup
1. Copy `.env.example` to `.env` and fill in Supabase project values.
2. Run `npm install`.
3. Run `npm run dev` (Vite client + Express API).

## Security foundations
- Supabase access tokens are verified server-side on every protected API request.
- Roles are read from `public.user_roles`, never user-editable metadata.
- Admin, astrologer and customer session access is enforced by the API.
- Astrologers are linked to reader records by account email and can access only assigned sessions.
- Service-role key is server-only; never expose it in VITE_ variables.
- Helmet headers, production CORS allowlist, JSON size limit and API rate limiting are enabled.

## Existing database
Uses existing `profiles`, `user_roles`, `readers`, `consultation_sessions` and `chat_messages` tables. No automatic migrations or database modifications are run.

## CI workflow
GitHub Actions runs the install, frontend build and Docker build checks on every push to `main` and on pull requests targeting `main`.

## Still required before production
Payments/wallet, reader onboarding, admin assignment and transfer actions, realtime delivery, password-reset completion UX, monitoring, full end-to-end tests, and production secrets/configuration still need implementation and verification.