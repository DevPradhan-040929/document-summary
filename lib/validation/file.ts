import type { SupportedMime } from "@/types";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_FILE_SIZE_LABEL = "10 MB";

export const SUPPORTED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"];

export const SUPPORTED_MIME_TYPES: SupportedMime[] = [
  "application/pdf",
  "image/png",
  "image/jpeg",
];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a file's extension, MIME type, and size.
 * Used on both the client (immediate feedback) and conceptually mirrored
 * on the server (see lib/validation/text.ts) since the file itself is
 * never uploaded to the server in this architecture — extraction happens
 * client-side. See README "Architecture" section for rationale.
 */
export function validateFile(file: File): FileValidationResult {
  if (!file) {
    return { valid: false, error: "No file was selected." };
  }

  if (file.size === 0) {
    return { valid: false, error: "This file is empty." };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `This file exceeds the ${MAX_FILE_SIZE_LABEL} limit.`,
    };
  }

  const name = file.name.toLowerCase();
  const hasValidExtension = SUPPORTED_EXTENSIONS.some((ext) =>
    name.endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      valid: false,
      error: "Please upload a PDF, PNG, or JPEG file.",
    };
  }

  const mime = file.type as SupportedMime;
  if (!SUPPORTED_MIME_TYPES.includes(mime)) {
    return {
      valid: false,
      error: "Please upload a PDF or image (PNG/JPEG).",
    };
  }

  return { valid: true };
}

export function getMimeCategory(mime: string): "pdf" | "image" | "unknown" {
  if (mime === "application/pdf") return "pdf";
  if (mime === "image/png" || mime === "image/jpeg") return "image";
  return "unknown";
}
