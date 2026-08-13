# SciConnect CMS

SciConnect CMS is the headless backend for the SciConnect publishing platform, built on top of [Payload CMS v3](https://payloadcms.com) and Next.js 15. It handles content management, editorial workflows, media assets, newsletter distributions, and user comments.

## Features
- **Headless Content Delivery:** Provides REST API access for the SciConnect frontend (Next.js App Router).
- **Custom Dashboard:** Fully customized Publishing Operations Dashboard with live KPIs, modular layout, CSS charts, and systemic health warnings.
- **Editorial Roles & Workflows:** Draft vs Published states, Authors, Categories, and Tags.
- **Audience Engagement:** Moderatable user Comments and Newsletter Subscriber management.
- **SEO Ready:** Fields enforced for Meta titles and descriptions, with dashboard-level health scores.
- **Media Management:** Built-in upload system supporting high-resolution image optimization.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **CMS:** Payload CMS v3
- **Database:** PostgreSQL (via Payload Postgres adapter)
- **Styling:** Custom CSS/SCSS

## Getting Started

### 1. Prerequisites
- Node.js (v20+)
- PostgreSQL Database

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and fill in the required values:
```env
DATABASE_URL=postgres://...
PAYLOAD_SECRET=your_secret
NEXT_PUBLIC_SITE_URL=http://localhost:4001
NEXT_PUBLIC_SERVER_URL=http://localhost:4000
```

### 4. Running the Development Server
```bash
npm run dev
```
The Payload CMS admin panel will be accessible at `http://localhost:4000/admin`.

## Building for Production
```bash
npm run build
npm start
```
Ensure your production environment variables (e.g., `NEXT_PUBLIC_SITE_URL`, `DATABASE_URL`) are properly configured.
