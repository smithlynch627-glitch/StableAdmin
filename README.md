# Admin panel: STABLE NFTs Launchpad & Marketplace

A separate app from the public website. It is built and deployed on its own, so none of its code ships to
marketplace users. It talks to the same backend API, which only answers `/api/admin/*` requests coming from
this site's address (`ADMIN_ORIGINS`) **and** from a wallet that has an admin role.

## Run locally (PowerShell)

```powershell
cd admin
npm install
Copy-Item .env.example .env   # VITE_API_URL=http://localhost:8080
npm run dev                   # http://localhost:5174
```

Backend `.env` must include `ADMIN_ORIGINS=http://localhost:5174` (and your production admin URL).

## Deploy on Netlify (its own site)

1. New site from the same repo: base directory `admin`, build `npm run build`, publish `admin/dist`.
2. Environment: `VITE_API_URL` (Railway API URL), `VITE_SITE_URL` (public marketplace URL).
3. Use a hard-to-guess subdomain, e.g. `ops-<random>.yourdomain.com`. Don't link it from the public site.
4. Add its URL to the backend's `ADMIN_ORIGINS` and redeploy the API.
5. Extra layer (recommended): Netlify **Site protection → Password** (Pro plan), or Cloudflare Access in front of it.

`netlify.toml` already sets a strict CSP, no-index, no caching of pages, and anti-framing headers.

## Who can sign in

- **Root owners:** wallets in the backend's `ADMIN_ADDRESSES`.
- **Everyone else:** wallets added in the Team tab or with `db/03_first_admin.sql`.

The role is checked on every request, and admin actions need a wallet sign-in from the last 12 hours.

| Tab | Role |
|---|---|
| Overview, Support tickets | support |
| Collections, Import from GIWA, Contracts & fees, Audit log | admin |
| Network (switch to mainnet), Team | owner |
