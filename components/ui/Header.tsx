import { FileSearch2 } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <a
          href="/"
          className="focus-ring flex items-center gap-2 rounded-md"
          aria-label="Document Summary Assistant home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileSearch2 className="h-[18px] w-[18px]" aria-hidden />
          </span>
          <span className="text-sm font-semibold tracking-tight sm:text-base">
            Document Summary Assistant
          </span>
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}
