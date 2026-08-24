import { FileText, Image as ImageIcon, ScanText } from "lucide-react";
import { formatBytes } from "@/lib/utils/cn";
import type { DocumentInfo } from "@/types";

export function DocumentInfoBar({ info }: { info: DocumentInfo }) {
  const Icon = info.fileType === "application/pdf" ? FileText : ImageIcon;

  const methodLabel: Record<DocumentInfo["extractionMethod"], string> = {
    "pdf-text": "Extracted from PDF text",
    "ocr-image": "Extracted via OCR",
    "ocr-pdf-page": "Extracted via OCR (scanned PDF)",
    mixed: "Extracted via PDF text + OCR",
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-card px-4 py-3 text-xs sm:text-sm">
      <span className="flex items-center gap-1.5 font-medium">
        <Icon className="h-4 w-4 text-primary" aria-hidden />
        <span className="max-w-[14rem] truncate sm:max-w-xs">
          {info.fileName}
        </span>
      </span>
      <span className="text-muted-foreground">{formatBytes(info.fileSize)}</span>
      {info.pageCount && (
        <span className="text-muted-foreground">
          {info.pageCount} page{info.pageCount === 1 ? "" : "s"}
        </span>
      )}
      <span className="text-muted-foreground">
        {info.characterCount.toLocaleString()} characters
      </span>
      <span className="flex items-center gap-1 text-muted-foreground">
        <ScanText className="h-3.5 w-3.5" aria-hidden />
        {methodLabel[info.extractionMethod]}
      </span>
    </div>
  );
}
