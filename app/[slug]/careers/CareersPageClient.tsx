"use client";

import { useState, useEffect } from "react";
import { Company, ContentSection, Job } from "@/lib/supabase/client";
import { Search, MapPin, Briefcase, X, Building } from "lucide-react";

interface CareersPageClientProps {
  company: Company;
  sections: ContentSection[];
  jobs: Job[];
}

export default function CareersPageClient({
  company,
  sections,
  jobs,
}: CareersPageClientProps) {
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(jobs);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [pageSize, setPageSize] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSizeOption, setPageSizeOption] = useState<string>("5"); // '5'|'10'|'20'|'custom'
  const [customPageSize, setCustomPageSize] = useState<string>("");

  useEffect(() => {
    filterJobs();
  }, [searchTerm, locationFilter, typeFilter, departmentFilter]);
  // reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, locationFilter, typeFilter, departmentFilter, jobs.length]);

  const filterJobs = () => {
    let filtered = [...jobs];

    if (searchTerm) {
      filtered = filtered.filter((job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter) {
      filtered = filtered.filter((job) =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (typeFilter) {
      filtered = filtered.filter((job) => job.job_type === typeFilter);
    }

    if (departmentFilter) {
      filtered = filtered.filter((job) => job.department === departmentFilter);
    }

    setFilteredJobs(filtered);
  };

  const getVideoEmbedUrl = (url: string) => {
    if (!url) return null;

    const youtubeMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/
    );
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return url;
  };

  const uniqueLocations = Array.from(
    new Set(jobs.map((j) => j.location))
  ).sort();
  const uniqueTypes = Array.from(new Set(jobs.map((j) => j.job_type))).sort();
  const uniqueDepartments = Array.from(
    new Set(jobs.map((j) => j.department).filter(Boolean))
  ).sort();

  // Pagination calculations
  const totalJobs = filteredJobs.length;
  const totalPages = Math.max(1, Math.ceil(totalJobs / pageSize));

  // Keep currentPage in range when totalPages changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Update pageSize when option or custom size changes
  useEffect(() => {
    if (pageSizeOption === "custom") {
      const parsed = parseInt(customPageSize || "5", 10);
      const clamped = Math.max(5, isNaN(parsed) ? 5 : parsed);
      setPageSize(clamped);
    } else {
      setPageSize(Number(pageSizeOption));
    }
    // reset to first page when page size changes
    setCurrentPage(1);
  }, [pageSizeOption, customPageSize]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalJobs);
  const pagedJobs = filteredJobs.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-white">
      <div
        className="relative bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden"
        style={{
          background: company.banner_url
            ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${company.banner_url})`
            : `linear-gradient(135deg, ${company.primary_color}, ${company.secondary_color})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            {company.logo_url && (
              <div className="flex justify-center mb-6">
                <img
                  src={company.logo_url}
                  alt={`${company.name} logo`}
                  className="h-16 sm:h-20 w-auto"
                />
              </div>
            )}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Careers at {company.name}
            </h1>
            {company.tagline && (
              <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto">
                {company.tagline}
              </p>
            )}
          </div>
        </div>
      </div>

      {sections.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {sections.map((section) => (
            <section key={section.id} className="mb-12 sm:mb-16">
              <h2
                className="text-3xl sm:text-4xl font-bold mb-6"
                style={{ color: company.primary_color }}
              >
                {section.title}
              </h2>
              <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                {section.content}
              </div>
            </section>
          ))}
        </div>
      )}

      {company.video_url && (
        <div className="bg-slate-50 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
              <iframe
                src={getVideoEmbedUrl(company.video_url) || ""}
                title="Company culture video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      <div id="open-positions" className="bg-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-8 text-center"
            style={{ color: company.primary_color }}
          >
            Open Positions
          </h2>

          <div className="bg-slate-50 rounded-xl p-4 sm:p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <label htmlFor="search" className="sr-only">
                  Search by job title
                </label>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search by job title"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="relative">
                <label htmlFor="location-filter" className="sr-only">
                  Filter by location
                </label>
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  id="location-filter"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
                >
                  <option value="">All Locations</option>
                  {uniqueLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label htmlFor="department-filter" className="sr-only">
                  Filter by department
                </label>
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  id="department-filter"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
                >
                  <option value="">All Departments</option>
                  {uniqueDepartments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label htmlFor="type-filter" className="sr-only">
                  Filter by job type
                </label>
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  id="type-filter"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
                >
                  <option value="">All Types</option>
                  {uniqueTypes.map((type) => (
                    <option key={type} value={type}>
                      {type
                        .split("-")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(searchTerm ||
              locationFilter ||
              departmentFilter ||
              typeFilter) && (
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm text-slate-600">Active filters:</span>
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm text-slate-700 hover:bg-slate-100 transition"
                    >
                      Search: {searchTerm}
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {locationFilter && (
                    <button
                      onClick={() => setLocationFilter("")}
                      className="flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm text-slate-700 hover:bg-slate-100 transition"
                    >
                      {locationFilter}
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {departmentFilter && (
                    <button
                      onClick={() => setDepartmentFilter("")}
                      className="flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm text-slate-700 hover:bg-slate-100 transition"
                    >
                      {departmentFilter}
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {typeFilter && (
                    <button
                      onClick={() => setTypeFilter("")}
                      className="flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm text-slate-700 hover:bg-slate-100 transition"
                    >
                      {typeFilter
                        .split("-")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {jobs.length === 0
                ? "No open positions at the moment."
                : "No jobs match your filters."}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pagedJobs.map((job) => (
                <article
                  key={job.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-3 mb-4">
                        <span className="flex items-center gap-1.5 text-sm text-slate-600">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Briefcase className="w-4 h-4" />
                          {job.job_type
                            .split("-")
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ")}
                        </span>
                        {job.department && (
                          <span className="text-sm text-slate-600">
                            {job.department}
                          </span>
                        )}
                        {job.salary_range && (
                          <span
                            className="text-sm font-medium"
                            style={{ color: company.primary_color }}
                          >
                            {job.salary_range}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 line-clamp-3">
                        {job.description}
                      </p>
                    </div>
                    <button
                      className="px-6 py-3 rounded-lg font-semibold text-white transition hover:opacity-90 whitespace-nowrap"
                      style={{ backgroundColor: company.primary_color }}
                      onClick={() => {
                        alert(
                          "Application form would open here. Integration with your ATS system required."
                        );
                      }}
                    >
                      Apply Now
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination controls */}
          {filteredJobs.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label
                  htmlFor="page-size-select"
                  className="text-sm text-slate-600"
                >
                  Show
                </label>
                <select
                  value={pageSizeOption}
                  id="page-size-select"
                  onChange={(e) => setPageSizeOption(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="custom">Custom</option>
                </select>
                {pageSizeOption === "custom" && (
                  <input
                    type="number"
                    min={5}
                    value={customPageSize}
                    onChange={(e) => setCustomPageSize(e.target.value)}
                    className="w-20 px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  />
                )}
                <span className="text-sm text-slate-500">per page</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-600">
                  Showing{" "}
                  <span className="font-medium">
                    {totalJobs === 0 ? 0 : startIndex + 1}
                  </span>
                  –<span className="font-medium">{endIndex}</span> of{" "}
                  <span className="font-medium">{totalJobs}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-slate-200 bg-white disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <div className="px-3 py-2 rounded-lg border border-slate-200 bg-white">
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-slate-200 bg-white disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400">
            &copy; {new Date().getFullYear()} {company.name}. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
