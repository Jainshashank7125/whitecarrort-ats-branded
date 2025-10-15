"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, Check, AlertCircle, Loader2 } from "lucide-react";
import Papa from "papaparse";
import { Job } from "@/lib/supabase/client";
import CSVProcessingAnimation from "./CSVProcessingAnimation";

interface CSVData {
  title: string;
  work_policy: string;
  location: string;
  department: string;
  employment_type: string;
  experience_level: string;
  job_type: string;
  salary_range: string;
  job_slug: string;
  posted_days_ago: string;
}

interface CSVUploaderProps {
  readonly onJobsUploaded: (jobs: Partial<Job>[]) => void;
  readonly onClose: () => void;
  readonly companyId: string;
}

export default function CSVUploader({
  onJobsUploaded,
  onClose,
  companyId,
}: CSVUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [previewData, setPreviewData] = useState<Partial<Job>[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showProcessingAnimation, setShowProcessingAnimation] = useState(false);
  const [processingStage, setProcessingStage] = useState<
    "uploading" | "parsing" | "validating" | "saving" | "complete"
  >("uploading");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mapCSVToJob = (csvRow: CSVData): Partial<Job> => {
    // Map employment_type to job_type (standardize format)
    const mapEmploymentType = (type: string): string => {
      const typeMap: { [key: string]: string } = {
        "Full time": "full-time",
        "Part time": "part-time",
        Contract: "contract",
        Internship: "internship",
        Temporary: "contract", // Map temporary to contract
        Permanent: "full-time", // Map permanent to full-time
      };
      return typeMap[type] || "full-time";
    };

    // Generate a basic job description based on available data
    const generateDescription = (row: CSVData): string => {
      return `We are looking for a ${row.experience_level} ${
        row.title
      } to join our ${
        row.department
      } team. This is a ${row.employment_type.toLowerCase()} position based in ${
        row.location
      }.

Key Details:
• Experience Level: ${row.experience_level}
• Work Policy: ${row.work_policy}
• Department: ${row.department}
${row.salary_range ? `• Salary Range: ${row.salary_range}` : ""}

We welcome applications from qualified candidates who are passionate about making an impact in our organization.`;
    };

    return {
      company_id: companyId,
      title: csvRow.title || "Untitled Position",
      description: generateDescription(csvRow),
      location: csvRow.location || "Not specified",
      job_type: mapEmploymentType(csvRow.employment_type),
      department: csvRow.department || undefined,
      salary_range: csvRow.salary_range || undefined,
      is_active: true,
    };
  };

  const processCSVFile = async (file: File) => {
    setIsProcessing(true);
    setUploadStatus("idle");
    setErrorMessage("");
    setFileName(file.name);
    setShowProcessingAnimation(true);

    // Stage 1: Uploading
    setProcessingStage("uploading");
    setProcessingProgress(10);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Stage 2: Parsing
    setProcessingStage("parsing");
    setProcessingProgress(30);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processResults = async () => {
          try {
            setProcessingProgress(50);

            if (results.errors.length > 0) {
              throw new Error(
                `CSV parsing errors: ${results.errors
                  .map((e) => e.message)
                  .join(", ")}`
              );
            }

            const csvData = results.data as CSVData[];

            if (csvData.length === 0) {
              throw new Error("No data found in CSV file");
            }

            // Stage 3: Validating
            setProcessingStage("validating");
            setProcessingProgress(70);
            await new Promise((resolve) => setTimeout(resolve, 800));

            // Validate required fields
            const requiredFields = ["title", "location", "employment_type"];
            const firstRow = csvData[0];
            const missingFields = requiredFields.filter(
              (field) => !firstRow[field as keyof CSVData]
            );

            if (missingFields.length > 0) {
              throw new Error(
                `Missing required fields: ${missingFields.join(", ")}`
              );
            }

            // Stage 4: Processing data
            setProcessingProgress(90);
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Convert CSV data to Job format
            const jobs = csvData.map(mapCSVToJob);

            setProcessingProgress(100);
            setProcessingStage("complete");
            await new Promise((resolve) => setTimeout(resolve, 300));

            setPreviewData(jobs);
            setShowPreview(true);
            setShowProcessingAnimation(false);
            setUploadStatus("success");
          } catch (error) {
            setShowProcessingAnimation(false);
            setErrorMessage(
              error instanceof Error ? error.message : "Unknown error occurred"
            );
            setUploadStatus("error");
          } finally {
            setIsProcessing(false);
          }
        };

        processResults().catch(console.error);
      },
      error: (error) => {
        setShowProcessingAnimation(false);
        setErrorMessage(`Failed to parse CSV: ${error.message}`);
        setUploadStatus("error");
        setIsProcessing(false);
      },
    });
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.includes("csv") && !file.name.endsWith(".csv")) {
      setErrorMessage("Please select a valid CSV file");
      setUploadStatus("error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setErrorMessage("File size must be less than 5MB");
      setUploadStatus("error");
      return;
    }

    processCSVFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const confirmUpload = () => {
    onJobsUploaded(previewData);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              Upload Jobs from CSV
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {!showPreview ? (
              <>
                {/* Upload Area */}
                <motion.div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${(() => {
                    if (isDragOver) return "border-blue-400 bg-blue-50";
                    if (uploadStatus === "error")
                      return "border-red-300 bg-red-50";
                    return "border-slate-300 hover:border-slate-400";
                  })()}`}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  <AnimatePresence mode="wait">
                    {(() => {
                      if (isProcessing) {
                        return (
                          <motion.div
                            key="processing"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-blue-600"
                          >
                            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
                            <p className="text-lg font-medium">
                              Processing CSV...
                            </p>
                            <p className="text-sm text-slate-600 mt-2">
                              Parsing and validating your job data
                            </p>
                          </motion.div>
                        );
                      }

                      if (uploadStatus === "error") {
                        return (
                          <motion.div
                            key="error"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-red-600"
                          >
                            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                            <p className="text-lg font-medium">Upload Failed</p>
                            <p className="text-sm text-red-700 mt-2">
                              {errorMessage}
                            </p>
                            <button
                              onClick={() => {
                                setUploadStatus("idle");
                                setErrorMessage("");
                              }}
                              className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
                            >
                              Try Again
                            </button>
                          </motion.div>
                        );
                      }

                      return (
                        <motion.div
                          key="upload"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-slate-600"
                        >
                          <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                          <p className="text-lg font-medium mb-2">
                            Drop your CSV file here or click to browse
                          </p>
                          <p className="text-sm text-slate-500 mb-4">
                            Supports CSV files up to 5MB
                          </p>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                          >
                            Select CSV File
                          </button>
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>
                </motion.div>

                {/* CSV Format Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 p-4 bg-slate-50 rounded-lg"
                >
                  <h3 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Expected CSV Format
                  </h3>
                  <p className="text-sm text-slate-600 mb-2">
                    Your CSV should include these columns:
                  </p>
                  <div className="text-xs font-mono bg-white p-2 rounded border text-slate-700">
                    title, work_policy, location, department, employment_type,
                    experience_level, job_type, salary_range
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Required: title, location, employment_type
                  </p>
                </motion.div>
              </>
            ) : (
              /* Preview Section */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">
                    CSV processed successfully!
                  </span>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-medium text-slate-900 mb-3">
                    Preview: {previewData.length} jobs ready to import
                  </h3>

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {previewData.slice(0, 5).map((job, index) => (
                      <motion.div
                        key={`job-preview-${job.title}-${job.location}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-3 rounded border text-sm"
                      >
                        <div className="font-medium text-slate-900">
                          {job.title}
                        </div>
                        <div className="text-slate-600">
                          {job.location} •{" "}
                          {job.job_type
                            ?.split("-")
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ")}
                          {job.department && ` • ${job.department}`}
                        </div>
                        {job.salary_range && (
                          <div className="text-slate-500 text-xs">
                            {job.salary_range}
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {previewData.length > 5 && (
                      <div className="text-center text-slate-500 text-sm py-2">
                        And {previewData.length - 5} more jobs...
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      setPreviewData([]);
                      setUploadStatus("idle");
                    }}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                  >
                    Upload Different File
                  </button>
                  <motion.button
                    onClick={confirmUpload}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Import {previewData.length} Jobs
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Processing Animation */}
      {showProcessingAnimation && (
        <CSVProcessingAnimation
          stage={processingStage}
          progress={processingProgress}
          fileName={fileName}
          recordCount={previewData.length}
        />
      )}
    </AnimatePresence>
  );
}
