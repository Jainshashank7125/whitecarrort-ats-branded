/*
  # Careers Pages Platform Schema

  ## Overview
  This migration creates the complete schema for a multi-tenant ATS Careers page builder.
  Recruiters can customize their company's branded Careers page, and candidates can browse jobs.

  ## New Tables

  ### `companies`
  Stores company profile and branding information
  - `id` (uuid, primary key) - Unique company identifier
  - `user_id` (uuid, foreign key) - Links to auth.users (recruiter who owns this company)
  - `slug` (text, unique) - URL-friendly company identifier for public pages
  - `name` (text) - Company name
  - `logo_url` (text, nullable) - Company logo image URL
  - `banner_url` (text, nullable) - Hero banner image URL
  - `video_url` (text, nullable) - Culture/about video URL
  - `primary_color` (text) - Brand primary color (hex)
  - `secondary_color` (text) - Brand secondary color (hex)
  - `tagline` (text, nullable) - Company tagline/mission statement
  - `is_published` (boolean) - Whether the careers page is live
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `content_sections`
  Flexible content blocks for careers pages (About Us, Life at Company, Benefits, etc.)
  - `id` (uuid, primary key) - Unique section identifier
  - `company_id` (uuid, foreign key) - Links to companies table
  - `type` (text) - Section type: 'about', 'culture', 'benefits', 'values', 'custom'
  - `title` (text) - Section heading
  - `content` (text) - Section body content (markdown/HTML)
  - `position` (integer) - Display order on the page
  - `is_visible` (boolean) - Whether section is shown on public page
  - `created_at` (timestamptz) - Record creation timestamp

  ### `jobs`
  Job postings linked to companies
  - `id` (uuid, primary key) - Unique job identifier
  - `company_id` (uuid, foreign key) - Links to companies table
  - `title` (text) - Job title
  - `description` (text) - Full job description
  - `location` (text) - Job location (e.g., "Remote", "New York, NY")
  - `job_type` (text) - Employment type: 'full-time', 'part-time', 'contract', 'internship'
  - `department` (text, nullable) - Department/team name
  - `salary_range` (text, nullable) - Salary information if disclosed
  - `is_active` (boolean) - Whether job is currently accepting applications
  - `created_at` (timestamptz) - Job posting date
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security

  ### Row Level Security (RLS)
  All tables have RLS enabled with restrictive policies:

  #### Companies
  - Recruiters can view/edit only their own companies
  - Public (unauthenticated) users can view published companies

  #### Content Sections
  - Recruiters can manage sections for their own companies
  - Public users can view visible sections for published companies

  #### Jobs
  - Recruiters can manage jobs for their own companies
  - Public users can view active jobs for published companies

  ## Indexes
  - `companies.slug` - Fast lookup for public careers pages
  - `companies.user_id` - Fast lookup of companies by recruiter
  - `content_sections.company_id` - Fast retrieval of all sections for a company
  - `jobs.company_id` - Fast retrieval of all jobs for a company
  - `jobs.is_active` - Fast filtering of active jobs
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  logo_url text,
  banner_url text,
  video_url text,
  primary_color text DEFAULT '#3B82F6',
  secondary_color text DEFAULT '#1E40AF',
  tagline text,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create content_sections table
CREATE TABLE IF NOT EXISTS content_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  job_type text NOT NULL,
  department text,
  salary_range text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_content_sections_company_id ON content_sections(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Recruiters can view own companies"
  ON companies FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Recruiters can insert own companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Recruiters can update own companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Recruiters can delete own companies"
  ON companies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view published companies"
  ON companies FOR SELECT
  TO anon
  USING (is_published = true);

-- Content sections policies
CREATE POLICY "Recruiters can view own company sections"
  ON content_sections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = content_sections.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can insert own company sections"
  ON content_sections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = content_sections.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can update own company sections"
  ON content_sections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = content_sections.company_id
      AND companies.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = content_sections.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can delete own company sections"
  ON content_sections FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = content_sections.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view visible sections of published companies"
  ON content_sections FOR SELECT
  TO anon
  USING (
    is_visible = true
    AND EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = content_sections.company_id
      AND companies.is_published = true
    )
  );

-- Jobs policies
CREATE POLICY "Recruiters can view own company jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = jobs.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can insert own company jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = jobs.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can update own company jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = jobs.company_id
      AND companies.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = jobs.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can delete own company jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = jobs.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view active jobs of published companies"
  ON jobs FOR SELECT
  TO anon
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = jobs.company_id
      AND companies.is_published = true
    )
  );