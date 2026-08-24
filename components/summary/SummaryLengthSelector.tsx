"use client";

import { cn } from "@/lib/utils/cn";
import type { SummaryLength } from "@/types";

interface Props {
  value: SummaryLength;
  onChange: (v: SummaryLength) => void;
  disabled?: boolean;
}

const options: { value: SummaryLength; label: string; hint: string }[] = [
  { value: "short", label: "Short", hint: "Key takeaway only" },
  { value: "medium", label: "Medium", hint: "Balanced overview" },
  { value: "long", label: "Long", hint: "Detailed breakdown" },
];

export function SummaryLengthSelector({ value, onChange, disabled }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="Summary length"
      className="grid grid-cols-3 gap-2"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          role="radio"
          aria-checked={value === opt.value}
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={cn(
            "focus-ring flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            value === opt.value
              ? "border-primary bg-primary/10"
              : "border-border bg-card hover:bg-muted"
          )}
        >
          <span className="text-sm font-semibold">{opt.label}</span>
          <span className="text-xs text-muted-foreground">{opt.hint}</span>
        </button>
      ))}
    </div>
  );
}
