export function EmptyHero() {
  return (
    <div className="mb-6 space-y-2 text-center sm:mb-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Summarize any document in seconds
      </h1>
      <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base">
        Upload a PDF or image. We&apos;ll extract the text, run OCR when
        needed, and use AI to generate a structured summary with key ideas
        and actionable suggestions.
      </p>
    </div>
  );
}
