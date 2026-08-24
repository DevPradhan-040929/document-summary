"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Image as ImageIcon, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  MAX_FILE_SIZE_LABEL,
  SUPPORTED_EXTENSIONS,
  validateFile,
} from "@/lib/validation/file";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  onValidationError: (message: string) => void;
}

export function UploadZone({
  onFileSelected,
  disabled,
  onValidationError,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) return;
      const result = validateFile(file);
      if (!result.valid) {
        onValidationError(result.error ?? "Please upload a PDF or image.");
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected, onValidationError]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label="Upload a PDF or image document, drag and drop or press Enter to browse files"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (disabled) return;
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "focus-ring group relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-8 sm:p-14 text-center cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-card hover:border-primary/60 hover:bg-muted/50",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={SUPPORTED_EXTENSIONS.join(",")}
          className="sr-only"
          disabled={disabled}
          onChange={(e) => handleFile(e.target.files?.[0])}
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
          <UploadCloud className="h-8 w-8" aria-hidden />
        </div>

        <div className="space-y-1">
          <p className="text-base font-semibold sm:text-lg">
            Drag &amp; drop your document here
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse from your device
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1">
            <FileText className="h-3 w-3" aria-hidden /> PDF
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1">
            <ImageIcon className="h-3 w-3" aria-hidden /> PNG / JPG
          </span>
          <span className="rounded-full border border-border px-2.5 py-1">
            Up to {MAX_FILE_SIZE_LABEL}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
