# Dabi — Backend

Local hostel discovery platform (backend API).

## Stack

- Node.js
- Express
- TypeScript
- Prisma (PostgreSQL)

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL
npm run prisma:generate
npm run prisma:migrate # creates tables (needs a running Postgres)
npm run db:seed        # optional: populate with demo admin data
npm run dev
```

The API runs on http://localhost:4000.

## Structure

- `src/config` — environment & app configuration
- `src/prisma.ts` — Prisma client singleton
- `src/types.ts` — DTO types shared by controllers (shaped like the frontend admin types)
- `src/utils` — `errors` (ApiError) and `asyncHandler`
- `src/middleware` — `errorHandler` (maps ApiError / Prisma errors to JSON)
- `src/services` — database access & business logic (hostel, owner, enquiry, deal, dashboard)
- `src/controllers` — thin request handlers
- `src/routes` — Express routers mounted in `server.ts`
- `prisma/schema.prisma` — data model
- `prisma/seed.ts` — demo data (owners, hostels, enquiries, deals, admin)
- `uploads` — uploaded files

## Data model

| Model    | Notes                                                        |
| -------- | ------------------------------------------------------------ |
| Hostel   | Owns `ownerId` (Owner), many-to-many `facilities` (Facility) |
| Owner    | Has many Hostels                                             |
| Enquiry  | Optional `hostelId` (Hostel)                                 |
| Deal     | Optional `hostelId` (Hostel), unique `code`                  |
| Facility | Lookup table joined to Hostels                              |
| Admin    | Admin login accounts (password stored scrypt-hashed)         |

## API (mounted under `/api`)

- `GET/POST /hostels`, `GET/PUT/DELETE /hostels/:id`
- `GET/POST /owners`, `GET/PUT/DELETE /owners/:id`
- `GET /enquiries`, `GET/PUT/DELETE /enquiries/:id`
- `GET/POST /deals`, `GET/PUT/DELETE /deals/:id`
- `GET /dashboard/stats`

> The admin frontend currently uses a mock `localStorage` service
> (`src/services/adminApi.ts`) and is **not yet wired** to this API.
