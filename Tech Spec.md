# Careers Page Builder - Tech Spec Summary

## Overview

- Builds branded careers pages for recruiters.
- Supports CSV job imports and preview of unpublished pages.

## Tech Stack

- **Frontend:** Next.js (App Router), React, TailwindCSS, Framer Motion.
- **Backend/DB:** Supabase (Postgres + Auth + RLS).
- **APIs:** `/api/preview-token`, `/api/csv-import`.
- **Utilities:** PapaParse (CSV parsing), sanitize-html (content sanitization).

## Data Models

- `companies` → company info, branding, 2-color theme, published state.
- `content_sections` → custom page sections (HTML/text content).
- `jobs` → job listings with title, description, type, location.
- Relationships: `company` 1:N with `content_sections` and `jobs`.

## Security & Auth

- Supabase Auth for authentication.
- RLS ensures users access only their own company data.
- Preview tokens scaffolded; recommend JWT or DB-stored tokens.
- All user/CSV content sanitized before DB insert.

## Deployment

- Hosted on **Vercel** (frontend + serverless API routes).
- Environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
