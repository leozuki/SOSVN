<div align="center">

<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

  <h1>Built with AI Studio</h2>

  <p>The fastest path from prompt to production with Gemini.</p>

  <a href="https://aistudio.google.com/apps">Start building</a>

</div>

## Documents

- CRM PRD: `docs/crm-prd.md`

## CRM MVP Backend (Phase 1 Kickoff)

A minimal TypeScript + Express backend scaffold has been added to start implementing the CRM PRD.

### Implemented endpoints (scaffold)

- `POST /auth/login`
- `POST /auth/register` (placeholder)
- `GET/POST/PUT/DELETE /contacts`
- `GET/POST /deals`
- `PUT /deals/:id/stage`
- `GET/POST /tasks`
- `GET/POST /tickets`
- `GET /audit-logs` (admin/manager)

### Local run

```bash
npm install
npm run dev
```

Default port: `3000`.
Use `x-user-id` header (`u-admin`, `u-manager`, `u-sales-1`) to simulate RBAC.
