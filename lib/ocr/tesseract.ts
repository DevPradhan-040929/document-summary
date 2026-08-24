import { sanitizeText } from "@/lib/validation/text";

export interface OcrProgress {
  status: string;
  progress: number; // 0-1
}

const MIN_OCR_TEXT_LENGTH = 15;

/**
 * Runs Tesseract.js OCR on an image source (File, Blob, or data URL).
 * Runs entirely client-side via WebAssembly — no server round trip,
 * which keeps this compatible with serverless request-duration limits.
 */
export async function runOcr(
  source: File | Blob | string,
  onProgress?: (p: OcrProgress) => void
): Promise<string> {
  const Tesseract = await import("tesseract.js");

  let worker;
  try {
    worker = await Tesseract.createWorker("eng", 1, {
      logger: (m) => {
        if (onProgress && typeof m.progress === "number") {
          onProgress({ status: m.status, progress: m.progress });
        }
      },
    });
  } catch (err) {
    throw new Error(
      "OCR processing failed to initialize. Please try again."
    );
  }

  try {
    const { data } = await worker.recognize(source);
    const cleaned = sanitizeText(data.text ?? "");

    if (cleaned.length < MIN_OCR_TEXT_LENGTH) {
      throw new Error(
        "OCR couldn't find readable text in this image. Try a clearer scan."
      );
    }

    return cleaned;
  } catch (err) {
    if (err instanceof Error && err.message.includes("readable text")) {
      throw err;
    }
    throw new Error("OCR processing failed. Please try another image.");
  } finally {
    await worker.terminate();
  }
}
