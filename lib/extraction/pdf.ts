import { sanitizeText } from "@/lib/validation/text";

// pdf.js runs entirely in the browser here. This is a deliberate deviation
// from the "pdf-parse" suggestion in the brief: pdf-parse is a Node-only
// library that reads the whole buffer into memory on the server, which is
// fragile under serverless request-size/duration limits (Vercel/Netlify).
// Running extraction client-side removes that constraint entirely and lets
// us reuse the same PDF.js render pipeline for the scanned-page OCR
// fallback below. This tradeoff is documented in the README.

export interface PdfExtractionPageResult {
  pageNumber: number;
  text: string;
  isLikelyScanned: boolean;
}

export interface PdfExtractionResult {
  pages: PdfExtractionPageResult[];
  fullText: string;
  pageCount: number;
}

const MIN_CHARS_PER_PAGE_TO_SKIP_OCR = 20;

async function getPdfjs() {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
  return pdfjsLib;
}

export async function extractPdfText(
  file: File
): Promise<PdfExtractionResult> {
  const pdfjsLib = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();

  let doc;
  try {
    doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  } catch (err) {
    throw new Error(
      "This PDF appears to be corrupted or is not a valid PDF file."
    );
  }

  const pages: PdfExtractionPageResult[] = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const rawText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    const text = sanitizeText(rawText);

    pages.push({
      pageNumber: pageNum,
      text,
      isLikelyScanned: text.length < MIN_CHARS_PER_PAGE_TO_SKIP_OCR,
    });
  }

  const fullText = sanitizeText(pages.map((p) => p.text).join("\n\n"));

  return {
    pages,
    fullText,
    pageCount: doc.numPages,
  };
}

/** Renders a single PDF page to a PNG data URL for OCR fallback. */
export async function renderPdfPageToImage(
  file: File,
  pageNumber: number,
  scale = 2
): Promise<string> {
  const pdfjsLib = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not create a canvas context for OCR rendering.");
  }

  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toDataURL("image/png");
}
