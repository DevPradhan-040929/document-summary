export type SummaryLength = "short" | "medium" | "long";

export type SupportedMime =
  | "application/pdf"
  | "image/png"
  | "image/jpeg";

export interface DocumentInfo {
  fileName: string;
  fileSize: number;
  fileType: SupportedMime;
  pageCount?: number;
  characterCount: number;
  extractionMethod: "pdf-text" | "ocr-image" | "ocr-pdf-page" | "mixed";
  ocrPagesUsed?: number[];
}

export interface SummaryResult {
  summary: string;
  keyIdeas: string[];
  mainHighlights: string[];
  improvementSuggestions: string[];
}

export interface SummarizeRequestBody {
  text: string;
  summaryLength: SummaryLength;
  documentInfo: Pick<DocumentInfo, "fileName" | "fileType" | "characterCount">;
}

export interface SummarizeSuccessResponse {
  ok: true;
  data: SummaryResult;
}

export interface SummarizeErrorResponse {
  ok: false;
  error: string;
  code: ApiErrorCode;
}

export type SummarizeResponse = SummarizeSuccessResponse | SummarizeErrorResponse;

export type ApiErrorCode =
  | "INVALID_INPUT"
  | "TEXT_TOO_SHORT"
  | "TEXT_TOO_LONG"
  | "MISSING_API_KEY"
  | "GEMINI_ERROR"
  | "RATE_LIMITED"
  | "PARSE_ERROR"
  | "UNKNOWN_ERROR";

export type ProcessingStage =
  | "idle"
  | "validating"
  | "extracting-text"
  | "running-ocr"
  | "ready"
  | "summarizing"
  | "done"
  | "error";

export interface ExtractionResult {
  text: string;
  documentInfo: DocumentInfo;
}

export interface AppError {
  message: string;
  code: ApiErrorCode | "CLIENT_ERROR";
}
