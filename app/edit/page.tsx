"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Company, ContentSection, Job } from "@/lib/supabase/client";
import {
  LogOut,
  Eye,
  Save,
  Plus,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Upload,
} from "lucide-react";
import CSVUploader from "@/components/CSVUploader";
import UploadSuccessAnimation from "@/components/UploadSuccessAnimation";

export default function EditPage() {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"branding" | "content" | "jobs">(
    "branding"
  );
  const [showCSVUploader, setShowCSVUploader] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [uploadedJobCount, setUploadedJobCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: companyData } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (companyData) {
        setCompany(companyData);

        const { data: sectionsData } = await supabase
          .from("content_sections")
          .select("*")
          .eq("company_id", companyData.id)
          .order("position");

        setSections(sectionsData || []);

        const { data: jobsData } = await supabase
          .from("jobs")
          .select("*")
          .eq("company_id", companyData.id)
          .order("created_at", { ascending: false });

        setJobs(jobsData || []);
      }
    } catch (error) {
      console.error("Error loading company data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const slug = `company-${Date.now()}`;
      const { data, error } = await supabase
        .from("companies")
        .insert({
          user_id: user.id,
          slug,
          name: "My Company",
          primary_color: "#3B82F6",
          secondary_color: "#1E40AF",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating company:", error);
        return;
      }

      setCompany(data);
    } catch (error) {
      console.error("Error creating company:", error);
    }
  };

  const saveCompany = async () => {
    if (!company) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("companies")
        .update({
          name: company.name,
          slug: company.slug,
          logo_url: company.logo_url,
          banner_url: company.banner_url,
          video_url: company.video_url,
          primary_color: company.primary_color,
          secondary_color: company.secondary_color,
          tagline: company.tagline,
          is_published: company.is_published,
          updated_at: new Date().toISOString(),
        })
        .eq("id", company.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error saving company:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handlePreview = () => {
    if (company) {
      window.open(`/${company.slug}/careers`, "_blank");
    }
  };

  const addSection = async () => {
    if (!company) return;

    const newSection: Partial<ContentSection> = {
      company_id: company.id,
      type: "custom",
      title: "New Section",
      content: "Add your content here...",
      position: sections.length,
      is_visible: true,
    };

    const { data, error } = await supabase
      .from("content_sections")
      .insert(newSection)
      .select()
      .single();

    if (!error && data) {
      setSections([...sections, data]);
    }
  };

  const updateSection = async (
    id: string,
    updates: Partial<ContentSection>
  ) => {
    const { error } = await supabase
      .from("content_sections")
      .update(updates)
      .eq("id", id);

    if (!error) {
      setSections(
        sections.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
    }
  };

  const deleteSection = async (id: string) => {
    const { error } = await supabase
      .from("content_sections")
      .delete()
      .eq("id", id);

    if (!error) {
      setSections(sections.filter((s) => s.id !== id));
    }
  };

  const moveSectionUp = async (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [
      newSections[index],
      newSections[index - 1],
    ];

    await Promise.all(
      newSections.map((section, idx) =>
        supabase
          .from("content_sections")
          .update({ position: idx })
          .eq("id", section.id)
      )
    );

    setSections(newSections);
  };

  const moveSectionDown = async (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [
      newSections[index + 1],
      newSections[index],
    ];

    await Promise.all(
      newSections.map((section, idx) =>
        supabase
          .from("content_sections")
          .update({ position: idx })
          .eq("id", section.id)
      )
    );

    setSections(newSections);
  };

  const addJob = async () => {
    if (!company) return;

    const newJob: Partial<Job> = {
      company_id: company.id,
      title: "New Job Opening",
      description: "Job description goes here...",
      location: "Remote",
      job_type: "full-time",
      is_active: true,
    };

    const { data, error } = await supabase
      .from("jobs")
      .insert(newJob)
      .select()
      .single();

    if (!error && data) {
      setJobs([data, ...jobs]);
    }
  };

  const updateJob = async (id: string, updates: Partial<Job>) => {
    const { error } = await supabase
      .from("jobs")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      setJobs(jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)));
    }
  };

  const deleteJob = async (id: string) => {
    const { error } = await supabase.from("jobs").delete().eq("id", id);

    if (!error) {
      setJobs(jobs.filter((j) => j.id !== id));
    }
  };

  const handleCSVJobsUpload = async (csvJobs: Partial<Job>[]) => {
    if (!company) return;

    try {
      setSaving(true);

      // Insert all jobs in bulk
      const { data, error } = await supabase
        .from("jobs")
        .insert(csvJobs)
        .select();

      if (error) {
        console.error("Error uploading jobs:", error);
        return;
      }

      if (data) {
        // Add new jobs to the existing jobs list
        setJobs([...data, ...jobs]);
        setUploadedJobCount(data.length);
        setShowCSVUploader(false);
        setShowSuccessAnimation(true);
      }
    } catch (error) {
      console.error("Error in CSV upload:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSuccessAnimationComplete = () => {
    setShowSuccessAnimation(false);
    setUploadedJobCount(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Welcome!</h2>
          <p className="text-slate-600 mb-6">
            Let&apos;s create your company&apos;s careers page.
          </p>
          <button
            onClick={createCompany}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            Create Careers Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {company.name}
              </h1>
              <p className="text-sm text-slate-600">/{company.slug}/careers</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={saveCompany}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="border-b border-slate-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("branding")}
                className={`px-6 py-4 font-medium border-b-2 transition ${
                  activeTab === "branding"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                Branding
              </button>
              <button
                onClick={() => setActiveTab("content")}
                className={`px-6 py-4 font-medium border-b-2 transition ${
                  activeTab === "content"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                Content Sections
              </button>
              <button
                onClick={() => setActiveTab("jobs")}
                className={`px-6 py-4 font-medium border-b-2 transition ${
                  activeTab === "jobs"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                Jobs
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "branding" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={company.name}
                      onChange={(e) =>
                        setCompany({ ...company, name: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={company.slug}
                      onChange={(e) =>
                        setCompany({
                          ...company,
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "-"),
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={company.tagline || ""}
                    onChange={(e) =>
                      setCompany({ ...company, tagline: e.target.value })
                    }
                    placeholder="Your mission or value proposition"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={company.primary_color}
                        onChange={(e) =>
                          setCompany({
                            ...company,
                            primary_color: e.target.value,
                          })
                        }
                        className="w-16 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={company.primary_color}
                        onChange={(e) =>
                          setCompany({
                            ...company,
                            primary_color: e.target.value,
                          })
                        }
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={company.secondary_color}
                        onChange={(e) =>
                          setCompany({
                            ...company,
                            secondary_color: e.target.value,
                          })
                        }
                        className="w-16 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={company.secondary_color}
                        onChange={(e) =>
                          setCompany({
                            ...company,
                            secondary_color: e.target.value,
                          })
                        }
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={company.logo_url || ""}
                    onChange={(e) =>
                      setCompany({ ...company, logo_url: e.target.value })
                    }
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Banner Image URL
                  </label>
                  <input
                    type="url"
                    value={company.banner_url || ""}
                    onChange={(e) =>
                      setCompany({ ...company, banner_url: e.target.value })
                    }
                    placeholder="https://example.com/banner.jpg"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Culture Video URL
                  </label>
                  <input
                    type="url"
                    value={company.video_url || ""}
                    onChange={(e) =>
                      setCompany({ ...company, video_url: e.target.value })
                    }
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={company.is_published}
                    onChange={(e) =>
                      setCompany({ ...company, is_published: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="is_published"
                    className="text-sm font-medium text-slate-700"
                  >
                    Publish careers page (make it public)
                  </label>
                </div>
              </div>
            )}

            {activeTab === "content" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-600">
                    Add sections to tell your company&apos;s story
                  </p>
                  <button
                    onClick={addSection}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Section
                  </button>
                </div>

                {sections.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    No sections yet. Add one to get started!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sections.map((section, index) => (
                      <div
                        key={section.id}
                        className="border border-slate-200 rounded-lg p-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col gap-1 pt-2">
                            <button
                              onClick={() => moveSectionUp(index)}
                              disabled={index === 0}
                              className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                              aria-label="Move section up"
                            >
                              <ArrowUp className="w-4 h-4 text-slate-600" />
                            </button>
                            <GripVertical className="w-4 h-4 text-slate-400" />
                            <button
                              onClick={() => moveSectionDown(index)}
                              disabled={index === sections.length - 1}
                              className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                              aria-label="Move section down"
                            >
                              <ArrowDown className="w-4 h-4 text-slate-600" />
                            </button>
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={section.title}
                                onChange={(e) =>
                                  updateSection(section.id, {
                                    title: e.target.value,
                                  })
                                }
                                className="px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm font-medium"
                                placeholder="Section Title"
                              />
                              <select
                                value={section.type}
                                onChange={(e) =>
                                  updateSection(section.id, {
                                    type: e.target.value,
                                  })
                                }
                                className="px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                              >
                                <option value="about">About Us</option>
                                <option value="culture">Culture</option>
                                <option value="benefits">Benefits</option>
                                <option value="values">Values</option>
                                <option value="custom">Custom</option>
                              </select>
                            </div>
                            <textarea
                              value={section.content}
                              onChange={(e) =>
                                updateSection(section.id, {
                                  content: e.target.value,
                                })
                              }
                              rows={4}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                              placeholder="Section content..."
                            />
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id={`visible-${section.id}`}
                                checked={section.is_visible}
                                onChange={(e) =>
                                  updateSection(section.id, {
                                    is_visible: e.target.checked,
                                  })
                                }
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                              />
                              <label
                                htmlFor={`visible-${section.id}`}
                                className="text-sm text-slate-700"
                              >
                                Visible on careers page
                              </label>
                            </div>
                          </div>

                          <button
                            onClick={() => deleteSection(section.id)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                            aria-label="Delete section"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "jobs" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-600">
                    Manage your open positions
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowCSVUploader(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium"
                    >
                      <Upload className="w-4 h-4" />
                      Upload CSV
                    </button>
                    <button
                      onClick={addJob}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add Job
                    </button>
                  </div>
                </div>

                {jobs.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    No jobs posted yet. Add one to get started!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div
                        key={job.id}
                        className="border border-slate-200 rounded-lg p-4"
                      >
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={job.title}
                              onChange={(e) =>
                                updateJob(job.id, { title: e.target.value })
                              }
                              className="px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm font-medium"
                              placeholder="Job Title"
                            />
                            <input
                              type="text"
                              value={job.location}
                              onChange={(e) =>
                                updateJob(job.id, { location: e.target.value })
                              }
                              className="px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                              placeholder="Location"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <select
                              value={job.job_type}
                              onChange={(e) =>
                                updateJob(job.id, { job_type: e.target.value })
                              }
                              className="px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                            >
                              <option value="full-time">Full-time</option>
                              <option value="part-time">Part-time</option>
                              <option value="contract">Contract</option>
                              <option value="internship">Internship</option>
                            </select>
                            <input
                              type="text"
                              value={job.department || ""}
                              onChange={(e) =>
                                updateJob(job.id, {
                                  department: e.target.value,
                                })
                              }
                              className="px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                              placeholder="Department"
                            />
                            <input
                              type="text"
                              value={job.salary_range || ""}
                              onChange={(e) =>
                                updateJob(job.id, {
                                  salary_range: e.target.value,
                                })
                              }
                              className="px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                              placeholder="Salary Range"
                            />
                          </div>

                          <textarea
                            value={job.description}
                            onChange={(e) =>
                              updateJob(job.id, { description: e.target.value })
                            }
                            rows={4}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                            placeholder="Job description..."
                          />

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id={`active-${job.id}`}
                                checked={job.is_active}
                                onChange={(e) =>
                                  updateJob(job.id, {
                                    is_active: e.target.checked,
                                  })
                                }
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                              />
                              <label
                                htmlFor={`active-${job.id}`}
                                className="text-sm text-slate-700"
                              >
                                Active (accepting applications)
                              </label>
                            </div>
                            <button
                              onClick={() => deleteJob(job.id)}
                              className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 text-red-600 rounded-lg transition text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSV Uploader Modal */}
      {showCSVUploader && company && (
        <CSVUploader
          companyId={company.id}
          onJobsUploaded={handleCSVJobsUpload}
          onClose={() => setShowCSVUploader(false)}
        />
      )}

      {/* Success Animation */}
      {showSuccessAnimation && (
        <UploadSuccessAnimation
          jobCount={uploadedJobCount}
          onComplete={handleSuccessAnimationComplete}
        />
      )}
    </div>
  );
}
