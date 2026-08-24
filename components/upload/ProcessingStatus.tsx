"use client";

import { motion } from "framer-motion";
import { FileScan, Loader2, ScanText, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import type { ProcessingStage } from "@/types";

interface ProcessingStatusProps {
  stage: ProcessingStage;
  detail?: string;
  progress?: number;
  fileName?: string;
}

const stageMeta: Partial<
  Record<ProcessingStage, { label: string; icon: typeof FileScan }>
> = {
  validating: { label: "Validating file…", icon: FileScan },
  "extracting-text": { label: "Extracting text…", icon: ScanText },
  "running-ocr": { label: "Running OCR…", icon: ScanText },
  summarizing: { label: "Generating AI summary…", icon: Sparkles },
};

export function ProcessingStatus({
  stage,
  detail,
  progress,
  fileName,
}: ProcessingStatusProps) {
  const meta = stageMeta[stage];
  if (!meta) return null;
  const Icon = meta.icon;

  return (
    <Card role="status" aria-live="polite" className="animate-fade-in">
      <CardContent className="flex items-center gap-4">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden />
          <Loader2
            className="absolute h-11 w-11 animate-spin text-primary/30"
            aria-hidden
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{meta.label}</p>
          <p className="truncate text-xs text-muted-foreground">
            {detail ?? fileName ?? "Please wait…"}
          </p>
          {typeof progress === "number" && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(progress * 100)}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
