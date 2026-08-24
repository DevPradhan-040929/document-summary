import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

interface Props {
  title: string;
  icon: LucideIcon;
  items: string[];
  accentClassName?: string;
}

export function ListSectionCard({
  title,
  icon: Icon,
  items,
  accentClassName,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            accentClassName ?? "bg-primary/10 text-primary"
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <h3 className="text-sm font-semibold sm:text-base">{title}</h3>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2.5">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
              <span
                className={cn(
                  "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                  accentClassName ? accentClassName.split(" ")[0] : "bg-primary"
                )}
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
