"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Upload, FileText, Database } from "lucide-react";

interface UploadSuccessAnimationProps {
  readonly jobCount: number;
  readonly onComplete: () => void;
}

export default function UploadSuccessAnimation({
  jobCount,
  onComplete,
}: UploadSuccessAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onComplete}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.2,
          }}
          className="mb-6"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        </motion.div>

        {/* Process Flow Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full"
            >
              <Upload className="w-5 h-5 text-blue-600" />
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
              className="h-0.5 w-8 bg-green-500"
            />

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1, type: "spring" }}
              className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full"
            >
              <FileText className="w-5 h-5 text-green-600" />
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.2, duration: 0.3 }}
              className="h-0.5 w-8 bg-green-500"
            />

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1.4, type: "spring" }}
              className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full"
            >
              <Database className="w-5 h-5 text-green-600" />
            </motion.div>
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Jobs Uploaded Successfully!
          </h2>
          <p className="text-slate-600 mb-6">
            {jobCount} job{jobCount !== 1 ? "s" : ""} have been imported and are
            now live on your careers page.
          </p>
        </motion.div>

        {/* Celebration Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute inset-0 pointer-events-none"
        >
          {Array.from({ length: 12 }, (_, i) => {
            const getParticleColor = (index: number): string => {
              if (index % 3 === 0) return "bg-blue-500";
              if (index % 3 === 1) return "bg-green-500";
              return "bg-purple-500";
            };

            const particleId = `particle-${Date.now()}-${i}`;

            return (
              <motion.div
                key={particleId}
                initial={{
                  scale: 0,
                  x: "50%",
                  y: "50%",
                  rotate: 0,
                }}
                animate={{
                  scale: [0, 1, 0],
                  x: `${50 + (Math.random() - 0.5) * 200}%`,
                  y: `${50 + (Math.random() - 0.5) * 200}%`,
                  rotate: 360,
                }}
                transition={{
                  duration: 2,
                  delay: 1.8 + i * 0.1,
                  ease: "easeOut",
                }}
                className={`absolute w-2 h-2 rounded-full ${getParticleColor(
                  i
                )}`}
              />
            );
          })}
        </motion.div>

        {/* Close Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          onClick={onComplete}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
