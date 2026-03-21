# Ichiron Template Dashboard

A modern admin dashboard template built with **SvelteKit 2**, **Svelte 5**, and **Tailwind CSS v4**. Designed as a starting point for building full-featured back-office or management systems.

## Features

- **Authentication** — Login page with session guard (localStorage-based)
- **Responsive Sidebar** — Collapsible navigation with grouped menu items and badge support
- **Topbar** — User profile, notifications, and quick actions
- **Dashboard Pages** — Pre-built pages for common use cases:
  - Dashboard overview
  - Analytics
  - Reports
  - Users management
  - Products management
  - Orders (with detail page)
  - Notifications
  - Settings
- **DataTable Component** — Reusable table with sorting and pagination
- **Excel Export** — Utility for exporting table data to `.xlsx`
- **TypeScript** — Fully typed throughout

## Tech Stack

| Tool | Version |
|------|---------|
| SvelteKit | ^2.55 |
| Svelte | ^5.53 |
| Tailwind CSS | ^4.2 |
| TypeScript | ^5.9 |
| Vite | ^8.0 |
| Bun | (recommended) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)

### Installation

```bash
# Clone the repository
git clone https://github.com/ichiron-dev/production-traceback.git
cd ichiron-template-dashboard

# Install dependencies (using bun)
bun install

# or using npm
npm install
```

### Development

```bash
bun dev
# or
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
bun run build
# or
npm run build
```

### Preview production build

```bash
bun run preview
# or
npm run preview
```

## Demo Login

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | any value |

> Any non-empty username/password will work. Use `admin` as username to get the Administrator role.

## Project Structure

```
src/
├── lib/
│   ├── components/        # Shared UI components
│   │   ├── DataTable.svelte
│   │   ├── SessionGuard.svelte
│   │   ├── Sidebar.svelte
│   │   └── Topbar.svelte
│   ├── config/
│   │   └── nav.ts         # Navigation menu configuration
│   ├── data/
│   │   └── order-mock.ts  # Mock data
│   ├── stores/
│   │   ├── auth.ts        # Authentication store & login/logout
│   │   ├── session.ts     # Session management
│   │   └── sidebar.ts     # Sidebar open/close state
│   ├── table/
│   │   └── index.svelte.ts  # Table state logic
│   ├── types/
│   │   └── index.ts       # Shared TypeScript types
│   └── utils/
│       └── excel.ts       # Excel export utility
└── routes/
    ├── +layout.svelte     # Root layout
    ├── +page.svelte       # Root redirect
    ├── login/             # Login page
    └── dashboard/         # Protected dashboard routes
        ├── analytics/
        ├── notifications/
        ├── orders/
        │   └── [id]/      # Order detail page
        ├── products/
        ├── reports/
        ├── settings/
        └── users/
```

## Customization

### Adding a new page

1. Create a new folder under `src/routes/dashboard/`
2. Add a `+page.svelte` file
3. Register the route in `src/lib/config/nav.ts`

### Modifying the navigation menu

Edit `src/lib/config/nav.ts` to add, remove, or reorder navigation groups and items.

## License

MIT
