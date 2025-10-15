# WhiteCarrot Careers

A lightweight, multi-tenant careers page builder built with Next.js, Tailwind CSS and Supabase. Recruiters can create branded careers pages for their companies, manage flexible content sections, and post jobs that candidates can browse. Pages support company branding (logo, banner, colors), embedded culture videos, and rich content sections.

This project includes an admin editing UI with live previews, drag-and-drop CSV job import (with validation, preview, and bulk insert), and delightful animations powered by Framer Motion. It uses Supabase for auth, row-level security, and relational storage of companies, content sections, and jobs—designed as a starter kit for ATS integrations or small recruiting teams.


## Key features

- Multi-tenant company profiles and branding
- Flexible content sections (About, Culture, Benefits, etc.)
- Job management UI with create, update, delete
- CSV job import workflow with validation and preview
- Supabase for auth, storage, and RLS policies
- Responsive UI with Tailwind CSS and Framer Motion animations


## Quick start

Prerequisites:


```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```


## Import jobs from CSV

1. Go to the Edit page (`/edit`) and create or select a company.
2. Navigate to the **Jobs** tab and click **Upload CSV**.
3. Drop or select the CSV file. A processing animation will run while the file is parsed and validated.
4. You can preview parsed jobs and then confirm to import them into your Supabase database.

Expected CSV format (columns):

```csv
title,work_policy,location,department,employment_type,experience_level,job_type,salary_range
```

Required fields: `title`, `location`, `employment_type`.

## Tech stack


`nextjs`, `react`, `tailwindcss`, `supabase`, `framer-motion`, `csv`, `import`, `careers`, `ats`, `hrtech`


If you want, I can also add contributing guidelines, tests, or GitHub Actions for lint/build checks. Let me know which you'd like next.
