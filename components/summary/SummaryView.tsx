"use client";

import { motion } from "framer-motion";
import {
  Lightbulb,
  ListChecks,
  RotateCcw,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { SummaryLengthSelector } from "@/components/summary/SummaryLengthSelector";
import { ListSectionCard } from "@/components/summary/ListSectionCard";
import { DocumentInfoBar } from "@/components/summary/DocumentInfoBar";
import type { DocumentInfo, SummaryLength, SummaryResult } from "@/types";

interface SummaryViewProps {
  documentInfo: DocumentInfo;
  summary: SummaryResult | null;
  length: SummaryLength;
  onLengthChange: (l: SummaryLength) => void;
  isSummarizing: boolean;
  onReset: () => void;
}

export function SummaryView({
  documentInfo,
  summary,
  length,
  onLengthChange,
  isSummarizing,
  onReset,
}: SummaryViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <DocumentInfoBar info={documentInfo} />

      <Card>
        <CardHeader className="flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold sm:text-base">
              Summary length
            </h2>
            <p className="text-xs text-muted-foreground">
              Choose how detailed the AI summary should be
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onReset}
            aria-label="Upload another document"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Upload another
          </Button>
        </CardHeader>
        <CardContent>
          <SummaryLengthSelector
            value={length}
            onChange={onLengthChange}
            disabled={isSummarizing}
          />
        </CardContent>
      </Card>

      {summary && !isSummarizing && (
        <>
          <Card>
            <CardHeader>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" aria-hidden />
              </span>
              <h3 className="text-sm font-semibold sm:text-base">Summary</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed sm:text-[15px]">
                {summary.summary}
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <ListSectionCard
              title="Key Ideas"
              icon={ListChecks}
              items={summary.keyIdeas}
              accentClassName="bg-primary/10 text-primary"
            />
            <ListSectionCard
              title="Main Highlights"
              icon={Star}
              items={summary.mainHighlights}
              accentClassName="bg-accent/10 text-accent"
            />
          </div>

          <ListSectionCard
            title="Improvement Suggestions"
            icon={Lightbulb}
            items={summary.improvementSuggestions}
            accentClassName="bg-warning/10 text-warning"
          />
        </>
      )}
    </motion.div>
  );
}
