import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export interface Company {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  logo_url?: string;
  banner_url?: string;
  video_url?: string;
  primary_color: string;
  secondary_color: string;
  tagline?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentSection {
  id: string;
  company_id: string;
  type: string;
  title: string;
  content: string;
  position: number;
  is_visible: boolean;
  created_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  location: string;
  job_type: string;
  department?: string;
  salary_range?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
