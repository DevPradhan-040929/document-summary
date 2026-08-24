import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { z } from "zod";
import type { SummaryLength, SummaryResult } from "@/types";

const summarySchema = z.object({
  summary: z.string().min(1),
  keyIdeas: z.array(z.string().min(1)).min(1),
  mainHighlights: z.array(z.string().min(1)).min(1),
  improvementSuggestions: z.array(z.string().min(1)).min(1),
});

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: { type: SchemaType.STRING },
    keyIdeas: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    mainHighlights: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    improvementSuggestions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
  },
  required: ["summary", "keyIdeas", "mainHighlights", "improvementSuggestions"],
} as const;

const LENGTH_INSTRUCTIONS: Record<SummaryLength, string> = {
  short:
    "Write a very concise summary (2-3 sentences, roughly 40-70 words) containing only the single most important takeaway and any critical context. Provide 3 key ideas, 3 main highlights, and 2-3 improvement suggestions.",
  medium:
    "Write a balanced summary (1-2 short paragraphs, roughly 120-200 words) covering the important context and major ideas. Provide 4-6 key ideas, 4-6 main highlights, and 3-5 improvement suggestions.",
  long:
    "Write a detailed summary (3-5 paragraphs, roughly 300-450 words) that covers the document thoroughly while remaining substantially shorter than the source. Provide 6-9 key ideas, 6-9 main highlights, and 4-6 improvement suggestions.",
};

function buildPrompt(text: string, length: SummaryLength): string {
  return `You are a professional document analyst. Analyze the following document and produce a structured summary.

LENGTH REQUIREMENT: ${LENGTH_INSTRUCTIONS[length]}

Respond with STRICT JSON matching this shape, and nothing else:
{
  "summary": string,
  "keyIdeas": string[],
  "mainHighlights": string[],
  "improvementSuggestions": string[]
}

Rules:
- "keyIdeas" are the core concepts/ideas present in the document.
- "mainHighlights" are the most notable facts, findings, or takeaways.
- "improvementSuggestions" must be specific to THIS document only: missing information, areas needing clarification, potential risks, recommended next actions, important follow-ups, or opportunities for improvement. Do not give generic writing advice.
- Base everything strictly on the document content below. Do not invent facts.
- Do not include markdown formatting, backticks, or any text outside the JSON object.

DOCUMENT:
"""
${text}
"""`;
}

export class GeminiError extends Error {
  code: "MISSING_API_KEY" | "GEMINI_ERROR" | "RATE_LIMITED" | "PARSE_ERROR";
  constructor(
    message: string,
    code: "MISSING_API_KEY" | "GEMINI_ERROR" | "RATE_LIMITED" | "PARSE_ERROR"
  ) {
    super(message);
    this.code = code;
    this.name = "GeminiError";
  }
}

export async function generateSummary(
  text: string,
  length: SummaryLength
): Promise<SummaryResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new GeminiError(
      "Gemini API configuration is missing.",
      "MISSING_API_KEY"
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema as never,
      temperature: 0.3,
    },
  });

  let raw: string;
  try {
    const result = await model.generateContent(buildPrompt(text, length));
    raw = result.response.text();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/rate|quota|429/i.test(message)) {
      throw new GeminiError(
        "The AI service is temporarily unavailable due to rate limits. Please try again shortly.",
        "RATE_LIMITED"
      );
    }
    throw new GeminiError(
      "The AI service is temporarily unavailable. Please try again.",
      "GEMINI_ERROR"
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new GeminiError(
      "The AI returned an unexpected response format.",
      "PARSE_ERROR"
    );
  }

  const validated = summarySchema.safeParse(parsed);
  if (!validated.success) {
    throw new GeminiError(
      "The AI returned an unexpected response format.",
      "PARSE_ERROR"
    );
  }

  return validated.data;
}
