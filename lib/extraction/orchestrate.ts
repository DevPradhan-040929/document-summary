import { extractPdfText, renderPdfPageToImage } from "@/lib/extraction/pdf";
import { runOcr } from "@/lib/ocr/tesseract";
import { getMimeCategory } from "@/lib/validation/file";
import { sanitizeText } from "@/lib/validation/text";
import type { DocumentInfo, ExtractionResult, SupportedMime } from "@/types";

export type ExtractionProgressStage =
  | "reading-pdf"
  | "ocr-image"
  | "ocr-page";

export interface ExtractionProgress {
  stage: ExtractionProgressStage;
  detail: string;
  progress?: number;
}

// Cap the number of scanned pages we OCR to keep processing time reasonable
// in the browser. Documented as a known limitation in the README.
const MAX_OCR_PAGES = 8;

export async function processDocument(
  file: File,
  onProgress?: (p: ExtractionProgress) => void
): Promise<ExtractionResult> {
  const category = getMimeCategory(file.type);

  if (category === "image") {
    onProgress?.({ stage: "ocr-image", detail: "Reading image with OCR…", progress: 0 });
    const text = await runOcr(file, (p) =>
      onProgress?.({
        stage: "ocr-image",
        detail: `Reading image with OCR… (${p.status})`,
        progress: p.progress,
      })
    );

    const documentInfo: DocumentInfo = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type as SupportedMime,
      characterCount: text.length,
      extractionMethod: "ocr-image",
    };

    return { text, documentInfo };
  }

  if (category === "pdf") {
    onProgress?.({ stage: "reading-pdf", detail: "Extracting text from PDF…" });
    const result = await extractPdfText(file);

    const scannedPages = result.pages.filter((p) => p.isLikelyScanned);
    const hasEnoughNativeText = result.fullText.length >= 80;

    if (scannedPages.length === 0 || hasEnoughNativeText) {
      const documentInfo: DocumentInfo = {
        fileName: file.name,
        fileSize: file.size,
        fileType: "application/pdf",
        pageCount: result.pageCount,
        characterCount: result.fullText.length,
        extractionMethod: "pdf-text",
      };
      return { text: result.fullText, documentInfo };
    }

    // Scanned/image-only PDF: fall back to OCR, page by page, up to a cap.
    const pagesToOcr = scannedPages.slice(0, MAX_OCR_PAGES);
    const ocrTexts: string[] = [];
    const ocrPagesUsed: number[] = [];

    for (let i = 0; i < pagesToOcr.length; i++) {
      const page = pagesToOcr[i];
      onProgress?.({
        stage: "ocr-page",
        detail: `Running OCR on page ${page.pageNumber} (${i + 1}/${pagesToOcr.length})…`,
        progress: i / pagesToOcr.length,
      });

      try {
        const dataUrl = await renderPdfPageToImage(file, page.pageNumber);
        const text = await runOcr(dataUrl);
        ocrTexts.push(text);
        ocrPagesUsed.push(page.pageNumber);
      } catch {
        // Skip pages that fail OCR rather than failing the whole document.
        continue;
      }
    }

    const combined = sanitizeText(
      [
        result.fullText,
        ...ocrTexts,
      ]
        .filter(Boolean)
        .join("\n\n")
    );

    if (combined.length === 0) {
      throw new Error(
        "We couldn't extract readable text from this document, even with OCR."
      );
    }

    const documentInfo: DocumentInfo = {
      fileName: file.name,
      fileSize: file.size,
      fileType: "application/pdf",
      pageCount: result.pageCount,
      characterCount: combined.length,
      extractionMethod: result.fullText.length > 0 ? "mixed" : "ocr-pdf-page",
      ocrPagesUsed,
    };

    return { text: combined, documentInfo };
  }

  throw new Error("Unsupported file type.");
}
