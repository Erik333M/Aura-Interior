# Switching to Postgres

The schema is written to be Postgres-portable — no enums, no `Json`, no array
columns, money as `Int`. Moving over is a provider swap, not a migration:

1. `npm run db:use-postgres` (rewrites `provider` in schema.prisma)
2. Set `DATABASE_URL` to your `postgres://…` connection string
3. `npm run db:push && npm run db:seed`

`src/db.ts` picks the driver adapter from the URL scheme at runtime, so nothing
else changes. Run `npm run db:use-sqlite` to go back for local work.
