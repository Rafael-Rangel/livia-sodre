import { cn } from "@/lib/utils";
import type { LucideIcon } from "@/lib/icons";

type Tone = "gold" | "cream" | "dark" | "soft" | "white";

export function IconBubble({
  icon: Icon,
  className,
  size = 18,
  tone = "gold",
}: {
  icon: LucideIcon;
  className?: string;
  size?: number;
  tone?: Tone;
}) {
  return (
    <span
      className={cn("icon-bubble", `icon-bubble--${tone}`, className)}
      aria-hidden
    >
      <Icon size={size} strokeWidth={1.6} />
    </span>
  );
}
