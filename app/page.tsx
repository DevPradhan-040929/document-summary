"use client";

import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Header } from "@/components/ui/Header";
import { EmptyHero } from "@/components/ui/EmptyHero";
import { UploadZone } from "@/components/upload/UploadZone";
import { ProcessingStatus } from "@/components/upload/ProcessingStatus";
import { ErrorState } from "@/components/ui/ErrorState";
import { SummaryView } from "@/components/summary/SummaryView";
import { useToast } from "@/components/ui/Toast";
import { processDocument } from "@/lib/extraction/orchestrate";
import type {
  DocumentInfo,
  ProcessingStage,
  SummaryLength,
  SummaryResult,
  SummarizeResponse,
} from "@/types";

export default function Home() {
  const { showToast } = useToast();

  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [detail, setDetail] = useState<string>();
  const [progress, setProgress] = useState<number>();
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null);
  const [summaryLength, setSummaryLength] = useState<SummaryLength>("medium");
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const reset = useCallback(() => {
    setStage("idle");
    setDetail(undefined);
    setProgress(undefined);
    setFile(null);
    setExtractedText("");
    setDocumentInfo(null);
    setSummary(null);
    setErrorMessage("");
  }, []);

  const requestSummary = useCallback(
    async (text: string, length: SummaryLength, info: DocumentInfo) => {
      setStage("summarizing");
      setSummary(null);
      try {
        const res = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            summaryLength: length,
            documentInfo: {
              fileName: info.fileName,
              fileType: info.fileType,
              characterCount: info.characterCount,
            },
          }),
        });

        const data: SummarizeResponse = await res.json();

        if (!data.ok) {
          setStage("error");
          setErrorMessage(data.error);
          showToast(data.error, "error");
          return;
        }

        setSummary(data.data);
        setStage("done");
      } catch {
        setStage("error");
        const msg = "We couldn't reach the AI service. Please try again.";
        setErrorMessage(msg);
        showToast(msg, "error");
      }
    },
    [showToast]
  );

  const handleFileSelected = useCallback(
    async (selectedFile: File) => {
      setFile(selectedFile);
      setErrorMessage("");
      setStage("extracting-text");
      setDetail("Reading document…");
      setProgress(undefined);

      try {
        const result = await processDocument(selectedFile, (p) => {
          setStage(
            p.stage === "reading-pdf" ? "extracting-text" : "running-ocr"
          );
          setDetail(p.detail);
          setProgress(p.progress);
        });

        setExtractedText(result.text);
        setDocumentInfo(result.documentInfo);
        setStage("ready");

        await requestSummary(result.text, summaryLength, result.documentInfo);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "We couldn't process this document. Please try another file.";
        setStage("error");
        setErrorMessage(msg);
        showToast(msg, "error");
      }
    },
    [requestSummary, summaryLength, showToast]
  );

  const handleLengthChange = useCallback(
    (length: SummaryLength) => {
      setSummaryLength(length);
      if (documentInfo && extractedText) {
        requestSummary(extractedText, length, documentInfo);
      }
    },
    [documentInfo, extractedText, requestSummary]
  );

  const handleRetry = useCallback(() => {
    if (file) {
      handleFileSelected(file);
    } else {
      reset();
    }
  }, [file, handleFileSelected, reset]);

  const showUpload = stage === "idle";
  const showProcessing =
    stage === "validating" ||
    stage === "extracting-text" ||
    stage === "running-ocr" ||
    (stage === "summarizing" && !summary);
  const showError = stage === "error";
  const showSummary =
    documentInfo &&
    (stage === "done" ||
      stage === "ready" ||
      (stage === "summarizing" && summary));

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {showUpload && (
          <>
            <EmptyHero />
            <UploadZone
              onFileSelected={handleFileSelected}
              onValidationError={(msg) => showToast(msg, "error")}
            />
          </>
        )}

        <AnimatePresence mode="wait">
          {showProcessing && (
            <div className="mt-4">
              <ProcessingStatus
                stage={stage}
                detail={detail}
                progress={progress}
                fileName={file?.name}
              />
            </div>
          )}
        </AnimatePresence>

        {showError && (
          <div className="mt-4 space-y-4">
            <ErrorState message={errorMessage} onRetry={handleRetry} />
            <div className="text-center">
              <button
                onClick={reset}
                className="focus-ring text-sm text-primary underline-offset-4 hover:underline rounded"
              >
                Upload a different document
              </button>
            </div>
          </div>
        )}

        {showSummary && documentInfo && (
          <div className="mt-4">
            <SummaryView
              documentInfo={documentInfo}
              summary={summary}
              length={summaryLength}
              onLengthChange={handleLengthChange}
              isSummarizing={stage === "summarizing"}
              onReset={reset}
            />
          </div>
        )}
      </main>
    </div>
  );
}
