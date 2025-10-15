import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import CareersPageClient from './CareersPageClient';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: company } = await supabase
    .from('companies')
    .select('name, tagline')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (!company) {
    return {
      title: 'Careers Page Not Found',
    };
  }

  return {
    title: `Careers at ${company.name}`,
    description: company.tagline || `Join the team at ${company.name}`,
  };
}

export default async function CareersPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (!company) {
    notFound();
  }

  const { data: sections } = await supabase
    .from('content_sections')
    .select('*')
    .eq('company_id', company.id)
    .eq('is_visible', true)
    .order('position');

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('company_id', company.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (
    <CareersPageClient
      company={company}
      sections={sections || []}
      jobs={jobs || []}
    />
  );
}
