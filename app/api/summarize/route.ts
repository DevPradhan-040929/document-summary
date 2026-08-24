import { NextRequest, NextResponse } from "next/server";
import { generateSummary, GeminiError } from "@/lib/ai/gemini";
import {
  MAX_TEXT_LENGTH,
  sanitizeText,
  truncateText,
  validateExtractedText,
} from "@/lib/validation/text";
import type {
  ApiErrorCode,
  SummarizeRequestBody,
  SummarizeResponse,
  SummaryLength,
} from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const VALID_LENGTHS: SummaryLength[] = ["short", "medium", "long"];

function errorResponse(
  error: string,
  code: ApiErrorCode,
  status: number
): NextResponse<SummarizeResponse> {
  return NextResponse.json({ ok: false, error, code }, { status });
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<SummarizeResponse>> {
  let body: Partial<SummarizeRequestBody>;

  try {
    body = await req.json();
  } catch {
    return errorResponse(
      "The request body was not valid JSON.",
      "INVALID_INPUT",
      400
    );
  }

  const { text, summaryLength } = body;

  if (!summaryLength || !VALID_LENGTHS.includes(summaryLength)) {
    return errorResponse(
      "Please choose a valid summary length (short, medium, or long).",
      "INVALID_INPUT",
      400
    );
  }

  const textCheck = validateExtractedText(text);
  if (!textCheck.valid) {
    if (textCheck.error) {
      return errorResponse(textCheck.error, "TEXT_TOO_SHORT", 400);
    }
  }

  const sanitized = sanitizeText(text as string);
  const finalText =
    sanitized.length > MAX_TEXT_LENGTH ? truncateText(sanitized) : sanitized;

  try {
    const summary = await generateSummary(finalText, summaryLength);
    return NextResponse.json({ ok: true, data: summary }, { status: 200 });
  } catch (err) {
    if (err instanceof GeminiError) {
      const statusMap: Record<string, number> = {
        MISSING_API_KEY: 500,
        RATE_LIMITED: 429,
        GEMINI_ERROR: 502,
        PARSE_ERROR: 502,
      };
      return errorResponse(
        err.message,
        err.code,
        statusMap[err.code] ?? 500
      );
    }

    // Never leak internal stack traces to the client.
    return errorResponse(
      "An unexpected error occurred while generating the summary.",
      "UNKNOWN_ERROR",
      500
    );
  }
}
