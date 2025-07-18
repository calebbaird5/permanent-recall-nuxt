# Permanent Recall (Nuxt)

A spaced repetition and passage review web app built with Nuxt 3, Bun, and Prisma. This project helps users upload, review, and manage passages for long-term retention, with authentication, bulk upload, and user settings management.

---

## Features

- User authentication (register, login, logout)
- Passage CRUD (create, read, update, delete)
- Bulk upload of passages
- Spaced repetition review system
- User profile and settings
- Role management (admin/user)
- Modern UI with Nuxt UI

---

## Tech Stack

- [Nuxt 3](https://nuxt.com/) (Vue 3 framework)
- [Bun](https://bun.sh/) (default package manager/runtime)
- [Prisma](https://www.prisma.io/) (ORM)
- [Nuxt UI](https://ui.nuxt.com/) (UI components)
- [TypeScript](https://www.typescriptlang.org/)

---

## Project Structure

```
permanent-recall-nuxt/
├── app/                # Nuxt app source (components, pages, layouts, assets)
├── server/             # API routes (REST endpoints, business logic)
│   └── api/
│       ├── auth/       # Auth endpoints
│       ├── passages/   # Passage endpoints
│       ├── roles/      # Role endpoints
│       ├── settings/   # User settings endpoints
│       └── users/      # User endpoints
├── prisma/             # Prisma schema
├── types/              # Shared TypeScript types
├── public/             # Static assets
├── nuxt.config.ts      # Nuxt configuration
└── package.json        # Project metadata and scripts
```

---

## Setup

Install dependencies (default: Bun):

```bash
bun install
```

Or use npm, pnpm, or yarn:

```bash
npm install
# or
pnpm install
# or
yarn install
```

---

## Development

Start the development server at [http://localhost:3000](http://localhost:3000):

```bash
bun run dev
```

Or with npm, pnpm, or yarn:

```bash
npm run dev
# or
pnpm run dev
# or
yarn dev
```

---

## Production

Build the application for production:

```bash
bun run build
```

Preview the production build locally:

```bash
bun run preview
```

---

## Database

This project uses Prisma. To set up the database, run:

```bash
bunx prisma migrate dev
```

---

## Further Documentation

- [Nuxt Documentation](https://nuxt.com/docs/getting-started/introduction)
- [Nuxt UI Documentation](https://ui.nuxt.com)
- [Prisma Documentation](https://www.prisma.io/docs)

---

Feel free to open issues or contribute!
