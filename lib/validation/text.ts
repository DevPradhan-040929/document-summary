export const MIN_TEXT_LENGTH = 40;
// Roughly 60k characters keeps us comfortably inside Gemini's context window
// and reduces latency/cost while still covering long documents.
export const MAX_TEXT_LENGTH = 60_000;

export interface TextValidationResult {
  valid: boolean;
  error?: string;
}

export function validateExtractedText(text: unknown): TextValidationResult {
  if (typeof text !== "string") {
    return { valid: false, error: "No extracted text was provided." };
  }

  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return {
      valid: false,
      error: "We couldn't extract readable text from this document.",
    };
  }

  if (trimmed.length < MIN_TEXT_LENGTH) {
    return {
      valid: false,
      error:
        "This document doesn't contain enough readable text to summarize.",
    };
  }

  if (trimmed.length > MAX_TEXT_LENGTH) {
    return { valid: false, error: "" }; // caller truncates instead of failing
  }

  return { valid: true };
}

/** Strips control characters and collapses excessive whitespace. */
export function sanitizeText(text: string): string {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function truncateText(text: string, maxLength = MAX_TEXT_LENGTH): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength);
}
