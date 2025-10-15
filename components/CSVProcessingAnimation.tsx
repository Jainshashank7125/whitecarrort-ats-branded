"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Database, Upload, Check } from "lucide-react";

interface CSVProcessingAnimationProps {
  readonly stage:
    | "uploading"
    | "parsing"
    | "validating"
    | "saving"
    | "complete";
  readonly progress: number;
  readonly fileName?: string;
  readonly recordCount?: number;
}

export default function CSVProcessingAnimation({
  stage,
  progress,
  fileName,
  recordCount,
}: CSVProcessingAnimationProps) {
  const stages = [
    { id: "uploading", label: "Uploading file", icon: Upload, color: "blue" },
    {
      id: "parsing",
      label: "Parsing CSV data",
      icon: FileText,
      color: "purple",
    },
    {
      id: "validating",
      label: "Validating records",
      icon: Database,
      color: "orange",
    },
    {
      id: "saving",
      label: "Saving to database",
      icon: Database,
      color: "green",
    },
    { id: "complete", label: "Complete", icon: Check, color: "green" },
  ];

  const currentStageIndex = stages.findIndex((s) => s.id === stage);
  const currentStage = stages[currentStageIndex];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            key={stage}
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`w-16 h-16 mx-auto mb-4 bg-${currentStage.color}-100 rounded-full flex items-center justify-center`}
          >
            <currentStage.icon
              className={`w-8 h-8 text-${currentStage.color}-600`}
            />
          </motion.div>

          <motion.h2
            key={`title-${stage}`}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-xl font-semibold text-slate-900 mb-2"
          >
            {currentStage.label}
          </motion.h2>

          {fileName && (
            <p className="text-sm text-slate-600">
              Processing: <span className="font-medium">{fileName}</span>
            </p>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {stages.slice(0, -1).map((stageItem, index) => {
              const isCompleted = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;

              return (
                <React.Fragment key={stageItem.id}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${(() => {
                      if (isCompleted) return "bg-green-500 text-white";
                      if (isCurrent)
                        return `bg-${currentStage.color}-500 text-white`;
                      return "bg-slate-200 text-slate-400";
                    })()}`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                  </motion.div>

                  {index < stages.length - 2 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: isCompleted ? 1 : 0 }}
                      transition={{ duration: 0.3, delay: (index + 1) * 0.1 }}
                      className="flex-1 h-0.5 bg-green-500 mx-2"
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>Upload</span>
            <span>Parse</span>
            <span>Validate</span>
            <span>Save</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className={`h-2 bg-${currentStage.color}-500 rounded-full`}
            />
          </div>
        </div>

        {/* Additional Info */}
        {recordCount && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-sm text-slate-600">
              Found{" "}
              <span className="font-medium text-slate-900">{recordCount}</span>{" "}
              job records
            </p>
          </motion.div>
        )}

        {/* Animated Dots */}
        <div className="flex justify-center mt-4">
          {Array.from({ length: 3 }, (_, i) => (
            <motion.div
              key={`processing-indicator-${i}`}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className={`w-2 h-2 bg-${currentStage.color}-500 rounded-full mx-1`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
