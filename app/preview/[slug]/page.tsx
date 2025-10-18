import { createClient } from "@/lib/supabase/server";
import CareersPageClient from "@/app/[slug]/careers/CareersPageClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type PageProps = {
  params?: Promise<{ slug: string }>; // Next.js generated types expect a Promise here
  searchParams?: Promise<{ token?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const p = params ? await params : undefined;
  const slug = p?.slug;
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("name, tagline")
    .eq("slug", slug)
    .maybeSingle();

  if (!company) {
    return { title: "Preview Not Found" };
  }

  return { title: `Preview: Careers at ${company.name}` };
}

// Very lightweight token validation (scaffold). Token is base64 payload created by editor.
const isValidToken = (token: string | undefined, companyId: string) => {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [cid, , ts] = decoded.split(":");
    if (!cid || !ts) return false;
    if (cid !== companyId) return false;
    const created = Number(ts);
    if (Number.isNaN(created)) return false;
    // 15 minutes window
    if (Date.now() - created > 1000 * 60 * 15) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export default async function PreviewPage({ params, searchParams }: PageProps) {
  const p = params ? await params : undefined;
  const slug = p?.slug ?? "";
  const sp = searchParams ? await searchParams : undefined;
  const tokenRaw = sp?.token;
  const token = Array.isArray(tokenRaw) ? tokenRaw[0] : tokenRaw;
  const supabase = await createClient();

  // Fetch company ignoring is_published but only if token is valid
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  console.log("slug", slug);

  if (!company) notFound();

  if (!isValidToken(token, company.id)) {
    notFound();
  }

  const { data: sections } = await supabase
    .from("content_sections")
    .select("*")
    .eq("company_id", company.id)
    .order("position");

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  return (
    <CareersPageClient
      company={company}
      sections={sections || []}
      jobs={jobs || []}
    />
  );
}
